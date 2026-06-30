"use client";

import { useEffect, useState } from "react";
import { Card, Table, Tag } from "antd";

export default function HasilUjianPesertaPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/peserta/pendaftaran")
      .then((r) => r.json())
      .then((result) => {
        const withHasil = (result.data || []).filter((p) => p.status_kelulusan);
        setData(withHasil);
      })
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: "Jenis Ujian", dataIndex: "nama_ujian", key: "nama_ujian" },
    { title: "Tanggal Ujian", dataIndex: "tanggal", key: "tanggal" },
    { title: "Nilai", dataIndex: "nilai", key: "nilai" },
    {
      title: "Kelulusan",
      dataIndex: "status_kelulusan",
      key: "status_kelulusan",
      render: (s) => (
        <Tag color={s === "lulus" ? "green" : "red"}>
          {s === "lulus" ? "Lulus" : "Tidak Lulus"}
        </Tag>
      ),
    },
    { title: "Diumumkan", dataIndex: "tanggal_publish", key: "tanggal_publish" },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Hasil Ujian</h1>
      <p className="text-sm text-slate-500">Hasil tampil otomatis setelah admin publish</p>
      <Card bordered={false} className="shadow-sm">
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
      </Card>
    </div>
  );
}
