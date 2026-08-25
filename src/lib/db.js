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
      role TEXT NOT NULL CHECK(role IN ('admin', 'kepala_lp3m', 'peserta')),
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
      kode_sesi TEXT,
      jenis_ujian_id INTEGER NOT NULL REFERENCES jenis_ujian(id),
      tanggal TEXT NOT NULL,
      durasi_menit INTEGER NOT NULL DEFAULT 120,
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
      dokumen_nama_asli TEXT,
      dokumen_mime TEXT,
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

    CREATE TABLE IF NOT EXISTS pengaturan (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  migrateColumns(database);
}

function migrateColumns(database) {
  const usersSql = database
    .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'users'")
    .get()?.sql;
  if (usersSql && !usersSql.includes("kepala_lp3m")) {
    database.pragma("foreign_keys = OFF");
    try {
      database.transaction(() => {
        database.exec(`
          CREATE TABLE users_baru (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nama TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('admin', 'kepala_lp3m', 'peserta')),
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
          );
          INSERT INTO users_baru (id, nama, email, password_hash, role, is_active, created_at)
            SELECT id, nama, email, password_hash, role, is_active, created_at FROM users;
          DROP TABLE users;
          ALTER TABLE users_baru RENAME TO users;
        `);
      })();
    } finally {
      database.pragma("foreign_keys = ON");
    }
  }

  const pendaftaranCols = database.pragma("table_info(pendaftaran)");
  if (!pendaftaranCols.find((c) => c.name === "dokumen_nama_asli")) {
    database.exec("ALTER TABLE pendaftaran ADD COLUMN dokumen_nama_asli TEXT");
  }
  if (!pendaftaranCols.find((c) => c.name === "dokumen_mime")) {
    database.exec("ALTER TABLE pendaftaran ADD COLUMN dokumen_mime TEXT");
  }

  const sesiCols = database.pragma("table_info(sesi_ujian)");
  if (!sesiCols.find((c) => c.name === "durasi_menit")) {
    database.exec(
      "ALTER TABLE sesi_ujian ADD COLUMN durasi_menit INTEGER NOT NULL DEFAULT 120"
    );
  }
  if (!sesiCols.find((c) => c.name === "kode_sesi")) {
    database.exec("ALTER TABLE sesi_ujian ADD COLUMN kode_sesi TEXT");
    const existing = database
      .prepare(
        "SELECT id, jenis_ujian_id FROM sesi_ujian WHERE kode_sesi IS NULL OR kode_sesi = ''"
      )
      .all();
    const updateKode = database.prepare(
      "UPDATE sesi_ujian SET kode_sesi = ? WHERE id = ?"
    );
    for (const row of existing) {
      const pad = String(row.id).padStart(3, "0");
      const prefix = row.jenis_ujian_id === 2 ? "TF" : "IC";
      updateKode.run(`${prefix}${pad}`, row.id);
    }
  }

  database.exec(`
    CREATE TRIGGER IF NOT EXISTS sesi_ujian_cegah_bentrok_insert
    BEFORE INSERT ON sesi_ujian
    WHEN EXISTS (
      SELECT 1 FROM sesi_ujian s
      WHERE datetime(s.tanggal) < datetime(NEW.tanggal, '+' || NEW.durasi_menit || ' minutes')
        AND datetime(s.tanggal, '+' || s.durasi_menit || ' minutes') > datetime(NEW.tanggal)
    )
    BEGIN
      SELECT RAISE(ABORT, 'Jadwal sesi bentrok dengan sesi lain');
    END;

    CREATE TRIGGER IF NOT EXISTS sesi_ujian_cegah_bentrok_update
    BEFORE UPDATE OF tanggal, durasi_menit ON sesi_ujian
    WHEN EXISTS (
      SELECT 1 FROM sesi_ujian s
      WHERE s.id != NEW.id
        AND datetime(s.tanggal) < datetime(NEW.tanggal, '+' || NEW.durasi_menit || ' minutes')
        AND datetime(s.tanggal, '+' || s.durasi_menit || ' minutes') > datetime(NEW.tanggal)
    )
    BEGIN
      SELECT RAISE(ABORT, 'Jadwal sesi bentrok dengan sesi lain');
    END;
  `);

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

  const kepalaExists = database
    .prepare("SELECT id FROM users WHERE role = ? LIMIT 1")
    .get(ROLES.KEPALA_LP3M);

  if (!kepalaExists) {
    const hash = bcrypt.hashSync("kepala123", 10);
    database
      .prepare(
        "INSERT INTO users (nama, email, password_hash, role) VALUES (?, ?, ?, ?)"
      )
      .run("Kepala LP3M", "kepala@lp3m.uniks.ac.id", hash, ROLES.KEPALA_LP3M);
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

  const defaultSettings = [
    { key: "nama_pimpinan", value: "Dr. H. Nopriadi, S.Kom., M.Kom." },
    { key: "jabatan_pimpinan", value: "Kepala LP3M" },
    { key: "nip_pimpinan", value: "19850101 201001 1 002" },
    { key: "kota_laporan", value: "Teluk Kuantan" },
  ];
  const insertSetting = database.prepare(
    "INSERT OR IGNORE INTO pengaturan (key, value) VALUES (?, ?)"
  );
  for (const s of defaultSettings) {
    insertSetting.run(s.key, s.value);
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

export function getPengaturan() {
  const database = getDb();
  const rows = database.prepare("SELECT key, value FROM pengaturan").all();
  const settings = {
    nama_pimpinan: "Dr. H. Nopriadi, S.Kom., M.Kom.",
    jabatan_pimpinan: "Kepala LP3M",
    nip_pimpinan: "19850101 201001 1 002",
    kota_laporan: "Teluk Kuantan",
  };
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return settings;
}

export function updatePengaturan(entries) {
  const database = getDb();
  const stmt = database.prepare(
    "INSERT INTO pengaturan (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')"
  );

  const updateMany = database.transaction((data) => {
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string") {
        stmt.run(key, value.trim());
      }
    }
  });

  updateMany(entries);
  return getPengaturan();
}

export function logAktivitas(userId, aksi, detail = null) {
  getDb()
    .prepare("INSERT INTO aktivitas_log (user_id, aksi, detail) VALUES (?, ?, ?)")
    .run(userId, aksi, detail);
}
