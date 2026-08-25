"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, Segmented, Table, Tabs, Tag, message } from "antd";
import {
  HiOutlineDownload,
  HiOutlinePrinter,
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineUserCircle,
} from "react-icons/hi";
import { printLaporan } from "@/lib/printLaporan";

const STATUS_LABEL = {
  menunggu_verifikasi: "Menunggu Verifikasi",
  terverifikasi: "Terverifikasi",
  ditolak: "Ditolak",
  lulus: "Lulus",
  tidak_lulus: "Tidak Lulus",
};

const STATUS_COLOR = {
  menunggu_verifikasi: "orange",
  terverifikasi: "green",
  ditolak: "red",
  lulus: "green",
  tidak_lulus: "red",
};

const TAB_CONFIG = {
  peserta: {
    key: "peserta",
    label: "Rekap Peserta",
    icon: <HiOutlineDocumentText />,
    judul: "Rekap Pendaftaran Peserta Ujian",
    columns: [
      { title: "Nama", dataIndex: "nama", key: "nama" },
      { title: "Email", dataIndex: "email", key: "email", ellipsis: true },
      { title: "NIM/ID", dataIndex: "nomor_identitas", key: "nomor_identitas" },
      { title: "Prodi", dataIndex: "prodi", key: "prodi" },
      { title: "Ujian", dataIndex: "nama_ujian", key: "nama_ujian", width: 90 },
      { title: "Tanggal", dataIndex: "tanggal", key: "tanggal", width: 150 },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 150,
        render: (s) => <Tag color={STATUS_COLOR[s]}>{STATUS_LABEL[s] || s}</Tag>,
      },
    ],
    printColumns: [
      { title: "Nama", dataIndex: "nama" },
      { title: "Email", dataIndex: "email" },
      { title: "NIM/ID", dataIndex: "nomor_identitas" },
      { title: "Prodi", dataIndex: "prodi" },
      { title: "Ujian", dataIndex: "nama_ujian" },
      { title: "Tanggal", dataIndex: "tanggal" },
      {
        title: "Status",
        dataIndex: "status",
        render: (v) => STATUS_LABEL[v] || v,
      },
    ],
  },
  kelulusan: {
    key: "kelulusan",
    label: "Rekap Kelulusan",
    icon: <HiOutlineAcademicCap />,
    judul: "Rekap Hasil Kelulusan Ujian",
    columns: [
      { title: "Nama", dataIndex: "nama", key: "nama" },
      { title: "Email", dataIndex: "email", key: "email", ellipsis: true },
      { title: "Prodi", dataIndex: "prodi", key: "prodi" },
      { title: "Ujian", dataIndex: "nama_ujian", key: "nama_ujian", width: 90 },
      { title: "Tanggal", dataIndex: "tanggal", key: "tanggal", width: 150 },
      { title: "Nilai", dataIndex: "nilai", key: "nilai", width: 80 },
      {
        title: "Kelulusan",
        dataIndex: "status_kelulusan",
        key: "status_kelulusan",
        width: 120,
        render: (s) => <Tag color={STATUS_COLOR[s]}>{STATUS_LABEL[s] || s}</Tag>,
      },
    ],
    printColumns: [
      { title: "Nama", dataIndex: "nama" },
      { title: "Email", dataIndex: "email" },
      { title: "Prodi", dataIndex: "prodi" },
      { title: "Ujian", dataIndex: "nama_ujian" },
      { title: "Tanggal", dataIndex: "tanggal" },
      { title: "Nilai", dataIndex: "nilai" },
      {
        title: "Kelulusan",
        dataIndex: "status_kelulusan",
        render: (v) => STATUS_LABEL[v] || v,
      },
    ],
  },
  sesi: {
    key: "sesi",
    label: "Rekap Sesi Ujian",
    icon: <HiOutlineCalendar />,
    judul: "Rekap Sesi Ujian",
    columns: [
      { title: "Jenis Ujian", dataIndex: "nama_ujian", key: "nama_ujian", width: 100 },
      { title: "Tanggal", dataIndex: "tanggal", key: "tanggal", width: 160 },
      { title: "Durasi", dataIndex: "durasi_menit", key: "durasi_menit", width: 90, render: (v) => `${v} menit` },
      { title: "Lokasi", dataIndex: "lokasi", key: "lokasi" },
      { title: "Kuota", dataIndex: "kuota", key: "kuota", width: 80 },
      { title: "Pendaftar", dataIndex: "jumlah_pendaftar", key: "jumlah_pendaftar", width: 100 },
      { title: "Terverifikasi", dataIndex: "terverifikasi", key: "terverifikasi", width: 110 },
      { title: "Menunggu", dataIndex: "menunggu", key: "menunggu", width: 100 },
      { title: "Ditolak", dataIndex: "ditolak", key: "ditolak", width: 90 },
    ],
    printColumns: [
      { title: "Jenis Ujian", dataIndex: "nama_ujian" },
      { title: "Tanggal", dataIndex: "tanggal" },
      { title: "Durasi", dataIndex: "durasi_menit", render: (v) => `${v} menit` },
      { title: "Lokasi", dataIndex: "lokasi" },
      { title: "Kuota", dataIndex: "kuota" },
      { title: "Pendaftar", dataIndex: "jumlah_pendaftar" },
      { title: "Terverifikasi", dataIndex: "terverifikasi" },
      { title: "Menunggu", dataIndex: "menunggu" },
      { title: "Ditolak", dataIndex: "ditolak" },
    ],
  },
};

