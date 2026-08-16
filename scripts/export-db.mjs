/**
 * Export database SQLite (termasuk data WAL) ke file .db tunggal.
 * Jalankan: npm run db:export
 */
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const SRC = path.join(DATA_DIR, "app.db");
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const DEST = path.join(DATA_DIR, `app-export-${stamp}.db`);

if (!fs.existsSync(SRC)) {
  console.error("Database tidak ditemukan:", SRC);
  process.exit(1);
}

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(SRC);
db.pragma("wal_checkpoint(FULL)");
await db.backup(DEST);
db.close();

const tables = new Database(DEST, { readonly: true });
const names = tables
  .prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  )
  .all();

console.log("✓ Export berhasil");
console.log("");
console.log("File :", DEST);
console.log("Size :", (fs.statSync(DEST).size / 1024).toFixed(1), "KB");
console.log("");
console.log("Isi tabel:");
for (const t of names) {
  const count = tables.prepare(`SELECT COUNT(*) as c FROM "${t.name}"`).get().c;
  console.log(`  • ${t.name}: ${count} baris`);
}
tables.close();
