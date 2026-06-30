"use client";

import { useEffect, useState } from "react";
import { Button, Card, Table, Tag, message } from "antd";

const statusConfig = {
  menunggu_verifikasi: {
    color: "orange",
    label: "Anda sudah terdaftar   Menunggu Verifikasi",
  },
  terverifikasi: {
    color: "green",
    label: "Anda sudah terdaftar   Terverifikasi",
  },
  ditolak: {
    color: "red",
    label: "Pendaftaran ditolak",
  },
};

export default function DaftarUjianPage() {
  const [sesi, setSesi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);

  async function loadData() {
    setLoading(true);
    const res = await fetch("/api/sesi-uian");
    const result = await res.json();
    setSesi(result.data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDaftar(sesiId) {
    setSubmitting(sesiId);
    const res = await fetch("/api/peserta/pendaftaran", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sesi_ujian_id: sesiId }),
    });
    const result = await res.json();
    setSubmitting(null);

    if (!res.ok) {
      message.error(result.error);
      return;
    }
    message.success("Pendaftaran berhasil. Menunggu verifikasi admin.");
    loadData();
  }

  const columns = [
    { title: "Jenis Ujian", dataIndex: "nama_ujian", key: "nama_ujian" },
    { title: "Tanggal", dataIndex: "tanggal", key: "tanggal" },
    { title: "Lokasi", dataIndex: "lokasi", key: "lokasi" },
    {
      title: "Kuota",
      key: "kuota",
      render: (_, r) => `${r.terisi || 0} / ${r.kuota}`,
    },
    {
      title: "Status / Aksi",
      key: "aksi",
      render: (_, record) => {
        const status = record.status_pendaftaran_saya;

        if (status) {
          const cfg = statusConfig[status] || {
            color: "blue",
            label: "Anda sudah terdaftar",
          };
          return <Tag color={cfg.color}>{cfg.label}</Tag>;
        }

        const penuh = (record.terisi || 0) >= record.kuota;
        return (
          <Button
            type="primary"
            size="small"
            loading={submitting === record.id}
            disabled={penuh}
            onClick={() => handleDaftar(record.id)}
          >
            {penuh ? "Kuota Penuh" : "Daftar"}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Daftar Ujian</h1>
        <p className="text-sm text-slate-500">Pendaftaran online tanpa datang ke kantor LP3M</p>
      </div>
      <Card bordered={false} className="shadow-sm">
        <Table columns={columns} dataSource={sesi} rowKey="id" loading={loading} />
      </Card>
    </div>
  );
}
