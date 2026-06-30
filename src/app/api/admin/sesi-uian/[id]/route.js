import { requireAuth } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/api";
import { getDb, logAktivitas } from "@/lib/db";
import { ROLES } from "@/lib/constants";

export async function DELETE(request, { params }) {
  const { error, status, user } = await requireAuth([ROLES.ADMIN]);
  if (error) return errorResponse(error, status);

  const { id } = await params;
  const hasPendaftar = getDb()
    .prepare("SELECT id FROM pendaftaran WHERE sesi_ujian_id = ? LIMIT 1")
    .get(id);

  if (hasPendaftar) {
    return errorResponse("Sesi tidak dapat dihapus karena sudah ada pendaftar");
  }

  getDb().prepare("DELETE FROM sesi_ujian WHERE id = ?").run(id);
  logAktivitas(user.id, "hapus_sesi_ujian", `sesi_id=${id}`);
  return jsonResponse({ message: "Sesi dihapus" });
}

export async function PUT(request, { params }) {
  const { error, status, user } = await requireAuth([ROLES.ADMIN]);
  if (error) return errorResponse(error, status);

  const { id } = await params;
  const { jenis_ujian_id, tanggal, kuota, lokasi } = await request.json();

  getDb()
    .prepare(
      "UPDATE sesi_ujian SET jenis_ujian_id = ?, tanggal = ?, kuota = ?, lokasi = ? WHERE id = ?"
    )
    .run(jenis_ujian_id, tanggal, kuota, lokasi || null, id);

  logAktivitas(user.id, "update_sesi_ujian", `sesi_id=${id}`);
  return jsonResponse({ message: "Sesi diperbarui" });
}
