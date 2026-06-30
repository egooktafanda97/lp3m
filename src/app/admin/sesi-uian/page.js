"use client";

import { useEffect, useState } from "react";
import { Button, Card, Form, Input, InputNumber, Modal, Select, Table, message, Popconfirm } from "antd";
import { HiOutlinePlus } from "react-icons/hi";

export default function SesiUjianPage() {
  const [data, setData] = useState([]);
  const [jenisUjian, setJenisUjian] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  async function loadData() {
    setLoading(true);
    const [sesiRes, jenisRes] = await Promise.all([
      fetch("/api/admin/sesi-uian"),
      fetch("/api/jenis-uian"),
    ]);
    const sesiData = await sesiRes.json();
    const jenisData = await jenisRes.json();
    setData(sesiData.data || []);
    setJenisUjian(jenisData.data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreate() {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  }

  function openEdit(record) {
    setEditing(record);
    form.setFieldsValue({
      jenis_ujian_id: record.jenis_ujian_id,
      tanggal: record.tanggal?.replace(" ", "T").slice(0, 16),
      kuota: record.kuota,
      lokasi: record.lokasi,
    });
    setModalOpen(true);
  }

  async function onSubmit(values) {
    const payload = {
      ...values,
      tanggal: values.tanggal.replace("T", " ") + ":00",
    };

    const url = editing ? `/api/admin/sesi-uian/${editing.id}` : "/api/admin/sesi-uian";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();

    if (!res.ok) {
      message.error(result.error || "Gagal menyimpan");
      return;
    }

    message.success(editing ? "Sesi diperbarui" : "Sesi dibuat");
    setModalOpen(false);
    loadData();
  }

  async function handleDelete(id) {
    const res = await fetch(`/api/admin/sesi-uian/${id}`, { method: "DELETE" });
    const result = await res.json();
    if (!res.ok) {
      message.error(result.error);
      return;
    }
    message.success("Sesi dihapus");
    loadData();
  }

  const columns = [
    { title: "Jenis Ujian", dataIndex: "nama_ujian", key: "nama_ujian" },
    { title: "Tanggal", dataIndex: "tanggal", key: "tanggal" },
    { title: "Lokasi", dataIndex: "lokasi", key: "lokasi" },
    { title: "Kuota", dataIndex: "kuota", key: "kuota" },
    { title: "Pendaftar", dataIndex: "jumlah_pendaftar", key: "jumlah_pendaftar" },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button size="small" onClick={() => openEdit(record)}>Edit</Button>
          <Popconfirm title="Hapus sesi ini?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger>Hapus</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Kelola Sesi Ujian</h1>
        <Button type="primary" icon={<HiOutlinePlus />} onClick={openCreate}>
          Tambah Sesi
        </Button>
      </div>

      <Card bordered={false} className="shadow-sm">
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
      </Card>

      <Modal
        title={editing ? "Edit Sesi Ujian" : "Tambah Sesi Ujian"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Form.Item label="Jenis Ujian" name="jenis_ujian_id" rules={[{ required: true }]}>
            <Select
              options={jenisUjian.map((j) => ({ value: j.id, label: j.nama_ujian }))}
            />
          </Form.Item>
          <Form.Item label="Tanggal & Waktu" name="tanggal" rules={[{ required: true }]}>
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item label="Kuota" name="kuota" rules={[{ required: true }]}>
            <InputNumber min={1} className="w-full" />
          </Form.Item>
          <Form.Item label="Lokasi / Link" name="lokasi">
            <Input placeholder="Ruang ujian atau link online" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Simpan
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
