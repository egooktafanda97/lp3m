import { requireAuth } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/api";
import { getDb, logAktivitas } from "@/lib/db";
import { ROLES, STATUS_PENDAFTARAN } from "@/lib/constants";

export async function GET() {
  const { error, status, user } = await requireAuth([ROLES.PESERTA]);
  if (error) return errorResponse(error, status);

  const rows = getDb()
    .prepare(
      `SELECT p.*, s.tanggal, s.lokasi, s.kuota, j.nama_ujian,
        h.nilai, h.status_kelulusan, h.tanggal_publish
       FROM pendaftaran p
       JOIN sesi_ujian s ON s.id = p.sesi_ujian_id
       JOIN jenis_ujian j ON j.id = s.jenis_ujian_id
       LEFT JOIN hasil_ujian h ON h.pendaftaran_id = p.id
       WHERE p.peserta_id = ?
       ORDER BY p.created_at DESC`
    )
    .all(user.id);

  return jsonResponse({ data: rows });
}

export async function POST(request) {
  const { error, status, user } = await requireAuth([ROLES.PESERTA]);
  if (error) return errorResponse(error, status);

  const { sesi_ujian_id } = await request.json();

  if (!sesi_ujian_id) {
    return errorResponse("Sesi ujian wajib dipilih");
  }

  const sesi = getDb()
    .prepare(
      `SELECT s.*,
        (SELECT COUNT(*) FROM pendaftaran p WHERE p.sesi_ujian_id = s.id AND p.status != 'ditolak') as terisi
       FROM sesi_ujian s WHERE s.id = ?`
    )
    .get(sesi_ujian_id);

  if (!sesi) return errorResponse("Sesi ujian tidak ditemukan");
  if (sesi.terisi >= sesi.kuota) return errorResponse("Kuota sesi ujian sudah penuh");

  const existing = getDb()
    .prepare("SELECT id FROM pendaftaran WHERE peserta_id = ? AND sesi_ujian_id = ?")
    .get(user.id, sesi_ujian_id);

  if (existing) return errorResponse("Anda sudah mendaftar sesi ini");

  const result = getDb()
    .prepare(
      "INSERT INTO pendaftaran (peserta_id, sesi_ujian_id, status) VALUES (?, ?, ?)"
    )
    .run(user.id, sesi_ujian_id, STATUS_PENDAFTARAN.MENUNGGU);

  logAktivitas(user.id, "daftar_ujian", `pendaftaran_id=${result.lastInsertRowid}`);
  return jsonResponse({ id: result.lastInsertRowid }, 201);
}
