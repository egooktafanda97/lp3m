"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, Table, Tabs, Tag, message } from "antd";
import {
  HiOutlineDownload,
  HiOutlinePrinter,
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineCalendar,
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
    judul: "Rekap Sesi Ujian ICT & TOEFL",
    columns: [
      { title: "Jenis Ujian", dataIndex: "nama_ujian", key: "nama_ujian", width: 100 },
      { title: "Tanggal", dataIndex: "tanggal", key: "tanggal", width: 160 },
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
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  const loadData = useCallback(async (jenis, page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/laporan?jenis=${jenis}&format=json&page=${page}&pageSize=${pageSize}`
      );
      const result = await res.json();
      if (!res.ok) {
        message.error(result.error || "Gagal memuat laporan");
        return;
      }
      setData(result.data || []);
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
    loadData(activeTab, 1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, loadData]);

  function handleTabChange(key) {
    setActiveTab(key);
  }

  function handleTableChange(pager) {
    loadData(activeTab, pager.current, pager.pageSize);
  }

  async function handleExportExcel() {
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/laporan?jenis=${activeTab}&format=excel`);
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
          ? "rekap_kelulusan.xlsx"
          : activeTab === "sesi"
            ? "rekap_sesi_ujian.xlsx"
            : "rekap_peserta.xlsx";
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
      const res = await fetch(`/api/admin/laporan?jenis=${activeTab}&format=all`);
      const result = await res.json();
      if (!res.ok) {
        message.error(result.error || "Gagal memuat data untuk PDF");
        return;
      }

      const config = TAB_CONFIG[activeTab];
      printLaporan({
        judul: config.judul,
        rows: result.data || [],
        columns: config.printColumns,
        jenis: activeTab,
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
        <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} />
      </Card>

      {/* Hidden reference for config judul used above */}
      <span className="hidden">{config?.judul}</span>
    </div>
  );
}
