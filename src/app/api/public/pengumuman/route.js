import { jsonResponse } from "@/lib/api";
import { getDb } from "@/lib/db";

export async function GET() {
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
