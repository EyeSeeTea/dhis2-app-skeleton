import fs from "fs";

const potPath = "i18n/en.pot";
const shortcutsPath = "shortcuts.json";

type Shortcut = { name: string; url: string };

const shortcuts: Shortcut[] = JSON.parse(fs.readFileSync(shortcutsPath, "utf8"));
const potContent = fs.readFileSync(potPath, "utf8");

const newEntries = shortcuts
    .map(s => `__MANIFEST_SHORTCUT_${s.name}`)
    .filter(key => !potContent.includes(`msgid "${key}"`))
    .map(key => `\nmsgid "${key}"\nmsgstr ""\n`)
    .join("");

if (newEntries) {
    fs.writeFileSync(potPath, potContent + newEntries);
}
