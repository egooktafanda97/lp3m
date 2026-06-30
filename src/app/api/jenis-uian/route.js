import { requireAuth } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/api";
import { getDb } from "@/lib/db";
import { ROLES } from "@/lib/constants";

export async function GET() {
  const { error, status } = await requireAuth([ROLES.ADMIN, ROLES.PESERTA]);
  if (error) return errorResponse(error, status);

  const rows = getDb().prepare("SELECT * FROM jenis_ujian ORDER BY nama_ujian").all();
  return jsonResponse({ data: rows });
}
