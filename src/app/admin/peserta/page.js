"use client";

import { useEffect, useState } from "react";
import { Button, Card, Input, Modal, Switch, Table, message } from "antd";

export default function KelolaPesertaPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetModal, setResetModal] = useState({ open: false, id: null });
  const [newPassword, setNewPassword] = useState("");

  async function loadData() {
    setLoading(true);
    const res = await fetch("/api/admin/peserta");
    const result = await res.json();
    setData(result.data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function toggleActive(id, is_active) {
    const res = await fetch("/api/admin/peserta", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active }),
    });
    if (!res.ok) {
      message.error("Gagal memperbarui status");
      return;
    }
    message.success("Status diperbarui");
    loadData();
  }

  async function resetPassword() {
    const res = await fetch("/api/admin/peserta", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: resetModal.id, reset_password: newPassword }),
    });
    if (!res.ok) {
      message.error("Gagal reset password");
      return;
    }
    message.success("Password direset");
    setResetModal({ open: false, id: null });
    setNewPassword("");
  }

  const columns = [
    { title: "Nama", dataIndex: "nama", key: "nama" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Prodi", dataIndex: "prodi", key: "prodi" },
    { title: "No. HP", dataIndex: "no_hp", key: "no_hp" },
    {
      title: "Aktif",
      dataIndex: "is_active",
      key: "is_active",
      render: (active, record) => (
        <Switch checked={!!active} onChange={(v) => toggleActive(record.id, v)} />
      ),
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, record) => (
        <Button size="small" onClick={() => setResetModal({ open: true, id: record.id })}>
          Reset Password
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Kelola Akun Peserta</h1>
      <Card bordered={false} className="shadow-sm">
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} scroll={{ x: 800 }} />
      </Card>

      <Modal
        title="Reset Password"
        open={resetModal.open}
        onCancel={() => setResetModal({ open: false, id: null })}
        onOk={resetPassword}
        okButtonProps={{ disabled: newPassword.length < 6 }}
      >
        <Input.Password
          placeholder="Password baru (min 6 karakter)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </Modal>
    </div>
  );
}
