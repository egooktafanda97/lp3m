import { requireAuth } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/api";
import { getDb, logAktivitas } from "@/lib/db";
import { ROLES, STATUS_KELULUSAN, STATUS_PENDAFTARAN } from "@/lib/constants";

function getPublishedResults() {
  return getDb()
    .prepare(
      `SELECT h.*, p.peserta_id, p.sesi_ujian_id, p.status as status_pendaftaran,
        u.nama as nama_peserta, j.nama_ujian, s.tanggal
       FROM hasil_ujian h
       JOIN pendaftaran p ON p.id = h.pendaftaran_id
       JOIN users u ON u.id = p.peserta_id
       JOIN sesi_ujian s ON s.id = p.sesi_ujian_id
       JOIN jenis_ujian j ON j.id = s.jenis_ujian_id
       ORDER BY h.tanggal_publish DESC`
    )
    .all();
}

function getInputList(sesiUjianId = null) {
  let query = `
    SELECT p.id as pendaftaran_id, u.nama as nama_peserta, u.email,
      pp.nomor_identitas, pp.prodi,
      j.nama_ujian, s.tanggal, s.id as sesi_ujian_id, s.lokasi,
      h.id as hasil_id, h.nilai, h.status_kelulusan, h.tanggal_publish
    FROM pendaftaran p
    JOIN users u ON u.id = p.peserta_id
    LEFT JOIN peserta_profil pp ON pp.user_id = u.id
    JOIN sesi_ujian s ON s.id = p.sesi_ujian_id
    JOIN jenis_ujian j ON j.id = s.jenis_ujian_id
    LEFT JOIN hasil_ujian h ON h.pendaftaran_id = p.id
    WHERE p.status = ?
  `;
  const params = [STATUS_PENDAFTARAN.TERVERIFIKASI];

  if (sesiUjianId) {
    query += " AND p.sesi_ujian_id = ?";
    params.push(sesiUjianId);
  }

  query += " ORDER BY s.tanggal DESC, u.nama ASC";

  return getDb().prepare(query).all(...params);
}

function upsertHasil(pendaftaran_id, nilai, status_kelulusan) {
  const db = getDb();
  const pendaftaran = db.prepare("SELECT * FROM pendaftaran WHERE id = ?").get(pendaftaran_id);

  if (!pendaftaran || pendaftaran.status !== STATUS_PENDAFTARAN.TERVERIFIKASI) {
    return { error: `Pendaftaran #${pendaftaran_id} tidak valid atau belum terverifikasi` };
  }

  if (![STATUS_KELULUSAN.LULUS, STATUS_KELULUSAN.TIDAK_LULUS].includes(status_kelulusan)) {
    return { error: `Status kelulusan tidak valid untuk pendaftaran #${pendaftaran_id}` };
  }

  const existing = db.prepare("SELECT id FROM hasil_ujian WHERE pendaftaran_id = ?").get(pendaftaran_id);
  const now = new Date().toISOString();

  if (existing) {
    db.prepare(
      "UPDATE hasil_ujian SET nilai = ?, status_kelulusan = ?, tanggal_publish = ? WHERE pendaftaran_id = ?"
    ).run(nilai || null, status_kelulusan, now, pendaftaran_id);
  } else {
    db.prepare(
      "INSERT INTO hasil_ujian (pendaftaran_id, nilai, status_kelulusan, tanggal_publish) VALUES (?, ?, ?, ?)"
    ).run(pendaftaran_id, nilai || null, status_kelulusan, now);
  }

  return { ok: true };
}

export async function GET(request) {
  const { error, status } = await requireAuth([ROLES.ADMIN]);
  if (error) return errorResponse(error, status);

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view");
  const sesiUjianId = searchParams.get("sesi_ujian_id");

  if (view === "input") {
    const rows = getInputList(sesiUjianId ? Number(sesiUjianId) : null);
    return jsonResponse({ data: rows });
  }

  return jsonResponse({ data: getPublishedResults() });
}

export async function POST(request) {
  const { error, status, user } = await requireAuth([ROLES.ADMIN]);
  if (error) return errorResponse(error, status);

  const body = await request.json();

  if (Array.isArray(body.items)) {
    const results = { success: 0, failed: [], skipped: 0 };

    const tx = getDb().transaction(() => {
      for (const item of body.items) {
        const { pendaftaran_id, nilai, status_kelulusan } = item;

        if (!pendaftaran_id || !status_kelulusan) {
          results.skipped += 1;
          continue;
        }

        const result = upsertHasil(pendaftaran_id, nilai, status_kelulusan);
        if (result.error) {
          results.failed.push({ pendaftaran_id, error: result.error });
        } else {
          results.success += 1;
        }
      }
    });

    tx();
    logAktivitas(user.id, "publish_hasil_ujian_massal", `success=${results.success}`);
    return jsonResponse({
      message: `${results.success} hasil berhasil dipublikasikan`,
      ...results,
    });
  }

  const { pendaftaran_id, nilai, status_kelulusan } = body;

  if (!pendaftaran_id || !status_kelulusan) {
    return errorResponse("Pendaftaran dan status kelulusan wajib diisi");
  }

  const result = upsertHasil(pendaftaran_id, nilai, status_kelulusan);
  if (result.error) return errorResponse(result.error);

  logAktivitas(user.id, "publish_hasil_ujian", `pendaftaran_id=${pendaftaran_id}`);
  return jsonResponse({ message: "Hasil ujian dipublikasikan" }, 201);
}
