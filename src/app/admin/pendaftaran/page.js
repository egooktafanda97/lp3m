"use client";

import { useEffect, useState } from "react";
import { Button, Card, Input, Modal, Table, Tag, message } from "antd";

const statusColor = {
  menunggu_verifikasi: "orange",
  terverifikasi: "green",
  ditolak: "red",
};

const statusLabel = {
  menunggu_verifikasi: "Menunggu Verifikasi",
  terverifikasi: "Terverifikasi",
  ditolak: "Ditolak",
};

export default function VerifikasiPendaftaranPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [alasan, setAlasan] = useState("");

  async function loadData() {
    setLoading(true);
    const res = await fetch("/api/admin/pendaftaran");
    const result = await res.json();
    setData(result.data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function updateStatus(id, status, alasanPenolakan = null) {
    const res = await fetch("/api/admin/pendaftaran", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, alasan_penolakan: alasanPenolakan }),
    });
    const result = await res.json();
    if (!res.ok) {
      message.error(result.error);
      return;
    }
    message.success("Status diperbarui");
    setRejectModal({ open: false, id: null });
    setAlasan("");
    loadData();
  }

  const columns = [
    { title: "Peserta", dataIndex: "nama_peserta", key: "nama_peserta" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Prodi", dataIndex: "prodi", key: "prodi" },
    { title: "Ujian", dataIndex: "nama_ujian", key: "nama_ujian" },
    { title: "Tanggal", dataIndex: "tanggal", key: "tanggal" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => <Tag color={statusColor[s]}>{statusLabel[s]}</Tag>,
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, record) =>
        record.status === "menunggu_verifikasi" ? (
          <div className="flex gap-2">
            <Button size="small" type="primary" onClick={() => updateStatus(record.id, "terverifikasi")}>
              Verifikasi
            </Button>
            <Button
              size="small"
              danger
              onClick={() => setRejectModal({ open: true, id: record.id })}
            >
              Tolak
            </Button>
          </div>
        ) : record.alasan_penolakan ? (
          <span className="text-xs text-red-500">{record.alasan_penolakan}</span>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Verifikasi Pendaftaran</h1>
      <Card bordered={false} className="shadow-sm">
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} scroll={{ x: 900 }} />
      </Card>

      <Modal
        title="Alasan Penolakan"
        open={rejectModal.open}
        onCancel={() => setRejectModal({ open: false, id: null })}
        onOk={() => updateStatus(rejectModal.id, "ditolak", alasan)}
        okButtonProps={{ disabled: !alasan.trim() }}
      >
        <Input.TextArea
          rows={3}
          value={alasan}
          onChange={(e) => setAlasan(e.target.value)}
          placeholder="Wajib diisi alasan penolakan"
        />
      </Modal>
    </div>
  );
}
