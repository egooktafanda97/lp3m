import { requireAuth } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/api";
import { getPengaturan, updatePengaturan, logAktivitas } from "@/lib/db";
import { ROLES } from "@/lib/constants";

export async function GET() {
  const { error, status } = await requireAuth([ROLES.ADMIN, ROLES.KEPALA_LP3M]);
  if (error) return errorResponse(error, status);

  const data = getPengaturan();
  return jsonResponse({ data });
}

export async function PUT(request) {
  const { error, status, user } = await requireAuth([ROLES.ADMIN]);
  if (error) return errorResponse(error, status);

  try {
    const body = await request.json();
    const { nama_pimpinan, jabatan_pimpinan, nip_pimpinan, kota_laporan } = body || {};

    if (!nama_pimpinan || typeof nama_pimpinan !== "string" || !nama_pimpinan.trim()) {
      return errorResponse("Nama pimpinan tidak boleh kosong");
    }

    const payload = {
      nama_pimpinan: nama_pimpinan.trim(),
      jabatan_pimpinan:
        jabatan_pimpinan && typeof jabatan_pimpinan === "string" && jabatan_pimpinan.trim()
          ? jabatan_pimpinan.trim()
          : "Kepala LP3M",
      nip_pimpinan:
        nip_pimpinan && typeof nip_pimpinan === "string" && nip_pimpinan.trim()
          ? nip_pimpinan.trim()
          : "-",
      kota_laporan:
        kota_laporan && typeof kota_laporan === "string" && kota_laporan.trim()
          ? kota_laporan.trim()
          : "Teluk Kuantan",
    };

    const updated = updatePengaturan(payload);
    logAktivitas(
      user.id,
      "update_pengaturan_pimpinan",
      `Nama: ${payload.nama_pimpinan}, Jabatan: ${payload.jabatan_pimpinan}, NIP: ${payload.nip_pimpinan}`
    );

    return jsonResponse({
      message: "Pengaturan nama pimpinan berhasil disimpan",
      data: updated,
    });
  } catch (err) {
    return errorResponse(err.message || "Gagal memperbarui pengaturan", 500);
  }
}
