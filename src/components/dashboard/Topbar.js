"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Dropdown, Input, Avatar, message } from "antd";
import {
  HiOutlineMenu,
  HiOutlineBell,
  HiOutlineSearch,
  HiOutlineLogout,
} from "react-icons/hi";

export default function Topbar({ onMenuClick, user }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    message.success("Logout berhasil");
    router.push("/login");
    router.refresh();
  }

  const userMenuItems = [
    {
      key: "logout",
      label: "Logout",
      icon: <HiOutlineLogout className="h-4 w-4" />,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <HiOutlineMenu className="h-5 w-5" />
        </button>
        <Link href="/" className="hidden text-sm text-violet-600 hover:underline lg:inline">
          ← Beranda
        </Link>
        <Input
          prefix={<HiOutlineSearch className="h-4 w-4 text-slate-400" />}
          placeholder="Cari..."
          className="hidden w-64 md:block"
          allowClear
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Badge count={0} size="small" showZero={false}>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Notifikasi"
          >
            <HiOutlineBell className="h-5 w-5" />
          </button>
        </Badge>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={["click"]}>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-100"
          >
            <Avatar size={32} className="bg-violet-600">
              {user?.nama?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
            <span className="hidden text-sm font-medium text-slate-700 sm:inline">
              {user?.nama || "User"}
            </span>
          </button>
        </Dropdown>
      </div>
    </header>
  );
}
