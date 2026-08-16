"use client";

import { useEffect, useState } from "react";
import { Alert, Button, Card, Modal, Table, Tag, Upload, message } from "antd";
import { HiOutlineUpload } from "react-icons/hi";

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
  const [selectedSesi, setSelectedSesi] = useState(null);
  const [buktiPembayaran, setBuktiPembayaran] = useState(null);

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

  async function handleDaftar() {
    if (!buktiPembayaran) {
      message.error("Bukti pembayaran wajib dipilih");
      return;
    }

    const sesiId = selectedSesi.id;
    setSubmitting(sesiId);
    const formData = new FormData();
    formData.append("sesi_ujian_id", String(sesiId));
    formData.append("bukti_pembayaran", buktiPembayaran);
    const res = await fetch("/api/peserta/pendaftaran", {
      method: "POST",
      body: formData,
    });
    const result = await res.json();
    setSubmitting(null);

    if (!res.ok) {
      message.error(result.error);
      return;
    }
    message.success("Pendaftaran berhasil. Menunggu verifikasi admin.");
    setSelectedSesi(null);
    setBuktiPembayaran(null);
    loadData();
  }

  const columns = [
    { title: "Jenis Ujian", dataIndex: "nama_ujian", key: "nama_ujian" },
    { title: "Tanggal", dataIndex: "tanggal", key: "tanggal" },
    {
      title: "Durasi",
      dataIndex: "durasi_menit",
      key: "durasi_menit",
      render: (value) => `${value} menit`,
    },
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
            onClick={() => setSelectedSesi(record)}
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

      <Modal
        title="Daftar Ujian"
        open={Boolean(selectedSesi)}
        onCancel={() => {
          setSelectedSesi(null);
          setBuktiPembayaran(null);
        }}
        onOk={handleDaftar}
        okText="Kirim Pendaftaran"
        confirmLoading={submitting === selectedSesi?.id}
        okButtonProps={{ disabled: !buktiPembayaran }}
      >
        <div className="space-y-4">
          <Alert
            type="info"
            showIcon
            message={selectedSesi ? `${selectedSesi.nama_ujian} - ${selectedSesi.tanggal}` : ""}
            description="Upload bukti pembayaran sebelum mengirim pendaftaran."
          />
          <Upload
            accept=".pdf,.jpg,.jpeg,.png"
            maxCount={1}
            beforeUpload={(file) => {
              const validType = ["application/pdf", "image/jpeg", "image/png"].includes(file.type);
              if (!validType) {
                message.error("Format file harus PDF, JPG, atau PNG");
                return Upload.LIST_IGNORE;
              }
              if (file.size > 5 * 1024 * 1024) {
                message.error("Ukuran file maksimal 5MB");
                return Upload.LIST_IGNORE;
              }
              setBuktiPembayaran(file);
              return false;
            }}
            onRemove={() => setBuktiPembayaran(null)}
          >
            <Button icon={<HiOutlineUpload />}>Pilih Bukti Pembayaran</Button>
          </Upload>
          <p className="text-xs text-slate-500">Format PDF, JPG, atau PNG. Maksimal 5MB.</p>
        </div>
      </Modal>
    </div>
  );
}
