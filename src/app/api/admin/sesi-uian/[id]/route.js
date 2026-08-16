import { requireAuth } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/api";
import { getDb, logAktivitas } from "@/lib/db";
import { ROLES } from "@/lib/constants";
import { cariSesiBentrok, pesanSesiBentrok, validasiDataSesi } from "@/lib/sesiUjian";

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
  const { jenis_ujian_id, tanggal, durasi_menit, kuota, lokasi } = await request.json();

  const validation = validasiDataSesi({ jenis_ujian_id, tanggal, durasi_menit, kuota });
  if (validation.error) return errorResponse(validation.error);

  const current = getDb().prepare("SELECT id FROM sesi_ujian WHERE id = ?").get(id);
  if (!current) return errorResponse("Sesi ujian tidak ditemukan", 404);

  const sesiBentrok = cariSesiBentrok(tanggal, validation.data.durasi_menit, Number(id));
  if (sesiBentrok) return errorResponse(pesanSesiBentrok(sesiBentrok));

  try {
    getDb()
      .prepare(
        `UPDATE sesi_ujian
         SET jenis_ujian_id = ?, tanggal = ?, durasi_menit = ?, kuota = ?, lokasi = ?
         WHERE id = ?`
      )
      .run(
        validation.data.jenis_ujian_id,
        validation.data.tanggal,
        validation.data.durasi_menit,
        validation.data.kuota,
        lokasi || null,
        id
      );
  } catch (updateError) {
    if (updateError.message.includes("Jadwal sesi bentrok")) {
      return errorResponse("Jadwal sesi bentrok dengan sesi lain");
    }
    throw updateError;
  }

  logAktivitas(user.id, "update_sesi_ujian", `sesi_id=${id}`);
  return jsonResponse({ message: "Sesi diperbarui" });
}
