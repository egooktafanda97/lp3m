import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold text-white">
                L
              </span>
              <p className="text-lg font-bold text-white">LP3M UNIKS</p>
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              Lembaga Pengembangan Pembelajaran dan Penjaminan Mutu —
              Universitas Islam Kuantan Singingi
            </p>
          </div>
          <div>
            <p className="font-semibold text-white">Navigasi</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/" className="transition hover:text-violet-300">Beranda</Link></li>
              <li><Link href="/pengumuman" className="transition hover:text-violet-300">Pengumuman</Link></li>
              <li><Link href="/galeri" className="transition hover:text-violet-300">Galeri Dokumentasi</Link></li>
              <li><Link href="/pengurusan" className="transition hover:text-violet-300">Pengurusan</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white">Akun Peserta</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/login" className="transition hover:text-violet-300">Login</Link></li>
              <li><Link href="/register" className="transition hover:text-violet-300">Registrasi</Link></li>
              <li><Link href="/user" className="transition hover:text-violet-300">Halaman User</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-slate-800 pt-8 text-xs sm:flex-row">
          <p>Sistem Informasi Ujian ICT & TOEFL — LP3M UNIKS</p>
          <p>© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
