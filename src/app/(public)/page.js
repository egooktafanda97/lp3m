import Link from "next/link";
import {
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineSpeakerphone,
} from "react-icons/hi";

const features = [
  {
    icon: HiOutlineClipboardList,
    title: "Pendaftaran Online",
    desc: "Daftar ujian ICT & TOEFL tanpa harus datang ke kantor LP3M.",
  },
  {
    icon: HiOutlineCalendar,
    title: "Jadwal Terpusat",
    desc: "Informasi jadwal ujian tersedia real-time di portal.",
  },
  {
    icon: HiOutlineAcademicCap,
    title: "Hasil Ujian",
    desc: "Cek status kelulusan langsung setelah admin mempublikasikan.",
  },
  {
    icon: HiOutlineSpeakerphone,
    title: "Pengumuman Resmi",
    desc: "Menggantikan broadcast manual via grup WhatsApp.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 lg:px-6 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-violet-200">LP3M Universitas Islam Kuantan Singingi</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight lg:text-5xl">
              Sistem Informasi Ujian ICT & TOEFL
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-violet-100">
              Portal resmi pendaftaran, jadwal, dan hasil ujian. Terintegrasi, efisien,
              dan dapat diakses kapan saja.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-violet-700 shadow hover:bg-violet-50"
              >
                Daftar Sebagai Peserta
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-lg border-2 border-white px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
        <h2 className="text-center text-2xl font-bold text-slate-800">Layanan Sistem</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-slate-500">
          Mengatasi keterbatasan pendaftaran manual dan informasi yang hanya tersebar lewat grup WhatsApp.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50">
                <Icon className="h-6 w-6 text-violet-600" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-800">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Jenis Ujian</h2>
              <p className="mt-3 text-slate-600 leading-relaxed">
                Sistem ini melayani pendaftaran dan pengelolaan dua jenis ujian resmi LP3M:
              </p>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-blue-100 text-sm font-bold text-blue-700">
                    ICT
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">Information and Communication Technology</p>
                    <p className="text-sm text-slate-500">Ujian kompetensi teknologi informasi dan komunikasi.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-emerald-100 text-sm font-bold text-emerald-700">
                    EN
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">TOEFL</p>
                    <p className="text-sm text-slate-500">Test of English as a Foreign Language.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl bg-slate-900 p-8 text-white">
              <h3 className="text-xl font-bold">Akses Cepat</h3>
              <div className="mt-6 space-y-3">
                <Link href="/pengumuman" className="block rounded-lg bg-slate-800 px-4 py-3 text-sm hover:bg-slate-700">
                  Lihat Pengumuman Terbaru →
                </Link>
                <Link href="/galeri" className="block rounded-lg bg-slate-800 px-4 py-3 text-sm hover:bg-slate-700">
                  Galeri Dokumentasi →
                </Link>
                <Link href="/pengurusan" className="block rounded-lg bg-slate-800 px-4 py-3 text-sm hover:bg-slate-700">
                  Struktur Pengurusan LP3M →
                </Link>
                <Link href="/user" className="block rounded-lg bg-violet-600 px-4 py-3 text-sm font-medium hover:bg-violet-500">
                  Masuk ke Halaman User →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
