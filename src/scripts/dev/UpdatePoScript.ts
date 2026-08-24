import fs from "fs";
import path from "path";
import { po, GetTextTranslation, GetTextTranslations } from "gettext-parser";

type TranslationRecord = GetTextTranslations["translations"];

const i18nDir = "i18n";
const potFileName = "en.pot";

/* Merge the extracted en.pot into every i18n/*.po, keeping existing translations.

   This replaces `find i18n/ -name '*.po' -exec msgmerge ...`, which required both a
   POSIX `find` and the GNU gettext binaries. Note that, unlike msgmerge, no fuzzy
   matching is performed: a reworded msgid is treated as a new entry, and its former
   translation is kept as an obsolete (#~) block instead of being offered as a match.
*/
function main() {
    const potPath = path.join(i18nDir, potFileName);
    const pot = po.parse(fs.readFileSync(potPath));

    const poFileNames = fs
        .readdirSync(i18nDir)
        .filter(fileName => fileName.endsWith(".po"))
        .sort();

    for (const fileName of poFileNames) {
        const filePath = path.join(i18nDir, fileName);
        const existing = po.parse(fs.readFileSync(filePath));
        const merged = merge({ pot, existing });
        fs.writeFileSync(filePath, po.compile(merged, { sort: false }));
        console.info(`Updated: ${filePath}`);
    }
}

function merge(options: {
    pot: GetTextTranslations;
    existing: GetTextTranslations;
}): GetTextTranslations {
    const { pot, existing } = options;
    const translations: TranslationRecord = {};
    const pluralCount = getPluralCount(existing);

    for (const [msgctxt, potEntries] of Object.entries(pot.translations)) {
        translations[msgctxt] = {};

        for (const [msgid, potEntry] of Object.entries(potEntries)) {
            const previous =
                getEntry(existing.translations, msgctxt, msgid) ??
                getEntry(existing.obsolete, msgctxt, msgid);

            translations[msgctxt][msgid] = {
                ...potEntry,
                msgstr: mergeMsgstr(potEntry, previous, pluralCount),
                comments: mergeComments(potEntry, previous),
            };
        }
    }

    return {
        charset: existing.charset,
        headers: mergeHeaders(options),
        translations: translations,
        obsolete: getObsolete({ pot, existing }),
    };
}

/* Keep the .po headers (language, revision date, plural forms), refreshing only the
   creation date of the template, as msgmerge does. */
function mergeHeaders(options: { pot: GetTextTranslations; existing: GetTextTranslations }) {
    const { pot, existing } = options;
    const potCreationDate = pot.headers["POT-Creation-Date"];

    return potCreationDate
        ? { ...existing.headers, "POT-Creation-Date": potCreationDate }
        : existing.headers;
}

/* An entry no longer present in the template is commented out (#~) rather than dropped,
   so its translation survives and is reused if the msgid comes back. Untranslated
   entries are not worth keeping. */
function getObsolete(options: {
    pot: GetTextTranslations;
    existing: GetTextTranslations;
}): TranslationRecord {
    const { pot, existing } = options;
    const obsolete: TranslationRecord = {};
    const sections = [existing.translations, existing.obsolete ?? {}];

    for (const section of sections) {
        for (const [msgctxt, entries] of Object.entries(section)) {
            for (const [msgid, entry] of Object.entries(entries)) {
                const isHeader = msgctxt === "" && msgid === "";
                const isStillUsed = Boolean(getEntry(pot.translations, msgctxt, msgid));
                if (isHeader || isStillUsed || !isTranslated(entry)) continue;

                obsolete[msgctxt] = { ...obsolete[msgctxt], [msgid]: entry };
            }
        }
    }

    return obsolete;
}

function getEntry(
    record: TranslationRecord | undefined,
    msgctxt: string,
    msgid: string
): GetTextTranslation | undefined {
    return record?.[msgctxt]?.[msgid];
}

/* As msgmerge does, take the references and extracted comments from the template, and
   the translator comments and flags (notably `#, fuzzy`) from the .po file. Dropping the
   fuzzy flag here would silently turn a match flagged for review into an approved
   translation. */
function mergeComments(potEntry: GetTextTranslation, previous: GetTextTranslation | undefined) {
    const comments = {
        translator: previous?.comments?.translator,
        reference: potEntry.comments?.reference,
        extracted: potEntry.comments?.extracted,
        flag: previous?.comments?.flag,
        previous: previous?.comments?.previous,
    };

    const entries = Object.entries(comments).filter(([_key, value]) => value !== undefined);

    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

/* The number of plural forms is a property of the target language, declared in the .po
   header, not of the English template: es needs 2 forms, pl needs 3. Sizing the msgstr
   array from the template instead would emit too few forms for such a language; that
   passes while the entry is empty, then becomes a fatal msgfmt error ("nplurals = 3 ...
   but some messages have only 2 plural forms") as soon as a translator fills it in. */
function getPluralCount(existing: GetTextTranslations): number {
    const match = existing.headers["Plural-Forms"]?.match(/nplurals\s*=\s*(\d+)/);
    const pluralCount = Number(match?.[1]);

    return Number.isInteger(pluralCount) && pluralCount > 0 ? pluralCount : 2;
}

function mergeMsgstr(
    potEntry: GetTextTranslation,
    previous: GetTextTranslation | undefined,
    pluralCount: number
) {
    const previousMsgstr = previous?.msgstr ?? [];
    const length = potEntry.msgid_plural ? pluralCount : 1;

    return Array.from({ length: length }, (_value, index) => previousMsgstr[index] ?? "");
}

function isTranslated(entry: GetTextTranslation): boolean {
    return entry.msgstr.some(msgstr => msgstr !== "");
}

main();
