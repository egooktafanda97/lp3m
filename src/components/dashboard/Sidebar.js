"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineHome,
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineSpeakerphone,
  HiOutlineAcademicCap,
  HiOutlineX,
  HiOutlineClipboardCheck,
} from "react-icons/hi";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: HiOutlineHome },
  { href: "/admin/sesi-uian", label: "Sesi Ujian", icon: HiOutlineCalendar },
  { href: "/admin/pendaftaran", label: "Verifikasi Pendaftaran", icon: HiOutlineClipboardCheck },
  { href: "/admin/hasil", label: "Hasil Ujian", icon: HiOutlineAcademicCap },
  { href: "/admin/pengumuman", label: "Pengumuman", icon: HiOutlineSpeakerphone },
  { href: "/admin/peserta", label: "Kelola Peserta", icon: HiOutlineUsers },
  { href: "/admin/galeri", label: "Galeri Dokumentasi", icon: HiOutlineDocumentText },
  { href: "/admin/laporan", label: "Laporan", icon: HiOutlineChartBar },
];

const pesertaNav = [
  { href: "/user", label: "Dashboard", icon: HiOutlineHome },
  { href: "/user/daftar", label: "Daftar Ujian", icon: HiOutlineClipboardList },
  { href: "/user/pendaftaran", label: "Status Pendaftaran", icon: HiOutlineClipboardCheck },
  { href: "/user/jadwal", label: "Jadwal Ujian", icon: HiOutlineCalendar },
  { href: "/user/hasil", label: "Hasil Ujian", icon: HiOutlineAcademicCap },
  { href: "/user/pengumuman", label: "Pengumuman", icon: HiOutlineSpeakerphone },
];

export default function Sidebar({ open, onClose, role }) {
  const pathname = usePathname();
  const navItems = role === "admin" ? adminNav : pesertaNav;
  const homeHref = role === "admin" ? "/admin" : "/user";

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-slate-900 text-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-700/60 px-6">
          <Link href={homeHref} className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold">
              L
            </span>
            <span className="text-sm font-semibold leading-tight">
              LP3M UNIKS
              <br />
              <span className="text-xs font-normal text-slate-400">Ujian ICT & TOEFL</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-violet-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-700/60 p-4">
          <p className="text-xs text-slate-400">
            Role: <span className="font-medium text-slate-200">{role}</span>
          </p>
        </div>
      </aside>
    </>
  );
}
