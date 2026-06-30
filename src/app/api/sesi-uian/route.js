import { requireAuth } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/api";
import { getDb } from "@/lib/db";
import { ROLES } from "@/lib/constants";

export async function GET() {
  const { error, status, user } = await requireAuth([ROLES.PESERTA, ROLES.ADMIN]);
  if (error) return errorResponse(error, status);

  const isPeserta = user.role === ROLES.PESERTA;

  const rows = getDb()
    .prepare(
      `SELECT s.*, j.nama_ujian,
        (SELECT COUNT(*) FROM pendaftaran p
         WHERE p.sesi_ujian_id = s.id AND p.status != 'ditolak') as terisi
        ${isPeserta ? `, (SELECT p.status FROM pendaftaran p
         WHERE p.peserta_id = ? AND p.sesi_ujian_id = s.id LIMIT 1) as status_pendaftaran_saya` : ""}
       FROM sesi_ujian s
       JOIN jenis_ujian j ON j.id = s.jenis_ujian_id
       WHERE datetime(s.tanggal) >= datetime('now')
       ORDER BY s.tanggal ASC`
    )
    .all(...(isPeserta ? [user.id] : []));

  return jsonResponse({ data: rows });
}
