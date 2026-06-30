import { requireAuth } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/api";
import { getDb, logAktivitas } from "@/lib/db";
import { ROLES, STATUS_PENDAFTARAN } from "@/lib/constants";

export async function GET() {
  const { error, status } = await requireAuth([ROLES.ADMIN]);
  if (error) return errorResponse(error, status);

  const rows = getDb()
    .prepare(
      `SELECT p.*, u.nama as nama_peserta, u.email,
        pp.nomor_identitas, pp.prodi, pp.no_hp,
        s.tanggal, s.lokasi, j.nama_ujian
       FROM pendaftaran p
       JOIN users u ON u.id = p.peserta_id
       LEFT JOIN peserta_profil pp ON pp.user_id = u.id
       JOIN sesi_ujian s ON s.id = p.sesi_ujian_id
       JOIN jenis_ujian j ON j.id = s.jenis_ujian_id
       ORDER BY p.created_at DESC`
    )
    .all();

  return jsonResponse({ data: rows });
}

export async function PATCH(request) {
  const { error, status, user } = await requireAuth([ROLES.ADMIN]);
  if (error) return errorResponse(error, status);

  const { id, status: newStatus, alasan_penolakan } = await request.json();

  if (!id || !newStatus) {
    return errorResponse("ID dan status wajib diisi");
  }

  if (
    ![STATUS_PENDAFTARAN.TERVERIFIKASI, STATUS_PENDAFTARAN.DITOLAK].includes(newStatus)
  ) {
    return errorResponse("Status tidak valid");
  }

  if (newStatus === STATUS_PENDAFTARAN.DITOLAK && !alasan_penolakan) {
    return errorResponse("Alasan penolakan wajib diisi");
  }

  getDb()
    .prepare(
      "UPDATE pendaftaran SET status = ?, alasan_penolakan = ? WHERE id = ?"
    )
    .run(newStatus, alasan_penolakan || null, id);

  logAktivitas(user.id, "verifikasi_pendaftaran", `pendaftaran_id=${id}, status=${newStatus}`);
  return jsonResponse({ message: "Status pendaftaran diperbarui" });
}
