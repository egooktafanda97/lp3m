import { createSession, loginUser } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/api";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return errorResponse("Email dan password wajib diisi");
    }

    const result = loginUser(email, password);
    if (result.error) {
      return errorResponse(result.error, 401);
    }

    await createSession(result.user);
    return jsonResponse({ user: result.user });
  } catch {
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
