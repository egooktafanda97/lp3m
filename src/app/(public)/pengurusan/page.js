// [ASUMSI] Struktur pengurusan LP3M   placeholder, perlu konfirmasi data resmi dari LP3M
const pengurus = [
  {
    jabatan: "Kepala LP3M",
    nama: "Dr. [Nama Lengkap], M.Pd.",
    kontak: "lp3m@uniks.ac.id",
  },
  {
    jabatan: "Sekretaris",
    nama: "[Nama Lengkap], S.Pd., M.Pd.",
    kontak: "-",
  },
  {
    jabatan: "Koordinator Ujian ICT",
    nama: "[Nama Lengkap], S.Kom., M.Kom.",
    kontak: "-",
  },
  {
    jabatan: "Koordinator Ujian TOEFL",
    nama: "[Nama Lengkap], S.Pd., M.A.",
    kontak: "-",
  },
  {
    jabatan: "Staff Administrasi Ujian",
    nama: "[Nama Lengkap], S.Adm.",
    kontak: "-",
  },
];

export default function PengurusanPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-6">
      <h1 className="text-3xl font-bold text-slate-800">Pengurusan LP3M</h1>
      <p className="mt-2 text-slate-500">
        Lembaga Pengembangan Pembelajaran dan Penjaminan Mutu   Universitas Islam Kuantan Singingi
      </p>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Tugas & Fungsi</h2>
        <p className="mt-3 leading-relaxed text-slate-600">
          LP3M bertanggung jawab dalam pengembangan pembelajaran, penjaminan mutu, serta
          penyelenggaraan ujian kompetensi termasuk ujian ICT dan TOEFL bagi civitas
          akademika UNIKS.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Struktur Pengurus</h2>
        {pengurus.map((item) => (
          <div
            key={item.jabatan}
            className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium text-violet-600">{item.jabatan}</p>
              <p className="mt-1 font-semibold text-slate-800">{item.nama}</p>
            </div>
            <p className="text-sm text-slate-500">{item.kontak}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-slate-400">
        * Data pengurus dapat diperbarui oleh admin LP3M sesuai struktur organisasi terbaru.
      </p>
    </div>
  );
}