export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState("peserta");
  const [ujian, setUjian] = useState("ICT");
  const [data, setData] = useState([]);
  const [pimpinan, setPimpinan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  const loadData = useCallback(async (jenis, jenisUjian, page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/laporan?jenis=${jenis}&ujian=${jenisUjian}&format=json&page=${page}&pageSize=${pageSize}`
      );
      const result = await res.json();
      if (!res.ok) {
        message.error(result.error || "Gagal memuat laporan");
        return;
      }
      setData(result.data || []);
      if (result.pimpinan) {
        setPimpinan(result.pimpinan);
      }
      setPagination({
        page: result.pagination.page,
        pageSize: result.pagination.pageSize,
        total: result.pagination.total,
      });
    } catch {
      message.error("Terjadi kesalahan memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(activeTab, ujian, 1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, ujian, loadData]);

  function handleTabChange(key) {
    setActiveTab(key);
  }

  function handleTableChange(pager) {
    loadData(activeTab, ujian, pager.current, pager.pageSize);
  }

  async function handleExportExcel() {
    setExporting(true);
    try {
      const res = await fetch(
        `/api/admin/laporan?jenis=${activeTab}&ujian=${ujian}&format=excel`
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        message.error(err.error || "Gagal export Excel");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        activeTab === "kelulusan"
          ? `rekap_kelulusan_${ujian.toLowerCase()}.xlsx`
          : activeTab === "sesi"
            ? `rekap_sesi_${ujian.toLowerCase()}.xlsx`
            : `rekap_peserta_${ujian.toLowerCase()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      message.success("Excel berhasil diunduh");
    } catch {
      message.error("Gagal mengunduh Excel");
    } finally {
      setExporting(false);
    }
  }

  async function handlePrintPdf() {
    setPrinting(true);
    try {
      // Ambil semua data untuk cetak lengkap
      const res = await fetch(
        `/api/admin/laporan?jenis=${activeTab}&ujian=${ujian}&format=all`
      );
      const result = await res.json();
      if (!res.ok) {
        message.error(result.error || "Gagal memuat data untuk PDF");
        return;
      }

      const config = TAB_CONFIG[activeTab];
      printLaporan({
        judul: `${config.judul} ${ujian}`,
        rows: result.data || [],
        columns: config.printColumns,
        jenis: activeTab,
        pimpinan: result.pimpinan || pimpinan,
      });
    } catch {
      message.error("Gagal mencetak PDF");
    } finally {
      setPrinting(false);
    }
  }

  const config = TAB_CONFIG[activeTab];

  const tabItems = Object.values(TAB_CONFIG).map((tab) => ({
    key: tab.key,
    label: (
      <span className="inline-flex items-center gap-1.5">
        {tab.icon}
        {tab.label}
      </span>
    ),
    children: (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Total: <span className="font-semibold text-slate-700">{pagination.total}</span> data
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              icon={<HiOutlineDownload />}
              loading={exporting}
              onClick={handleExportExcel}
            >
              Export Excel
            </Button>
            <Button
              type="primary"
              icon={<HiOutlinePrinter />}
              loading={printing}
              onClick={handlePrintPdf}
            >
              Print PDF
            </Button>
          </div>
        </div>

        <Table
          columns={tab.columns}
          dataSource={data}
          rowKey={(_, i) => `${activeTab}-${pagination.page}-${i}`}
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total}`,
            pageSizeOptions: ["10", "20", "50"],
          }}
          onChange={handleTableChange}
          locale={{ emptyText: "Belum ada data laporan" }}
        />
      </div>
    ),
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Laporan</h1>
      </div>

      <Card bordered={false} className="shadow-sm">
        {pimpinan && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3.5 text-xs sm:text-sm text-emerald-950">
            <div className="flex items-center gap-2.5">
              <HiOutlineUserCircle className="h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <span className="font-medium text-emerald-800">Penandatangan Laporan: </span>
                <span className="font-bold text-slate-900">{pimpinan.nama_pimpinan}</span>
                <span className="text-slate-600"> ({pimpinan.jabatan_pimpinan})</span>
                {pimpinan.nip_pimpinan && pimpinan.nip_pimpinan !== "-" && (
                  <span className="text-slate-600"> · NIP: {pimpinan.nip_pimpinan}</span>
                )}
                <span className="text-slate-500"> · {pimpinan.kota_laporan}</span>
              </div>
            </div>
            <Link
              href="/admin/pengaturan"
              className="inline-flex items-center font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Ubah Nama Pimpinan →
            </Link>
          </div>
        )}

        <div className="mb-5">
          <p className="mb-2 text-sm font-medium text-slate-700">Jenis Ujian</p>
          <Segmented
            block
            size="large"
            value={ujian}
            options={["ICT", "TOEFL"]}
            onChange={setUjian}
          />
        </div>
        <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} />
      </Card>

      {/* Hidden reference for config judul used above */}
      <span className="hidden">{config?.judul}</span>
    </div>
  );
}
