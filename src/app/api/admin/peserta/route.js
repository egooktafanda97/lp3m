import { requireAuth } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/api";
import { getDb, logAktivitas } from "@/lib/db";
import { ROLES } from "@/lib/constants";

export async function GET() {
  const { error, status } = await requireAuth([ROLES.ADMIN]);
  if (error) return errorResponse(error, status);

  const rows = getDb()
    .prepare(
      `SELECT u.id, u.nama, u.email, u.is_active, u.created_at,
        pp.nomor_identitas, pp.prodi, pp.no_hp
       FROM users u
       LEFT JOIN peserta_profil pp ON pp.user_id = u.id
       WHERE u.role = ?
       ORDER BY u.created_at DESC`
    )
    .all(ROLES.PESERTA);

  return jsonResponse({ data: rows });
}

export async function PATCH(request) {
  const { error, status, user } = await requireAuth([ROLES.ADMIN]);
  if (error) return errorResponse(error, status);

  const { id, is_active, reset_password } = await request.json();

  if (!id) return errorResponse("ID wajib diisi");

  if (typeof is_active === "boolean") {
    getDb().prepare("UPDATE users SET is_active = ? WHERE id = ? AND role = ?").run(
      is_active ? 1 : 0,
      id,
      ROLES.PESERTA
    );
    logAktivitas(user.id, "update_status_peserta", `peserta_id=${id}, active=${is_active}`);
  }

  if (reset_password) {
    const bcrypt = await import("bcryptjs");
    const hash = bcrypt.hashSync(reset_password, 10);
    getDb()
      .prepare("UPDATE users SET password_hash = ? WHERE id = ? AND role = ?")
      .run(hash, id, ROLES.PESERTA);
    logAktivitas(user.id, "reset_password_peserta", `peserta_id=${id}`);
  }

  return jsonResponse({ message: "Data peserta diperbarui" });
}
