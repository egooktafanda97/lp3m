"use client";

import { useEffect, useState } from "react";
import { Button, Card, Table, Tag } from "antd";
import { HiOutlineEye } from "react-icons/hi";

const statusColor = {
  menunggu_verifikasi: "orange",
  terverifikasi: "green",
  ditolak: "red",
};

export default function StatusPendaftaranPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/peserta/pendaftaran")
      .then((r) => r.json())
      .then((result) => setData(result.data || []))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: "Jenis Ujian", dataIndex: "nama_ujian", key: "nama_ujian" },
    { title: "Tanggal Daftar", dataIndex: "created_at", key: "created_at" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => (
        <Tag color={statusColor[s]}>{s.replace(/_/g, " ")}</Tag>
      ),
    },
    {
      title: "Bukti Pembayaran",
      key: "bukti_pembayaran",
      render: (_, record) => record.dokumen_path ? (
        <Button
          size="small"
          icon={<HiOutlineEye />}
          href={`/api/bukti-pembayaran/${record.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Lihat
        </Button>
      ) : "-",
    },
    {
      title: "Keterangan",
      dataIndex: "alasan_penolakan",
      key: "alasan_penolakan",
      render: (v) => v || "-",
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Status Pendaftaran</h1>
      <Card bordered={false} className="shadow-sm">
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
      </Card>
    </div>
  );
}
