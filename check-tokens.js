#!/usr/bin/env node
// check-tokens.js
// Lance avant chaque merge Lovable → main :
//   node check-tokens.js
//
// Vérifie qu'aucune couleur hex n'est hardcodée hors des fichiers autorisés.

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const ALLOWED_FILES = [
  "src/design-tokens.js",
  "config/rapport.config.js",
  // Ajouter ici tout fichier autorisé à contenir des hex bruts
];

const HEX_PATTERN = /#[0-9A-Fa-f]{3,8}\b/g;

function getAllFiles(dir, exts = [".js", ".jsx", ".ts", ".tsx"]) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (["node_modules", "dist", ".git"].includes(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...getAllFiles(full, exts));
    else if (exts.includes(extname(entry))) files.push(full);
  }
  return files;
}

const root = process.cwd();
const files = getAllFiles(root);
let violations = 0;

for (const file of files) {
  const rel = file.replace(root + "/", "");
  if (ALLOWED_FILES.some(a => rel.endsWith(a))) continue;

  const content = readFileSync(file, "utf8");
  const matches = [...content.matchAll(HEX_PATTERN)];
  if (matches.length > 0) {
    console.log(`\n❌ ${rel}`);
    matches.forEach(m => {
      const line = content.slice(0, m.index).split("\n").length;
      console.log(`   ligne ${line}: ${m[0]}`);
    });
    violations += matches.length;
  }
}

if (violations === 0) {
  console.log("✅ Aucune couleur hardcodée détectée hors des fichiers autorisés.");
  process.exit(0);
} else {
  console.log(`\n⚠️  ${violations} couleur(s) hardcodée(s) détectée(s).`);
  console.log("   → Déplacer vers src/design-tokens.js avant de merger.");
  process.exit(1);
}
