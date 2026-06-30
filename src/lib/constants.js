// [FAKTA] Role hanya admin dan peserta
export const ROLES = {
  ADMIN: "admin",
  PESERTA: "peserta",
};

// [FAKTA] Jenis ujian hanya ICT dan TOEFL
export const JENIS_UJIAN = ["ICT", "TOEFL"];

// [ASUMSI] Status pendaftaran   draft dari requirement bagian 6 & 7
export const STATUS_PENDAFTARAN = {
  MENUNGGU: "menunggu_verifikasi",
  TERVERIFIKASI: "terverifikasi",
  DITOLAK: "ditolak",
};

// [ASUMSI] Status kelulusan   draft dari requirement bagian 6 & 7
export const STATUS_KELULUSAN = {
  LULUS: "lulus",
  TIDAK_LULUS: "tidak_lulus",
};

export const SESSION_COOKIE = "lp3m_session";

// [ASUMSI] Kategori pengumuman untuk tab halaman publik
export const KATEGORI_PENGUMUMAN = {
  TERBARU: "terbaru",
  JADWAL: "jadwal",
  HASIL_UJIAN: "hasil_ujian",
};

export const KATEGORI_PENGUMUMAN_LABEL = {
  terbaru: "Pengumuman Terbaru",
  jadwal: "Jadwal Ujian",
  hasil_ujian: "Hasil Ujian",
};

export const KATEGORI_PENGUMUMAN_TABS = [
  { key: "terbaru", label: "Pengumuman Terbaru" },
  { key: "jadwal", label: "Jadwal Ujian" },
  { key: "hasil_ujian", label: "Hasil Ujian" },
];

// [ASUMSI] Kategori galeri dokumentasi
export const KATEGORI_GALERI = [
  "Ujian ICT",
  "Ujian TOEFL",
  "Kegiatan LP3M",
];
