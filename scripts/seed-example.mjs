/**
 * Seeder contoh: 20 peserta + sesi ujian + pendaftaran + hasil
 * Jalankan: npm run seed
 */
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const DB_PATH = path.join(DATA_DIR, "app.db");

const PRODI = [
  "Teknik Informatika",
  "Sistem Informasi",
  "Manajemen",
  "Hukum Islam",
  "Pendidikan Agama Islam",
];

const PESERTA_NAMES = [
  "Budi Santoso",
  "Siti Rahayu",
  "Ahmad Wijaya",
  "Dewi Lestari",
  "Rizki Pratama",
  "Nurul Hidayah",
  "Fajar Nugroho",
  "Maya Sari",
  "Hendra Gunawan",
  "Putri Anggraini",
  "Agus Salim",
  "Rina Wulandari",
  "Dedi Kurniawan",
  "Fitri Handayani",
  "Yoga Pratama",
  "Lina Marlina",
  "Bambang Sutrisno",
  "Eka Putri",
  "Joko Widodo",
  "Sri Mulyani",
];

function buildPeserta() {
  return PESERTA_NAMES.map((nama, i) => {
    const no = String(i + 1).padStart(2, "0");
    return {
      nama,
      email: `peserta${no}@uniks.ac.id`,
      password: "peserta123",
      nomor_identitas: `20210${String(i + 1).padStart(3, "0")}`,
      prodi: PRODI[i % PRODI.length],
      no_hp: `0812${String(1000000 + i).slice(-7)}`,
    };
  });
}

const SESI_UJIAN = [
  {
    jenis: "ICT",
    tanggal: "2026-06-15 08:00:00",
    kuota: 30,
    lokasi: "Lab Komputer LP3M, Gedung A Lantai 2",
  },
  {
    jenis: "ICT",
    tanggal: "2026-07-10 08:00:00",
    kuota: 25,
    lokasi: "Lab Komputer LP3M, Gedung A Lantai 2",
  },
  {
    jenis: "TOEFL",
    tanggal: "2026-06-20 09:00:00",
    kuota: 30,
    lokasi: "Ruang Ujian LP3M, Gedung B",
  },
  {
    jenis: "TOEFL",
    tanggal: "2026-07-15 09:00:00",
    kuota: 20,
    lokasi: "Ruang Ujian LP3M, Gedung B",
  },
];

// [pendaftaran_index]: { sesiIndex, status, alasan?, hasil? }
const PENDAFTARAN_PLAN = [
  { sesiIndex: 0, status: "terverifikasi", nilai: "85", kelulusan: "lulus" },
  { sesiIndex: 0, status: "terverifikasi", nilai: "78", kelulusan: "lulus" },
  { sesiIndex: 0, status: "terverifikasi", nilai: "92", kelulusan: "lulus" },
  { sesiIndex: 0, status: "terverifikasi", nilai: "65", kelulusan: "tidak_lulus" },
  { sesiIndex: 0, status: "terverifikasi", nilai: "88", kelulusan: "lulus" },
  { sesiIndex: 0, status: "terverifikasi", nilai: "72", kelulusan: "lulus" },
  { sesiIndex: 0, status: "terverifikasi", nilai: "55", kelulusan: "tidak_lulus" },
  { sesiIndex: 0, status: "terverifikasi", nilai: "90", kelulusan: "lulus" },
  { sesiIndex: 0, status: "terverifikasi", nilai: "81", kelulusan: "lulus" },
  { sesiIndex: 0, status: "terverifikasi", nilai: "76", kelulusan: "lulus" },
  { sesiIndex: 2, status: "terverifikasi", nilai: "520", kelulusan: "lulus" },
  { sesiIndex: 2, status: "terverifikasi", nilai: "480", kelulusan: "lulus" },
  { sesiIndex: 2, status: "terverifikasi", nilai: "450", kelulusan: "tidak_lulus" },
  { sesiIndex: 2, status: "terverifikasi", nilai: "510", kelulusan: "lulus" },
  { sesiIndex: 2, status: "terverifikasi", nilai: "495", kelulusan: "lulus" },
  { sesiIndex: 1, status: "menunggu_verifikasi" },
  { sesiIndex: 3, status: "menunggu_verifikasi" },
  { sesiIndex: 2, status: "menunggu_verifikasi" },
  {
    sesiIndex: 0,
    status: "ditolak",
    alasan: "Dokumen pendaftaran tidak lengkap",
  },
  { sesiIndex: 1, status: "terverifikasi" }, // belum ada hasil   untuk uji input massal
];

