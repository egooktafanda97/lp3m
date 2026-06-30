import { requireAuth } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/api";
import { getDb } from "@/lib/db";
import { ROLES } from "@/lib/constants";

export async function GET() {
  const { error, status } = await requireAuth([ROLES.ADMIN]);
  if (error) return errorResponse(error, status);

  const db = getDb();

  const stats = {
    total_peserta: db
      .prepare("SELECT COUNT(*) as c FROM users WHERE role = ?")
      .get(ROLES.PESERTA).c,
    pendaftaran_menunggu: db
      .prepare("SELECT COUNT(*) as c FROM pendaftaran WHERE status = ?")
      .get("menunggu_verifikasi").c,
    sesi_aktif: db
      .prepare("SELECT COUNT(*) as c FROM sesi_ujian WHERE datetime(tanggal) >= datetime('now')")
      .get().c,
    hasil_dipublish: db.prepare("SELECT COUNT(*) as c FROM hasil_ujian").get().c,
  };

  return jsonResponse({ stats });
}
