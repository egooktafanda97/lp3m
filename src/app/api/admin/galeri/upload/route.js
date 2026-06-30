import { requireAuth } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/api";
import { ROLES } from "@/lib/constants";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request) {
  const { error, status } = await requireAuth([ROLES.ADMIN]);
  if (error) return errorResponse(error, status);

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return errorResponse("File gambar wajib diupload");
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return errorResponse("Format harus JPG, PNG, WEBP, atau GIF");
    }

    if (file.size > MAX_SIZE) {
      return errorResponse("Ukuran file maksimal 5MB");
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "galeri");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/galeri/${filename}`;
    return jsonResponse({ url, filename }, 201);
  } catch {
    return errorResponse("Gagal mengupload file", 500);
  }
}
