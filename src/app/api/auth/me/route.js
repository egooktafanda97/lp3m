import { getCurrentUser } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/api";
import { getDb } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return errorResponse("Unauthorized", 401);
  }

  let profil = null;
  if (user.role === "peserta") {
    profil = getDb()
      .prepare("SELECT * FROM peserta_profil WHERE user_id = ?")
      .get(user.id);
  }

  return jsonResponse({ user, profil });
}
