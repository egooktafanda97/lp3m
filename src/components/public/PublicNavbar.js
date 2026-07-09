"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "antd";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/pengumuman", label: "Pengumuman" },
  { href: "/galeri", label: "Galeri" },
  { href: "/pengurusan", label: "Pengurusan" },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user || null));
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md"
          : "border-b border-transparent bg-white/70 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white shadow-md shadow-violet-200">
            L
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight text-slate-800">LP3M UNIKS</p>
            <p className="text-xs text-slate-500">Ujian ICT & TOEFL</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                pathname === href
                  ? "bg-violet-100 text-violet-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Link href={user.role === "admin" ? "/admin" : "/user"}>
              <Button type="primary" className="!rounded-lg !shadow-md !shadow-violet-200">
                Halaman {user.role === "admin" ? "Admin" : "Saya"}
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button className="!rounded-lg">Login</Button>
              </Link>
              <Link href="/register">
                <Button type="primary" className="!rounded-lg !shadow-md !shadow-violet-200">
                  Daftar
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <HiOutlineX className="h-6 w-6" /> : <HiOutlineMenu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  pathname === href ? "bg-violet-100 text-violet-700" : "text-slate-600"
                }`}
              >
                {label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
              {user ? (
                <Link href={user.role === "admin" ? "/admin" : "/user"} onClick={() => setMobileOpen(false)}>
                  <Button type="primary" block>
                    Halaman {user.role === "admin" ? "Admin" : "Saya"}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button block>Login</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button type="primary" block>
                      Daftar
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
