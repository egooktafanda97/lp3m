import "server-only";
import { getDb } from "./db";

export function validasiDataSesi({ jenis_ujian_id, tanggal, durasi_menit, kuota }) {
  const jenisId = Number(jenis_ujian_id);
  const durasi = Number(durasi_menit);
  const jumlahKuota = Number(kuota);

  if (!jenisId || !tanggal || !durasi || !jumlahKuota) {
    return { error: "Jenis ujian, tanggal, durasi, dan kuota wajib diisi" };
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

  const jenis = getDb().prepare("SELECT id FROM jenis_ujian WHERE id = ?").get(jenisId);
  if (!jenis) return { error: "Jenis ujian tidak ditemukan" };

  return {
    data: {
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
