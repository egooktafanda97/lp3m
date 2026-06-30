"use client";

import { useEffect, useState } from "react";
import { Card, Table, Tag } from "antd";

export default function JadwalUjianPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/peserta/pendaftaran")
      .then((r) => r.json())
      .then((result) => {
        const verified = (result.data || []).filter((p) => p.status === "terverifikasi");
        setData(verified);
      })
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: "Jenis Ujian", dataIndex: "nama_ujian", key: "nama_ujian" },
    { title: "Tanggal", dataIndex: "tanggal", key: "tanggal" },
    { title: "Lokasi", dataIndex: "lokasi", key: "lokasi" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: () => <Tag color="green">Terverifikasi</Tag>,
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Jadwal Ujian</h1>
      <p className="text-sm text-slate-500">Jadwal ujian yang sudah terverifikasi</p>
      <Card bordered={false} className="shadow-sm">
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
      </Card>
    </div>
  );
}
