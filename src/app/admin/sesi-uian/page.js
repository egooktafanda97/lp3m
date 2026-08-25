"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Table,
  Tag,
  message,
  Popconfirm,
} from "antd";
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
    form.setFieldsValue({ durasi_menit: 120 });
    setModalOpen(true);
  }

  function openEdit(record) {
    setEditing(record);
    form.setFieldsValue({
      kode_sesi: record.kode_sesi || "",
      jenis_ujian_id: record.jenis_ujian_id,
      tanggal: record.tanggal?.replace(" ", "T").slice(0, 16),
      durasi_menit: record.durasi_menit || 120,
      kuota: record.kuota,
      lokasi: record.lokasi,
    });
    setModalOpen(true);
  }

  async function onSubmit(values) {
    const payload = {
      ...values,
      kode_sesi: values.kode_sesi ? values.kode_sesi.trim().toUpperCase() : undefined,
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
    {
      title: "Kode Sesi",
      dataIndex: "kode_sesi",
      key: "kode_sesi",
      width: 110,
      render: (v) => (
        <Tag color="blue" className="font-mono font-bold">
          {v || "-"}
        </Tag>
      ),
    },
    { title: "Jenis Ujian", dataIndex: "nama_ujian", key: "nama_ujian", width: 100 },
    { title: "Tanggal", dataIndex: "tanggal", key: "tanggal" },
    {
      title: "Durasi",
      dataIndex: "durasi_menit",
      key: "durasi_menit",
      width: 100,
      render: (value) => `${value} menit`,
    },
    { title: "Lokasi", dataIndex: "lokasi", key: "lokasi" },
    { title: "Kuota", dataIndex: "kuota", key: "kuota", width: 80 },
    { title: "Pendaftar", dataIndex: "jumlah_pendaftar", key: "jumlah_pendaftar", width: 95 },
    {
      title: "Aksi",
      key: "aksi",
      width: 150,
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
          <Form.Item
            label="Kode Sesi (5 Digit / Karakter)"
            name="kode_sesi"
            rules={[
              { required: true, message: "Kode sesi 5 karakter wajib diisi" },
              { len: 5, message: "Kode sesi harus tepat 5 karakter / digit" },
            ]}
            extra="Contoh: ICT01, TFL01, 10001 (5 karakter unik)"
          >
            <Input
              maxLength={5}
              placeholder="Contoh: ICT01"
              className="font-mono uppercase"
              onChange={(e) => {
                form.setFieldsValue({ kode_sesi: e.target.value.toUpperCase() });
              }}
            />
          </Form.Item>
          <Form.Item label="Jenis Ujian" name="jenis_ujian_id" rules={[{ required: true }]}>
            <Select
              options={jenisUjian.map((j) => ({ value: j.id, label: j.nama_ujian }))}
            />
          </Form.Item>
          <Form.Item label="Tanggal & Waktu" name="tanggal" rules={[{ required: true }]}>
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item
            label="Durasi Sesi (menit)"
            name="durasi_menit"
            rules={[{ required: true, message: "Durasi sesi wajib diisi" }]}
          >
            <InputNumber min={15} max={480} step={15} className="w-full" />
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
