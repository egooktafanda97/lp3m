import { requireAuth } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/api";
import { getDb } from "@/lib/db";
import { ROLES } from "@/lib/constants";
import * as XLSX from "xlsx";

const REPORT_TYPES = ["peserta", "kelulusan", "sesi"];

function fetchPeserta() {
  return getDb()
    .prepare(
      `SELECT u.nama, u.email, pp.nomor_identitas, pp.prodi, pp.no_hp,
        j.nama_ujian, s.tanggal, s.lokasi, p.status, p.created_at
       FROM pendaftaran p
       JOIN users u ON u.id = p.peserta_id
       LEFT JOIN peserta_profil pp ON pp.user_id = u.id
       JOIN sesi_ujian s ON s.id = p.sesi_ujian_id
       JOIN jenis_ujian j ON j.id = s.jenis_ujian_id
       ORDER BY p.created_at DESC`
    )
    .all();
}

function fetchKelulusan() {
  return getDb()
    .prepare(
      `SELECT u.nama, u.email, pp.nomor_identitas, pp.prodi,
        j.nama_ujian, s.tanggal, h.nilai, h.status_kelulusan, h.tanggal_publish
       FROM hasil_ujian h
       JOIN pendaftaran p ON p.id = h.pendaftaran_id
       JOIN users u ON u.id = p.peserta_id
       LEFT JOIN peserta_profil pp ON pp.user_id = u.id
       JOIN sesi_ujian s ON s.id = p.sesi_ujian_id
       JOIN jenis_ujian j ON j.id = s.jenis_ujian_id
       ORDER BY h.tanggal_publish DESC`
    )
    .all();
}

function fetchSesi() {
  return getDb()
    .prepare(
      `SELECT j.nama_ujian, s.tanggal, s.lokasi, s.kuota,
        COUNT(p.id) as jumlah_pendaftar,
        SUM(CASE WHEN p.status = 'terverifikasi' THEN 1 ELSE 0 END) as terverifikasi,
        SUM(CASE WHEN p.status = 'menunggu_verifikasi' THEN 1 ELSE 0 END) as menunggu,
        SUM(CASE WHEN p.status = 'ditolak' THEN 1 ELSE 0 END) as ditolak
       FROM sesi_ujian s
       JOIN jenis_ujian j ON j.id = s.jenis_ujian_id
       LEFT JOIN pendaftaran p ON p.sesi_ujian_id = s.id
       GROUP BY s.id
       ORDER BY s.tanggal DESC`
    )
    .all();
}

function getReportData(jenis) {
  if (jenis === "kelulusan") return fetchKelulusan();
  if (jenis === "sesi") return fetchSesi();
  return fetchPeserta();
}

function getFilename(jenis) {
  if (jenis === "kelulusan") return "rekap_kelulusan.xlsx";
  if (jenis === "sesi") return "rekap_sesi_ujian.xlsx";
  return "rekap_peserta.xlsx";
}

function getSheetName(jenis) {
  if (jenis === "kelulusan") return "Kelulusan";
  if (jenis === "sesi") return "Sesi Ujian";
  return "Peserta";
}

export async function GET(request) {
  const { error, status } = await requireAuth([ROLES.ADMIN]);
  if (error) return errorResponse(error, status);

  const { searchParams } = new URL(request.url);
  const jenis = searchParams.get("jenis") || "peserta";
  const format = searchParams.get("format") || "json";
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  // print/all boleh ambil banyak baris; list web dibatasi 100
  const rawPageSize = Number(searchParams.get("pageSize") || 10);
  const pageSize =
    format === "all"
      ? Math.max(1, Math.min(5000, rawPageSize || 5000))
      : Math.min(100, Math.max(1, rawPageSize));

  if (!REPORT_TYPES.includes(jenis)) {
    return errorResponse("Jenis laporan tidak valid");
  }

  const data = getReportData(jenis);

  if (format === "excel") {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, getSheetName(jenis));
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${getFilename(jenis)}"`,
      },
    });
  }

  // format=json | all — untuk list web & print PDF (client)
  const total = data.length;
  const rows =
    format === "all"
      ? data
      : data.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

  return jsonResponse({
    data: rows,
    pagination: {
      page: format === "all" ? 1 : page,
      pageSize: format === "all" ? total : pageSize,
      total,
      totalPages: format === "all" ? 1 : Math.max(1, Math.ceil(total / pageSize)),
    },
    meta: {
      jenis,
      judul:
        jenis === "kelulusan"
          ? "Rekap Hasil Kelulusan Ujian"
          : jenis === "sesi"
            ? "Rekap Sesi Ujian"
            : "Rekap Pendaftaran Peserta Ujian",
      generated_at: new Date().toISOString(),
    },
  });
}
