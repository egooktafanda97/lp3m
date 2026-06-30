/**
 * Tambah foto galeri contoh (jika belum cukup)
 * Jalankan: npm run seed:galeri
 */
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "app.db");

const EXTRA_GALERI = [
  {
    judul: "Ruang Ujian ICT",
    deskripsi: "Suasana pelaksanaan ujian ICT di lab komputer LP3M.",
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
    judul: "Listening TOEFL",
    deskripsi: "Peserta mengikuti sesi listening ujian TOEFL.",
    gambar_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80",
    kategori: "Ujian TOEFL",
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

if (!fs.existsSync(DB_PATH)) {
  console.error("Database belum ada. Jalankan aplikasi dulu (npm run dev).");
  process.exit(1);
}

const db = new Database(DB_PATH);
const insert = db.prepare(
  "INSERT INTO galeri_dokumentasi (judul, deskripsi, gambar_url, kategori) VALUES (?, ?, ?, ?)"
);
const exists = db.prepare("SELECT id FROM galeri_dokumentasi WHERE judul = ?");

let added = 0;
for (const item of EXTRA_GALERI) {
  if (!exists.get(item.judul)) {
    insert.run(item.judul, item.deskripsi, item.gambar_url, item.kategori);
    added += 1;
  }
}

const total = db.prepare("SELECT COUNT(*) as c FROM galeri_dokumentasi").get().c;
db.close();

console.log(`✓ Galeri: ${added} foto baru ditambahkan (total: ${total})`);
