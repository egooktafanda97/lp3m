import { requireAuth } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/api";
import { getDb, logAktivitas } from "@/lib/db";
import { ROLES, KATEGORI_GALERI } from "@/lib/constants";
import { unlink } from "fs/promises";
import path from "path";

export async function GET() {
  const { error, status } = await requireAuth([ROLES.ADMIN]);
  if (error) return errorResponse(error, status);

  const rows = getDb()
    .prepare("SELECT * FROM galeri_dokumentasi ORDER BY created_at DESC")
    .all();

  return jsonResponse({ data: rows });
}

export async function POST(request) {
  const { error, status, user } = await requireAuth([ROLES.ADMIN]);
  if (error) return errorResponse(error, status);

  const { judul, deskripsi, gambar_url, kategori } = await request.json();

  if (!judul || !gambar_url) {
    return errorResponse("Judul dan gambar wajib diisi");
  }

  if (kategori && !KATEGORI_GALERI.includes(kategori)) {
    return errorResponse("Kategori tidak valid");
  }

  const result = getDb()
    .prepare(
      "INSERT INTO galeri_dokumentasi (judul, deskripsi, gambar_url, kategori) VALUES (?, ?, ?, ?)"
    )
    .run(judul, deskripsi || null, gambar_url, kategori || null);

  logAktivitas(user.id, "tambah_galeri", `galeri_id=${result.lastInsertRowid}`);
  return jsonResponse({ id: result.lastInsertRowid }, 201);
}

export async function DELETE(request) {
  const { error, status, user } = await requireAuth([ROLES.ADMIN]);
  if (error) return errorResponse(error, status);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return errorResponse("ID wajib diisi");

  const row = getDb().prepare("SELECT gambar_url FROM galeri_dokumentasi WHERE id = ?").get(id);
  getDb().prepare("DELETE FROM galeri_dokumentasi WHERE id = ?").run(id);

  if (row?.gambar_url?.startsWith("/uploads/galeri/")) {
    const filePath = path.join(process.cwd(), "public", row.gambar_url);
    try {
      await unlink(filePath);
    } catch {
      // file mungkin sudah tidak ada
    }
  }
  logAktivitas(user.id, "hapus_galeri", `galeri_id=${id}`);
  return jsonResponse({ message: "Dokumentasi dihapus" });
}
