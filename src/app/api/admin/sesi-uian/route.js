import { requireAuth } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/api";
import { getDb, logAktivitas } from "@/lib/db";
import { ROLES } from "@/lib/constants";

export async function GET() {
  const { error, status, user } = await requireAuth([ROLES.ADMIN]);
  if (error) return errorResponse(error, status);

  const rows = getDb()
    .prepare(
      `SELECT s.*, j.nama_ujian,
        (SELECT COUNT(*) FROM pendaftaran p WHERE p.sesi_ujian_id = s.id) as jumlah_pendaftar
       FROM sesi_ujian s
       JOIN jenis_ujian j ON j.id = s.jenis_ujian_id
       ORDER BY s.tanggal DESC`
    )
    .all();

  return jsonResponse({ data: rows });
}

export async function POST(request) {
  const { error, status, user } = await requireAuth([ROLES.ADMIN]);
  if (error) return errorResponse(error, status);

  const { jenis_ujian_id, tanggal, kuota, lokasi } = await request.json();

  if (!jenis_ujian_id || !tanggal || !kuota) {
    return errorResponse("Jenis ujian, tanggal, dan kuota wajib diisi");
  }

  const result = getDb()
    .prepare(
      "INSERT INTO sesi_ujian (jenis_ujian_id, tanggal, kuota, lokasi) VALUES (?, ?, ?, ?)"
    )
    .run(jenis_ujian_id, tanggal, kuota, lokasi || null);

  logAktivitas(user.id, "buat_sesi_ujian", `sesi_id=${result.lastInsertRowid}`);
  return jsonResponse({ id: result.lastInsertRowid }, 201);
}
