import "server-only";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
import { ROLES, JENIS_UJIAN, KATEGORI_PENGUMUMAN } from "./constants";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "app.db");

let db;

function runMigrations(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'peserta')),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS peserta_profil (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
      nomor_identitas TEXT,
      prodi TEXT,
      no_hp TEXT
    );

    CREATE TABLE IF NOT EXISTS jenis_ujian (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama_ujian TEXT NOT NULL UNIQUE CHECK(nama_ujian IN ('ICT', 'TOEFL'))
    );

    CREATE TABLE IF NOT EXISTS sesi_ujian (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jenis_ujian_id INTEGER NOT NULL REFERENCES jenis_ujian(id),
      tanggal TEXT NOT NULL,
      kuota INTEGER NOT NULL DEFAULT 0,
      lokasi TEXT
    );

    CREATE TABLE IF NOT EXISTS pendaftaran (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      peserta_id INTEGER NOT NULL REFERENCES users(id),
      sesi_ujian_id INTEGER NOT NULL REFERENCES sesi_ujian(id),
      status TEXT NOT NULL DEFAULT 'menunggu_verifikasi'
        CHECK(status IN ('menunggu_verifikasi', 'terverifikasi', 'ditolak')),
      alasan_penolakan TEXT,
      dokumen_path TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(peserta_id, sesi_ujian_id)
    );

    CREATE TABLE IF NOT EXISTS hasil_ujian (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pendaftaran_id INTEGER NOT NULL UNIQUE REFERENCES pendaftaran(id),
      nilai TEXT,
      status_kelulusan TEXT CHECK(status_kelulusan IN ('lulus', 'tidak_lulus')),
      tanggal_publish TEXT
    );

    CREATE TABLE IF NOT EXISTS pengumuman (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      judul TEXT NOT NULL,
      isi TEXT NOT NULL,
      kategori TEXT NOT NULL DEFAULT 'terbaru'
        CHECK(kategori IN ('terbaru', 'jadwal', 'hasil_ujian')),
      dibuat_oleh INTEGER NOT NULL REFERENCES users(id),
      tanggal_publish TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS aktivitas_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      aksi TEXT NOT NULL,
      detail TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS galeri_dokumentasi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      judul TEXT NOT NULL,
      deskripsi TEXT,
      gambar_url TEXT NOT NULL,
      kategori TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  migrateColumns(database);
}

function migrateColumns(database) {
  const pengumumanCols = database.pragma("table_info(pengumuman)");
  if (!pengumumanCols.find((c) => c.name === "kategori")) {
    database.exec(
      "ALTER TABLE pengumuman ADD COLUMN kategori TEXT NOT NULL DEFAULT 'terbaru'"
    );
  }
}

