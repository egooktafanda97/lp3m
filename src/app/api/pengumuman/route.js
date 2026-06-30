import { requireAuth } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/api";
import { getDb, logAktivitas } from "@/lib/db";
import { ROLES, KATEGORI_PENGUMUMAN } from "@/lib/constants";

const validKategori = Object.values(KATEGORI_PENGUMUMAN);

export async function GET() {
  const { error, status } = await requireAuth([ROLES.ADMIN, ROLES.PESERTA]);
  if (error) return errorResponse(error, status);

  const rows = getDb()
    .prepare(
      `SELECT p.*, u.nama as nama_admin
       FROM pengumuman p
       JOIN users u ON u.id = p.dibuat_oleh
       ORDER BY p.tanggal_publish DESC`
    )
    .all();

  return jsonResponse({ data: rows });
}

export async function POST(request) {
  const { error, status, user } = await requireAuth([ROLES.ADMIN]);
  if (error) return errorResponse(error, status);

  const { judul, isi, kategori } = await request.json();

  if (!judul || !isi) {
    return errorResponse("Judul dan isi wajib diisi");
  }

  const kat = kategori || KATEGORI_PENGUMUMAN.TERBARU;
  if (!validKategori.includes(kat)) {
    return errorResponse("Kategori pengumuman tidak valid");
  }

  const result = getDb()
    .prepare("INSERT INTO pengumuman (judul, isi, kategori, dibuat_oleh) VALUES (?, ?, ?, ?)")
    .run(judul, isi, kat, user.id);

  logAktivitas(user.id, "buat_pengumuman", `pengumuman_id=${result.lastInsertRowid}`);
  return jsonResponse({ id: result.lastInsertRowid }, 201);
}

export async function DELETE(request) {
  const { error, status, user } = await requireAuth([ROLES.ADMIN]);
  if (error) return errorResponse(error, status);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return errorResponse("ID wajib diisi");

  getDb().prepare("DELETE FROM pengumuman WHERE id = ?").run(id);
  logAktivitas(user.id, "hapus_pengumuman", `pengumuman_id=${id}`);
  return jsonResponse({ message: "Pengumuman dihapus" });
}
