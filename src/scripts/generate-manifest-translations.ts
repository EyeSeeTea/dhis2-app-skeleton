import fs from "fs";
import path from "path";

type Shortcut = { name: string; url: string };
type LocaleTranslation = { locale: string; shortcuts: Record<string, string> };

const shortcutsPath = "shortcuts.json";
const i18nDir = "i18n";
const outputPath = "build/manifest.webapp.translations.json";

const shortcuts: Shortcut[] = JSON.parse(fs.readFileSync(shortcutsPath, "utf8"));

function parsePoShortcuts(content: string): Record<string, string> {
    const result: Record<string, string> = {};
    const pattern = /msgid\s+"(__MANIFEST_SHORTCUT_[^"]+)"\s+msgstr\s+"([^"]+)"/g;
    let match;
    while ((match = pattern.exec(content)) !== null) {
        const [, rawKey, value] = match as unknown as [string, string, string];
        const key = rawKey.replace(/^__MANIFEST_SHORTCUT_/, "");
        result[key] = value;
    }
    return result;
}

const translations: LocaleTranslation[] = [
    { locale: "en", shortcuts: Object.fromEntries(shortcuts.map(s => [s.name, s.name])) },
];

const poFiles = fs.readdirSync(i18nDir).filter(f => f.endsWith(".po"));

for (const file of poFiles) {
    const locale = path.basename(file, ".po");
    const content = fs.readFileSync(path.join(i18nDir, file), "utf8");
    translations.push({ locale, shortcuts: parsePoShortcuts(content) });
}

fs.writeFileSync(outputPath, JSON.stringify(translations, null, 2));
