import { destroySession } from "@/lib/auth";
import { jsonResponse } from "@/lib/api";

export async function POST() {
  await destroySession();
  return jsonResponse({ message: "Logout berhasil" });
}
