import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="text-lg font-bold text-white">LP3M UNIKS</p>
            <p className="mt-2 text-sm leading-relaxed">
              Lembaga Pengembangan Pembelajaran dan Penjaminan Mutu   Universitas Islam
              Kuantan Singingi
            </p>
          </div>
          <div>
            <p className="font-semibold text-white">Menu</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white">Beranda</Link></li>
              <li><Link href="/pengumuman" className="hover:text-white">Pengumuman</Link></li>
              <li><Link href="/galeri" className="hover:text-white">Galeri Dokumentasi</Link></li>
              <li><Link href="/pengurusan" className="hover:text-white">Pengurusan</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white">Akun</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white">Login</Link></li>
              <li><Link href="/register" className="hover:text-white">Registrasi Peserta</Link></li>
              <li><Link href="/user" className="hover:text-white">Halaman User</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-8 border-t border-slate-700 pt-6 text-center text-xs text-slate-500">
          Sistem Informasi Ujian ICT dan TOEFL   LP3M UNIKS © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
