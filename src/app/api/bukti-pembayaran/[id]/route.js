import { readFile } from "fs/promises";
import path from "path";
import { requireAuth } from "@/lib/auth";
import { errorResponse } from "@/lib/api";
import { getDb } from "@/lib/db";
import { ROLES } from "@/lib/constants";

export async function GET(_request, { params }) {
  const { error, status, user } = await requireAuth([
    ROLES.ADMIN,
    ROLES.KEPALA_LP3M,
    ROLES.PESERTA,
  ]);
  if (error) return errorResponse(error, status);

  const { id } = await params;
  const pendaftaran = getDb()
    .prepare(
      `SELECT id, peserta_id, dokumen_path, dokumen_nama_asli, dokumen_mime
       FROM pendaftaran WHERE id = ?`
    )
    .get(id);

  if (!pendaftaran?.dokumen_path) {
    return errorResponse("Bukti pembayaran tidak ditemukan", 404);
  }
  if (user.role === ROLES.PESERTA && pendaftaran.peserta_id !== user.id) {
    return errorResponse("Forbidden", 403);
  }

  const uploadDir = path.join(process.cwd(), "data", "uploads", "pembayaran");
  const filePath = path.join(uploadDir, path.basename(pendaftaran.dokumen_path));

  try {
    const file = await readFile(filePath);
    const safeName = encodeURIComponent(
      pendaftaran.dokumen_nama_asli || path.basename(pendaftaran.dokumen_path)
    );
    return new Response(file, {
      headers: {
        "Content-Type": pendaftaran.dokumen_mime || "application/octet-stream",
        "Content-Disposition": `inline; filename*=UTF-8''${safeName}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return errorResponse("File bukti pembayaran tidak ditemukan", 404);
  }
}
