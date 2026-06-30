import { jsonResponse } from "@/lib/api";
import { getDb } from "@/lib/db";

export async function GET() {
  const rows = getDb()
    .prepare("SELECT * FROM galeri_dokumentasi ORDER BY created_at DESC")
    .all();

  return jsonResponse({ data: rows });
}
