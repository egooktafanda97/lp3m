"use client";

import { Button, Card } from "antd";
import { HiOutlineDownload } from "react-icons/hi";

export default function LaporanPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Laporan</h1>
      <p className="text-sm text-slate-500">Ekspor rekap data ke format Excel</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card bordered={false} className="shadow-sm">
          <h3 className="font-semibold text-slate-800">Rekap Peserta</h3>
          <p className="mt-1 text-sm text-slate-500">Semua data pendaftaran ujian</p>
          <Button
            type="primary"
            className="mt-4"
            icon={<HiOutlineDownload />}
            href="/api/admin/laporan?jenis=peserta"
          >
            Download Excel
          </Button>
        </Card>

        <Card bordered={false} className="shadow-sm">
          <h3 className="font-semibold text-slate-800">Rekap Kelulusan</h3>
          <p className="mt-1 text-sm text-slate-500">Hasil ujian yang sudah dipublish</p>
          <Button
            type="primary"
            className="mt-4"
            icon={<HiOutlineDownload />}
            href="/api/admin/laporan?jenis=kelulusan"
          >
            Download Excel
          </Button>
        </Card>
      </div>
    </div>
  );
}
