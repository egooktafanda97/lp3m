import { requireAuth } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/api";
import { getDb, logAktivitas } from "@/lib/db";
import { ROLES, STATUS_PENDAFTARAN } from "@/lib/constants";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const FILE_TYPES = {
  "application/pdf": { extension: "pdf", signature: [0x25, 0x50, 0x44, 0x46] },
  "image/jpeg": { extension: "jpg", signature: [0xff, 0xd8, 0xff] },
  "image/png": { extension: "png", signature: [0x89, 0x50, 0x4e, 0x47] },
};

function hasValidSignature(buffer, signature) {
  return signature.every((byte, index) => buffer[index] === byte);
}

export async function GET() {
  const { error, status, user } = await requireAuth([ROLES.PESERTA]);
  if (error) return errorResponse(error, status);

  const rows = getDb()
    .prepare(
      `SELECT p.*, s.tanggal, s.durasi_menit, s.lokasi, s.kuota, j.nama_ujian,
        h.nilai, h.status_kelulusan, h.tanggal_publish
       FROM pendaftaran p
       JOIN sesi_ujian s ON s.id = p.sesi_ujian_id
       JOIN jenis_ujian j ON j.id = s.jenis_ujian_id
       LEFT JOIN hasil_ujian h ON h.pendaftaran_id = p.id
       WHERE p.peserta_id = ?
       ORDER BY p.created_at DESC`
    )
    .all(user.id);

  return jsonResponse({ data: rows });
}

export async function POST(request) {
  const { error, status, user } = await requireAuth([ROLES.PESERTA]);
  if (error) return errorResponse(error, status);

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("Data pendaftaran tidak valid");
  }

  const sesi_ujian_id = Number(formData.get("sesi_ujian_id"));
  const buktiPembayaran = formData.get("bukti_pembayaran");

  if (!sesi_ujian_id) {
    return errorResponse("Sesi ujian wajib dipilih");
  }

  if (!buktiPembayaran || typeof buktiPembayaran === "string") {
    return errorResponse("Bukti pembayaran wajib diupload");
  }

  const fileType = FILE_TYPES[buktiPembayaran.type];
  if (!fileType) {
    return errorResponse("Bukti pembayaran harus berformat PDF, JPG, atau PNG");
  }
  if (buktiPembayaran.size === 0 || buktiPembayaran.size > MAX_FILE_SIZE) {
    return errorResponse("Ukuran bukti pembayaran maksimal 5MB");
  }

  const sesi = getDb()
    .prepare(
      `SELECT s.*,
        (SELECT COUNT(*) FROM pendaftaran p WHERE p.sesi_ujian_id = s.id AND p.status != 'ditolak') as terisi
       FROM sesi_ujian s WHERE s.id = ?`
    )
    .get(sesi_ujian_id);

  if (!sesi) return errorResponse("Sesi ujian tidak ditemukan");
  if (sesi.terisi >= sesi.kuota) return errorResponse("Kuota sesi ujian sudah penuh");

  const existing = getDb()
    .prepare("SELECT id FROM pendaftaran WHERE peserta_id = ? AND sesi_ujian_id = ?")
    .get(user.id, sesi_ujian_id);

  if (existing) return errorResponse("Anda sudah mendaftar sesi ini");

  const buffer = Buffer.from(await buktiPembayaran.arrayBuffer());
  if (!hasValidSignature(buffer, fileType.signature)) {
    return errorResponse("Isi file bukti pembayaran tidak sesuai dengan formatnya");
  }

  const filename = `${randomUUID()}.${fileType.extension}`;
  const uploadDir = path.join(process.cwd(), "data", "uploads", "pembayaran");
  const filePath = path.join(uploadDir, filename);
  const originalName = path.basename(buktiPembayaran.name).slice(0, 150);

  try {
    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, buffer);
  } catch {
    return errorResponse("Bukti pembayaran gagal disimpan", 500);
  }

  let result;
  try {
    result = getDb()
      .prepare(
        `INSERT INTO pendaftaran
          (peserta_id, sesi_ujian_id, status, dokumen_path, dokumen_nama_asli, dokumen_mime)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        user.id,
        sesi_ujian_id,
        STATUS_PENDAFTARAN.MENUNGGU,
        filename,
        originalName,
        buktiPembayaran.type
      );
  } catch {
    await unlink(filePath).catch(() => {});
    return errorResponse("Pendaftaran gagal disimpan", 500);
  }

  logAktivitas(user.id, "daftar_ujian", `pendaftaran_id=${result.lastInsertRowid}`);
  return jsonResponse({ id: result.lastInsertRowid }, 201);
}
