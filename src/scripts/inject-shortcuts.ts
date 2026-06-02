import fs from "fs";

const manifestPath = "build/manifest.webapp";
const shortcutsPath = "shortcuts.json";

type Shortcut = { name: string; url: string };
type Manifest = Record<string, unknown> & { shortcuts?: Shortcut[] };

const manifest: Manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const shortcuts: Shortcut[] = JSON.parse(fs.readFileSync(shortcutsPath, "utf8"));

manifest.shortcuts = shortcuts;

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
