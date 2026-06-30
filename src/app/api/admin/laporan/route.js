import { requireAuth } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/api";
import { getDb } from "@/lib/db";
import { ROLES } from "@/lib/constants";
import * as XLSX from "xlsx";

export async function GET(request) {
  const { error, status } = await requireAuth([ROLES.ADMIN]);
  if (error) return errorResponse(error, status);

  const { searchParams } = new URL(request.url);
  const jenis = searchParams.get("jenis") || "peserta";

  let data;
  let filename;

  if (jenis === "kelulusan") {
    data = getDb()
      .prepare(
        `SELECT u.nama, u.email, j.nama_ujian, s.tanggal,
          h.nilai, h.status_kelulusan, h.tanggal_publish
         FROM hasil_ujian h
         JOIN pendaftaran p ON p.id = h.pendaftaran_id
         JOIN users u ON u.id = p.peserta_id
         JOIN sesi_ujian s ON s.id = p.sesi_ujian_id
         JOIN jenis_ujian j ON j.id = s.jenis_ujian_id
         ORDER BY h.tanggal_publish DESC`
      )
      .all();
    filename = "rekap_kelulusan.xlsx";
  } else {
    data = getDb()
      .prepare(
        `SELECT u.nama, u.email, j.nama_ujian, s.tanggal, s.lokasi,
          p.status, p.created_at
         FROM pendaftaran p
         JOIN users u ON u.id = p.peserta_id
         JOIN sesi_ujian s ON s.id = p.sesi_ujian_id
         JOIN jenis_ujian j ON j.id = s.jenis_ujian_id
         ORDER BY p.created_at DESC`
      )
      .all();
    filename = "rekap_peserta.xlsx";
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
