"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Table,
  message,
  Popconfirm,
  Select,
  Radio,
  Upload,
  Image,
} from "antd";
import { HiOutlinePlus, HiOutlineUpload } from "react-icons/hi";
import { KATEGORI_GALERI } from "@/lib/constants";

export default function AdminGaleriPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [sumberGambar, setSumberGambar] = useState("upload");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [form] = Form.useForm();

  async function loadData() {
    setLoading(true);
    const res = await fetch("/api/admin/galeri");
    const result = await res.json();
    setData(result.data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function openModal() {
    form.resetFields();
    setSumberGambar("upload");
    setPreviewUrl("");
    setModalOpen(true);
  }

  async function handleUpload(file) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/galeri/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) {
        message.error(result.error || "Upload gagal");
        return false;
      }
      form.setFieldValue("gambar_url", result.url);
      setPreviewUrl(result.url);
      message.success("Foto berhasil diupload");
      return false;
    } catch {
      message.error("Upload gagal");
      return false;
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values) {
    if (!values.gambar_url) {
      message.error("Upload foto atau isi URL gambar");
      return;
    }

    const res = await fetch("/api/admin/galeri", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const result = await res.json();
    if (!res.ok) {
      message.error(result.error);
      return;
    }
    message.success("Dokumentasi ditambahkan");
    setModalOpen(false);
    form.resetFields();
    setPreviewUrl("");
    loadData();
  }

  async function handleDelete(id) {
    const res = await fetch(`/api/admin/galeri?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      message.error("Gagal menghapus");
      return;
    }
    message.success("Dihapus");
    loadData();
  }

  const columns = [
    {
      title: "Foto",
      dataIndex: "gambar_url",
      key: "gambar_url",
      width: 80,
      render: (url) => (
        <Image
          src={url}
          alt="preview"
          width={56}
          height={56}
          className="rounded object-cover"
          style={{ objectFit: "cover" }}
        />
      ),
    },
    { title: "Judul", dataIndex: "judul", key: "judul" },
    { title: "Kategori", dataIndex: "kategori", key: "kategori", width: 130 },
    {
      title: "Sumber",
      dataIndex: "gambar_url",
      key: "sumber",
      ellipsis: true,
      render: (url) => (
        <span className="text-xs text-slate-500">
          {url?.startsWith("/uploads/") ? "Upload lokal" : url}
        </span>
      ),
    },
    {
      title: "Aksi",
      key: "aksi",
      width: 90,
      render: (_, record) => (
        <Popconfirm title="Hapus foto ini?" onConfirm={() => handleDelete(record.id)}>
          <Button size="small" danger>
            Hapus
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Galeri Dokumentasi</h1>
          <p className="text-sm text-slate-500">Upload foto dari komputer atau gunakan URL eksternal</p>
        </div>
        <Button type="primary" icon={<HiOutlinePlus />} onClick={openModal}>
          Tambah Foto
        </Button>
      </div>

      <Card bordered={false} className="shadow-sm">
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} scroll={{ x: 700 }} />
      </Card>

      <Modal
        title="Tambah Foto Galeri"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={520}
      >
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Form.Item label="Judul" name="judul" rules={[{ required: true, message: "Judul wajib diisi" }]}>
            <Input placeholder="Contoh: Pelaksanaan Ujian ICT 2026" />
          </Form.Item>

          <Form.Item label="Kategori" name="kategori" rules={[{ required: true, message: "Pilih kategori" }]}>
            <Select
              placeholder="Pilih kategori"
              options={KATEGORI_GALERI.map((k) => ({ value: k, label: k }))}
            />
          </Form.Item>

          <Form.Item label="Deskripsi" name="deskripsi">
            <Input.TextArea rows={2} placeholder="Keterangan singkat (opsional)" />
          </Form.Item>

          <Form.Item label="Sumber Gambar">
            <Radio.Group
              value={sumberGambar}
              onChange={(e) => {
                setSumberGambar(e.target.value);
                form.setFieldValue("gambar_url", "");
                setPreviewUrl("");
              }}
              className="mb-3"
            >
              <Radio.Button value="upload">Upload Foto</Radio.Button>
              <Radio.Button value="url">URL Gambar</Radio.Button>
            </Radio.Group>

            {sumberGambar === "upload" ? (
              <>
                <Upload
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  showUploadList={false}
                  beforeUpload={handleUpload}
                  disabled={uploading}
                >
                  <Button icon={<HiOutlineUpload />} loading={uploading}>
                    Pilih File (max 5MB)
                  </Button>
                </Upload>
                <Form.Item name="gambar_url" hidden>
                  <Input />
                </Form.Item>
              </>
            ) : (
              <Form.Item
                name="gambar_url"
                rules={[{ required: true, message: "URL gambar wajib diisi" }]}
              >
                <Input
                  placeholder="https://example.com/foto.jpg"
                  onChange={(e) => setPreviewUrl(e.target.value)}
                />
              </Form.Item>
            )}
          </Form.Item>

          {previewUrl && (
            <div className="mb-4 overflow-hidden rounded-lg border border-slate-200">
              <Image src={previewUrl} alt="Preview" className="max-h-48 w-full object-cover" />
            </div>
          )}

          <Button type="primary" htmlType="submit" block>
            Simpan ke Galeri
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
