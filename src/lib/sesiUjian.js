import "server-only";
import { getDb } from "./db";

export function generateKodeSesi(jenisUjianId) {
  const db = getDb();
  const prefix = Number(jenisUjianId) === 2 ? "TF" : "IC";
  for (let i = 1; i <= 999; i++) {
    const candidate = `${prefix}${String(i).padStart(3, "0")}`;
    const exists = db
      .prepare("SELECT id FROM sesi_ujian WHERE kode_sesi = ?")
      .get(candidate);
    if (!exists) return candidate;
  }
  return `${prefix}${Math.floor(100 + Math.random() * 900)}`;
}

export function validasiDataSesi(
  { kode_sesi, jenis_ujian_id, tanggal, durasi_menit, kuota },
  excludeId = null
) {
  const jenisId = Number(jenis_ujian_id);
  const durasi = Number(durasi_menit);
  const jumlahKuota = Number(kuota);
  const kode = kode_sesi ? String(kode_sesi).trim().toUpperCase() : "";

  if (!jenisId || !tanggal || !durasi || !jumlahKuota) {
    return { error: "Jenis ujian, tanggal, durasi, dan kuota wajib diisi" };
  }

  if (kode && kode.length !== 5) {
    return {
      error:
        "Kode sesi harus terdiri dari tepat 5 digit / karakter (contoh: ICT01 atau 10001)",
    };
  }

  if (kode) {
    const existingKode = getDb()
      .prepare(
        "SELECT id FROM sesi_ujian WHERE kode_sesi = ? AND (? IS NULL OR id != ?)"
      )
      .get(kode, excludeId, excludeId);
    if (existingKode) {
      return { error: `Kode sesi "${kode}" sudah digunakan oleh sesi lain` };
    }
  }

  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(tanggal)) {
    return { error: "Format tanggal dan waktu tidak valid" };
  }
  if (!Number.isInteger(durasi) || durasi < 15 || durasi > 480) {
    return { error: "Durasi sesi harus antara 15 sampai 480 menit" };
  }
  if (!Number.isInteger(jumlahKuota) || jumlahKuota < 1) {
    return { error: "Kuota minimal 1 peserta" };
  }

  const jenis = getDb()
    .prepare("SELECT id FROM jenis_ujian WHERE id = ?")
    .get(jenisId);
  if (!jenis) return { error: "Jenis ujian tidak ditemukan" };

  return {
    data: {
      kode_sesi: kode || generateKodeSesi(jenisId),
      jenis_ujian_id: jenisId,
      tanggal,
      durasi_menit: durasi,
      kuota: jumlahKuota,
    },
  };
}

export function cariSesiBentrok(tanggal, durasiMenit, excludeId = null) {
  return getDb()
    .prepare(
      `SELECT s.id, s.tanggal, s.durasi_menit, s.lokasi, j.nama_ujian
       FROM sesi_ujian s
       JOIN jenis_ujian j ON j.id = s.jenis_ujian_id
       WHERE (? IS NULL OR s.id != ?)
         AND datetime(s.tanggal) < datetime(?, '+' || ? || ' minutes')
         AND datetime(s.tanggal, '+' || s.durasi_menit || ' minutes') > datetime(?)
       ORDER BY s.tanggal ASC
       LIMIT 1`
    )
    .get(excludeId, excludeId, tanggal, durasiMenit, tanggal);
}

export function pesanSesiBentrok(sesi) {
  return `Jadwal bentrok dengan sesi ${sesi.nama_ujian} pada ${sesi.tanggal}`;
}
