"use client";

import { useEffect, useState } from "react";
import { Button, Card, Form, Input, Modal, List, message, Popconfirm, Select, Tag, Tabs } from "antd";
import { HiOutlinePlus } from "react-icons/hi";
import { KATEGORI_PENGUMUMAN_LABEL, KATEGORI_PENGUMUMAN_TABS } from "@/lib/constants";

export default function PengumumanAdminPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  async function loadData() {
    setLoading(true);
    const res = await fetch("/api/pengumuman");
    const result = await res.json();
    setData(result.data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function onSubmit(values) {
    const res = await fetch("/api/pengumuman", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const result = await res.json();
    if (!res.ok) {
      message.error(result.error);
      return;
    }
    message.success("Pengumuman dipublikasikan");
    setModalOpen(false);
    form.resetFields();
    loadData();
  }

  async function handleDelete(id) {
    const res = await fetch(`/api/pengumuman?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      message.error("Gagal menghapus");
      return;
    }
    message.success("Pengumuman dihapus");
    loadData();
  }

  function renderList(items) {
    return (
      <List
        dataSource={items}
        locale={{ emptyText: "Belum ada pengumuman" }}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Popconfirm key="del" title="Hapus pengumuman?" onConfirm={() => handleDelete(item.id)}>
                <Button size="small" danger>Hapus</Button>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              title={
                <div className="flex items-center gap-2">
                  <span>{item.judul}</span>
                  <Tag color="violet">{KATEGORI_PENGUMUMAN_LABEL[item.kategori]}</Tag>
                </div>
              }
              description={
                <div>
                  <p className="whitespace-pre-wrap text-slate-600">{item.isi}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {item.nama_admin}   {item.tanggal_publish}
                  </p>
                </div>
              }
            />
          </List.Item>
        )}
      />
    );
  }

  const tabItems = [
    {
      key: "semua",
      label: "Semua",
      children: renderList(data),
    },
    ...KATEGORI_PENGUMUMAN_TABS.map(({ key, label }) => ({
      key,
      label,
      children: renderList(data.filter((item) => item.kategori === key)),
    })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pengumuman</h1>
          <p className="text-sm text-slate-500">Menggantikan broadcast manual via grup WhatsApp</p>
        </div>
        <Button type="primary" icon={<HiOutlinePlus />} onClick={() => setModalOpen(true)}>
          Buat Pengumuman
        </Button>
      </div>

      <Card bordered={false} className="shadow-sm" loading={loading}>
        <Tabs items={tabItems} />
      </Card>

      <Modal title="Buat Pengumuman" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          initialValues={{ kategori: "terbaru" }}
        >
          <Form.Item label="Kategori" name="kategori" rules={[{ required: true }]}>
            <Select
              options={KATEGORI_PENGUMUMAN_TABS.map(({ key, label }) => ({
                value: key,
                label,
              }))}
            />
          </Form.Item>
          <Form.Item label="Judul" name="judul" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Isi" name="isi" rules={[{ required: true }]}>
            <Input.TextArea rows={5} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Publikasikan
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