function seedData(database) {
  const adminExists = database
    .prepare("SELECT id FROM users WHERE role = ? LIMIT 1")
    .get(ROLES.ADMIN);

  if (!adminExists) {
    const hash = bcrypt.hashSync("admin123", 10);
    database
      .prepare(
        "INSERT INTO users (nama, email, password_hash, role) VALUES (?, ?, ?, ?)"
      )
      .run("Admin LP3M", "admin@lp3m.uniks.ac.id", hash, ROLES.ADMIN);
  }

  for (const jenis of JENIS_UJIAN) {
    database
      .prepare("INSERT OR IGNORE INTO jenis_ujian (nama_ujian) VALUES (?)")
      .run(jenis);
  }

  const galeriCount = database.prepare("SELECT COUNT(*) as c FROM galeri_dokumentasi").get().c;
  if (galeriCount === 0) {
    const samples = [
      {
        judul: "Ruang Ujian ICT",
        deskripsi: "Suasana pelaksanaan ujian ICT di lab komputer LP3M.",
        gambar_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80",
        kategori: "Ujian ICT",
      },
      {
        judul: "Peserta Ujian ICT",
        deskripsi: "Peserta sedang mengerjakan soal ujian ICT.",
        gambar_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=80",
        kategori: "Ujian ICT",
      },
      {
        judul: "Lab Komputer LP3M",
        deskripsi: "Fasilitas lab komputer untuk ujian sertifikasi.",
        gambar_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&q=80",
        kategori: "Ujian ICT",
      },
      {
        judul: "Sesi Ujian TOEFL",
        deskripsi: "Pelaksanaan ujian TOEFL di ruang ujian LP3M.",
        gambar_url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&q=80",
        kategori: "Ujian TOEFL",
      },
      {
        judul: "Listening TOEFL",
        deskripsi: "Peserta mengikuti sesi listening ujian TOEFL.",
        gambar_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80",
        kategori: "Ujian TOEFL",
      },
      {
        judul: "Briefing Peserta",
        deskripsi: "Sosialisasi tata tertib sebelum ujian dimulai.",
        gambar_url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&q=80",
        kategori: "Kegiatan LP3M",
      },
      {
        judul: "Registrasi Peserta",
        deskripsi: "Proses registrasi kehadiran peserta ujian.",
        gambar_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80",
        kategori: "Kegiatan LP3M",
      },
      {
        judul: "Penyerahan Sertifikat",
        deskripsi: "Momen penyerahan sertifikat kelulusan ujian.",
        gambar_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900&q=80",
        kategori: "Kegiatan LP3M",
      },
      {
        judul: "Tim LP3M",
        deskripsi: "Tim pengawas dan admin ujian LP3M UNIKS.",
        gambar_url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=80",
        kategori: "Kegiatan LP3M",
      },
      {
        judul: "Gedung Kampus UNIKS",
        deskripsi: "Gedung utama Universitas Islam Kuantan Singingi.",
        gambar_url: "https://images.unsplash.com/photo-1562774053-701939374585?w=900&q=80",
        kategori: "Kegiatan LP3M",
      },
      {
        judul: "Diskusi Pasca Ujian",
        deskripsi: "Peserta berdiskusi setelah sesi ujian selesai.",
        gambar_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80",
        kategori: "Ujian ICT",
      },
      {
        judul: "Ruang Tunggu Peserta",
        deskripsi: "Area tunggu peserta sebelum masuk ruang ujian.",
        gambar_url: "https://images.unsplash.com/photo-1521737711862-e3b97375f902?w=900&q=80",
        kategori: "Ujian TOEFL",
      },
    ];
    const insert = database.prepare(
      "INSERT INTO galeri_dokumentasi (judul, deskripsi, gambar_url, kategori) VALUES (?, ?, ?, ?)"
    );
    for (const s of samples) {
      insert.run(s.judul, s.deskripsi, s.gambar_url, s.kategori);
    }
  }

  const admin = database.prepare("SELECT id FROM users WHERE role = ? LIMIT 1").get(ROLES.ADMIN);
  const pengumumanCount = database.prepare("SELECT COUNT(*) as c FROM pengumuman").get().c;
  if (admin && pengumumanCount === 0) {
    const samples = [
      {
        judul: "Selamat Datang di Portal Ujian LP3M",
        isi: "Sistem informasi ujian ICT dan TOEFL kini dapat diakses secara online. Peserta dapat mendaftar ujian tanpa harus datang ke kantor LP3M.",
        kategori: KATEGORI_PENGUMUMAN.TERBARU,
      },
      {
        judul: "Pendaftaran Ujian ICT Periode Juni 2026",
        isi: "Pendaftaran ujian ICT dibuka mulai 1 Juni 2026. Silakan daftar melalui menu Daftar Ujian setelah login sebagai peserta.",
        kategori: KATEGORI_PENGUMUMAN.TERBARU,
      },
      {
        judul: "Jadwal Ujian ICT   15 Juni 2026",
        isi: "Pelaksanaan ujian ICT akan dilaksanakan pada tanggal 15 Juni 2026 pukul 08.00 WIB di Lab Komputer LP3M, Gedung A Lantai 2.",
        kategori: KATEGORI_PENGUMUMAN.JADWAL,
      },
      {
        judul: "Jadwal Ujian TOEFL   20 Juni 2026",
        isi: "Pelaksanaan ujian TOEFL akan dilaksanakan pada tanggal 20 Juni 2026 pukul 09.00 WIB di Ruang Ujian LP3M.",
        kategori: KATEGORI_PENGUMUMAN.JADWAL,
      },
      {
        judul: "Pengumuman Hasil Ujian ICT Maret 2026",
        isi: "Hasil ujian ICT periode Maret 2026 telah dipublikasikan. Peserta dapat melihat status kelulusan di menu Hasil Ujian setelah login.",
        kategori: KATEGORI_PENGUMUMAN.HASIL_UJIAN,
      },
    ];
    const insertPengumuman = database.prepare(
      "INSERT INTO pengumuman (judul, isi, kategori, dibuat_oleh) VALUES (?, ?, ?, ?)"
    );
    for (const s of samples) {
      insertPengumuman.run(s.judul, s.isi, s.kategori, admin.id);
    }
  }
}

export function getDb() {
  if (!db) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    runMigrations(db);
    seedData(db);
  }
  return db;
}

export function logAktivitas(userId, aksi, detail = null) {
  getDb()
    .prepare("INSERT INTO aktivitas_log (user_id, aksi, detail) VALUES (?, ?, ?)")
    .run(userId, aksi, detail);
}
