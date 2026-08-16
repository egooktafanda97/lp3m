import { registerPeserta } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/api";
import { PROGRAM_STUDI } from "@/lib/constants";

export async function POST(request) {
  try {
    const body = await request.json();
    const { nama, email, password, nomor_identitas, prodi, no_hp } = body;

    if (!nama || !email || !password || !prodi) {
      return errorResponse("Nama, email, password, dan program studi wajib diisi");
    }

    if (password.length < 6) {
      return errorResponse("Password minimal 6 karakter");
    }

    if (!PROGRAM_STUDI.includes(prodi)) {
      return errorResponse("Program studi tidak valid");
    }

    const result = registerPeserta({
      nama,
      email,
      password,
      nomor_identitas: nomor_identitas || null,
      prodi: prodi || null,
      no_hp: no_hp || null,
    });

    if (result.error) {
      return errorResponse(result.error);
    }

    return jsonResponse({ message: "Registrasi berhasil. Silakan login." }, 201);
  } catch {
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