function main() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma("foreign_keys = ON");

  const marker = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get("peserta20@uniks.ac.id");

  if (marker) {
    console.log("Seeder example sudah pernah dijalankan (peserta20@uniks.ac.id ada).");
    console.log("Hapus data peserta01–20 manual atau reset DB jika ingin seed ulang.");
    db.close();
    return;
  }

  // Pastikan admin & jenis ujian ada
  let admin = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
  if (!admin) {
    const hash = bcrypt.hashSync("admin123", 10);
    const r = db
      .prepare(
        "INSERT INTO users (nama, email, password_hash, role) VALUES (?, ?, ?, ?)"
      )
      .run("Admin LP3M", "admin@lp3m.uniks.ac.id", hash, "admin");
    admin = { id: r.lastInsertRowid };
  }

  db.prepare("INSERT OR IGNORE INTO jenis_ujian (nama_ujian) VALUES ('ICT')").run();
  db.prepare("INSERT OR IGNORE INTO jenis_ujian (nama_ujian) VALUES ('TOEFL')").run();

  const jenisMap = Object.fromEntries(
    db.prepare("SELECT id, nama_ujian FROM jenis_ujian").all().map((j) => [j.nama_ujian, j.id])
  );

  const insertSesi = db.prepare(
    "INSERT INTO sesi_ujian (jenis_ujian_id, tanggal, kuota, lokasi) VALUES (?, ?, ?, ?)"
  );
  const sesiIds = SESI_UJIAN.map((s) =>
    insertSesi.run(jenisMap[s.jenis], s.tanggal, s.kuota, s.lokasi).lastInsertRowid
  );

  const insertUser = db.prepare(
    "INSERT INTO users (nama, email, password_hash, role) VALUES (?, ?, ?, 'peserta')"
  );
  const insertProfil = db.prepare(
    "INSERT INTO peserta_profil (user_id, nomor_identitas, prodi, no_hp) VALUES (?, ?, ?, ?)"
  );
  const insertPendaftaran = db.prepare(
    "INSERT INTO pendaftaran (peserta_id, sesi_ujian_id, status, alasan_penolakan) VALUES (?, ?, ?, ?)"
  );
  const insertHasil = db.prepare(
    "INSERT INTO hasil_ujian (pendaftaran_id, nilai, status_kelulusan, tanggal_publish) VALUES (?, ?, ?, datetime('now'))"
  );

  const passwordHash = bcrypt.hashSync("peserta123", 10);
  const pesertaList = buildPeserta();
  const userIds = [];

  const tx = db.transaction(() => {
    for (const p of pesertaList) {
      const u = insertUser.run(p.nama, p.email, passwordHash);
      const userId = u.lastInsertRowid;
      insertProfil.run(userId, p.nomor_identitas, p.prodi, p.no_hp);
      userIds.push(userId);
    }

    pesertaList.forEach((_, i) => {
      const plan = PENDAFTARAN_PLAN[i];
      const pendaftaranId = insertPendaftaran.run(
        userIds[i],
        sesiIds[plan.sesiIndex],
        plan.status,
        plan.alasan || null
      ).lastInsertRowid;

      if (plan.status === "terverifikasi" && plan.nilai && plan.kelulusan) {
        insertHasil.run(pendaftaranId, plan.nilai, plan.kelulusan);
      }
    });
  });

  tx();
  db.close();

  console.log("✓ Seeder example berhasil!");
  console.log("");
  console.log("Data yang dibuat:");
  console.log("  • 20 peserta (peserta01@uniks.ac.id – peserta20@uniks.ac.id)");
  console.log("  • 4 sesi ujian (2 ICT, 2 TOEFL)");
  console.log("  • 20 pendaftaran (beragam status)");
  console.log("  • 15 hasil ujian terpublish");
  console.log("");
  console.log("Login peserta contoh:");
  console.log("  Email   : peserta01@uniks.ac.id");
  console.log("  Password: peserta123");
  console.log("");
  console.log("Login admin:");
  console.log("  Email   : admin@lp3m.uniks.ac.id");
  console.log("  Password: admin123");
}

main();
