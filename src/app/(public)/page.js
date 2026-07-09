import Link from "next/link";
import {
  HiOutlineAcademicCap,
  HiOutlineArrowRight,
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlinePhotograph,
  HiOutlineSpeakerphone,
  HiOutlineUserGroup,
} from "react-icons/hi";

const features = [
  {
    icon: HiOutlineClipboardList,
    title: "Pendaftaran Online",
    desc: "Daftar ujian ICT & TOEFL tanpa antre di kantor LP3M.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: HiOutlineCalendar,
    title: "Jadwal Terpusat",
    desc: "Informasi jadwal ujian real-time, selalu terupdate.",
    color: "from-indigo-500 to-blue-600",
  },
  {
    icon: HiOutlineAcademicCap,
    title: "Hasil Ujian",
    desc: "Cek kelulusan langsung setelah admin publish hasil.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: HiOutlineSpeakerphone,
    title: "Pengumuman Resmi",
    desc: "Info resmi LP3M — tanpa bergantung grup WhatsApp.",
    color: "from-amber-500 to-orange-600",
  },
];

const stats = [
  { label: "Jenis Ujian", value: "2", sub: "ICT & TOEFL" },
  { label: "Akses", value: "24/7", sub: "Portal Online" },
  { label: "Instansi", value: "LP3M", sub: "UNIKS" },
];

const quickLinks = [
  { href: "/pengumuman", label: "Pengumuman", icon: HiOutlineSpeakerphone },
  { href: "/galeri", label: "Galeri Foto", icon: HiOutlinePhotograph },
  { href: "/pengurusan", label: "Pengurusan", icon: HiOutlineUserGroup },
  { href: "/register", label: "Daftar Ujian", icon: HiOutlineClipboardList, highlight: true },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />
          <div className="absolute -right-20 top-20 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-purple-400/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-24 lg:px-6 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1 text-xs font-medium tracking-wide text-violet-200">
                LP3M · Universitas Islam Kuantan Singingi
              </span>
              <h1 className="mt-6 text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
                Portal Ujian{" "}
                <span className="bg-gradient-to-r from-violet-300 to-indigo-200 bg-clip-text text-transparent">
                  ICT & TOEFL
                </span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-300">
                Sistem informasi terintegrasi untuk pendaftaran, jadwal, dan hasil ujian —
                efisien, akurat, dan dapat diakses kapan saja.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 rounded-xl bg-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-500"
                >
                  Daftar Sebagai Peserta
                  <HiOutlineArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  Login
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl border border-white/10 bg-slate-900/60 p-5 text-center"
                    >
                      <p className="text-3xl font-bold text-violet-300">{s.value}</p>
                      <p className="mt-1 text-sm font-medium text-white">{s.label}</p>
                      <p className="text-xs text-slate-400">{s.sub}</p>
                    </div>
                  ))}
                  <div className="col-span-2 rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 p-5">
                    <p className="text-sm font-medium text-violet-200">Menggantikan proses manual</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      Tidak perlu datang ke kantor atau menunggu info lewat grup WhatsApp.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats mobile */}
      <section className="border-b border-slate-200 bg-white lg:hidden">
        <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-slate-100 px-4 py-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-xl font-bold text-violet-600">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
              Layanan Sistem
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Semua dalam Satu Portal
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-500">
              Dirancang untuk mengatasi pendaftaran manual dan informasi yang tersebar
              tidak terkontrol.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-md`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-800">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Jenis Ujian */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
                Program Ujian
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">Jenis Ujian LP3M</h2>
              <p className="mt-4 leading-relaxed text-slate-600">
                Dua jenis ujian resmi yang dikelola LP3M Universitas Islam Kuantan Singingi.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-lg font-bold text-blue-700">
                    ICT
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      Information and Communication Technology
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Ujian kompetensi teknologi informasi dan komunikasi.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-lg font-bold text-emerald-700">
                    EN
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">TOEFL</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Test of English as a Foreign Language.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {quickLinks.map(({ href, label, icon: Icon, highlight }) => (
                <Link
                  key={href}
                  href={href}
                  className={`group flex flex-col justify-between rounded-2xl border p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                    highlight
                      ? "border-violet-300 bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-200 hover:shadow-violet-300"
                      : "border-slate-200 bg-white hover:border-violet-200 hover:shadow-violet-50"
                  }`}
                >
                  <Icon
                    className={`h-7 w-7 ${highlight ? "text-violet-200" : "text-violet-600"}`}
                  />
                  <div className="mt-8">
                    <p className={`font-semibold ${highlight ? "text-white" : "text-slate-800"}`}>
                      {label}
                    </p>
                    <p
                      className={`mt-1 flex items-center gap-1 text-xs ${
                        highlight ? "text-violet-200" : "text-slate-400 group-hover:text-violet-600"
                      }`}
                    >
                      Buka <HiOutlineArrowRight className="h-3 w-3" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 py-16">
        <div className="mx-auto max-w-6xl px-4 text-center lg:px-6">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Siap Mendaftar Ujian?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-violet-100">
            Buat akun peserta, pilih sesi ujian ICT atau TOEFL, dan pantau statusnya secara online.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-violet-700 shadow-lg transition hover:bg-violet-50"
            >
              Registrasi Sekarang
            </Link>
            <Link
              href="/pengumuman"
              className="rounded-xl border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Lihat Pengumuman
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
