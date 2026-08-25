"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Spin,
  message,
} from "antd";
import {
  HiOutlineOfficeBuilding,
  HiOutlineUser,
  HiOutlineIdentification,
  HiOutlineLocationMarker,
  HiOutlineCheck,
  HiOutlineDocumentReport,
  HiOutlineRefresh,
  HiOutlineInformationCircle,
} from "react-icons/hi";

export default function PengaturanAdminPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Watch form values for live preview
  const formValues = Form.useWatch([], form) || {};

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pengaturan");
      const result = await res.json();
      if (!res.ok) {
        message.error(result.error || "Gagal memuat data pengaturan");
        return;
      }
      if (result.data) {
        form.setFieldsValue({
          nama_pimpinan: result.data.nama_pimpinan || "",
          jabatan_pimpinan: result.data.jabatan_pimpinan || "Kepala LP3M",
          nip_pimpinan: result.data.nip_pimpinan || "-",
          kota_laporan: result.data.kota_laporan || "Teluk Kuantan",
        });
      }
    } catch {
      message.error("Terjadi kesalahan saat memuat pengaturan");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function handleFinish(values) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pengaturan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await res.json();
      if (!res.ok) {
        message.error(result.error || "Gagal menyimpan pengaturan");
        return;
      }
      message.success(result.message || "Pengaturan berhasil disimpan!");
      if (result.data) {
        form.setFieldsValue(result.data);
      }
    } catch {
      message.error("Terjadi kesalahan saat menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  }

  const tanggalPreview = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pengaturan Sistem</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola data pimpinan penandatangan laporan rekap ujian LP3M UNIKS
          </p>
        </div>
        <Link href="/admin/laporan">
          <Button icon={<HiOutlineDocumentReport />} type="default">
            Lihat Laporan
          </Button>
        </Link>
      </div>

      <Row gutter={[24, 24]}>
        {/* Form Column */}
        <Col xs={24} lg={14}>
          <Card
            bordered={false}
            className="shadow-sm"
            title={
              <div className="flex items-center gap-2 text-slate-800">
                <HiOutlineOfficeBuilding className="h-5 w-5 text-violet-600" />
                <span className="font-semibold">Data Pimpinan Penandatangan Laporan</span>
              </div>
            }
          >
            <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50/70 p-3 text-xs sm:text-sm text-blue-900">
              <div className="flex gap-2">
                <HiOutlineInformationCircle className="h-5 w-5 shrink-0 text-blue-600" />
                <span>
                  Informasi nama, jabatan, dan NIP ini akan otomatis tercantum pada bagian
                  tanda tangan semua laporan resmi (PDF Rekap Peserta, Rekap Kelulusan, dan Rekap Sesi Ujian).
                </span>
              </div>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              requiredMark="optional"
            >
              <Form.Item
                name="nama_pimpinan"
                label={<span className="font-medium text-slate-700">Nama Lengkap &amp; Gelar Pimpinan</span>}
                rules={[{ required: true, message: "Nama pimpinan wajib diisi" }]}
                extra="Contoh: Dr. H. Nopriadi, S.Kom., M.Kom."
              >
                <Input
                  size="large"
                  prefix={<HiOutlineUser className="text-slate-400" />}
                  placeholder="Masukkan nama lengkap beserta gelar"
                />
              </Form.Item>

              <Form.Item
                name="jabatan_pimpinan"
                label={<span className="font-medium text-slate-700">Jabatan Pimpinan</span>}
                rules={[{ required: true, message: "Jabatan pimpinan wajib diisi" }]}
                extra="Contoh: Kepala LP3M atau Kepala LP3M UNIKS"
              >
                <Input
                  size="large"
                  prefix={<HiOutlineOfficeBuilding className="text-slate-400" />}
                  placeholder="Contoh: Kepala LP3M"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="nip_pimpinan"
                    label={<span className="font-medium text-slate-700">NIP / NIDN (Opsional)</span>}
                    extra="Isi '-' jika tidak ada NIP"
                  >
                    <Input
                      size="large"
                      prefix={<HiOutlineIdentification className="text-slate-400" />}
                      placeholder="Contoh: 19850101 201001 1 002"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="kota_laporan"
                    label={<span className="font-medium text-slate-700">Kota / Tempat Laporan</span>}
                    rules={[{ required: true, message: "Kota wajib diisi" }]}
                    extra="Tempat terbit surat/laporan"
                  >
                    <Input
                      size="large"
                      prefix={<HiOutlineLocationMarker className="text-slate-400" />}
                      placeholder="Contoh: Teluk Kuantan"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider className="my-4" />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                  icon={<HiOutlineRefresh />}
                  onClick={loadSettings}
                  disabled={saving}
                >
                  Muat Ulang
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<HiOutlineCheck />}
                  loading={saving}
                  size="large"
                  className="min-w-[140px]"
                >
                  Simpan Perubahan
                </Button>
              </div>
            </Form>
          </Card>
        </Col>

        {/* Live Preview Column */}
        <Col xs={24} lg={10}>
          <Card
            bordered={false}
            className="shadow-sm bg-slate-50"
            title={
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">
                  Pratinjau Tanda Tangan Dokumen
                </span>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                  Live Preview PDF
                </span>
              </div>
            }
          >
            <p className="text-xs text-slate-500 mb-4">
              Berikut adalah tampilan format tanda tangan yang akan dicetak pada bagian bawah dokumen laporan resmi:
            </p>

            {/* Document Signature Box Simulation */}
            <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-xs">
              <div className="text-right">
                <div className="inline-block text-center" style={{ minWidth: "220px" }}>
                  <p className="m-0 text-xs text-slate-600">
                    {formValues.kota_laporan || "Teluk Kuantan"}, {tanggalPreview}
                  </p>
                  <p className="mt-1 mb-14 text-xs font-semibold text-slate-800">
                    {formValues.jabatan_pimpinan || "Kepala LP3M"}
                  </p>

                  <p className="m-0 text-sm font-bold text-slate-900 underline decoration-slate-900 underline-offset-2">
                    {formValues.nama_pimpinan || "(Nama Pimpinan Belum Diisi)"}
                  </p>
                  <p className="mt-1 m-0 text-xs text-slate-600">
                    {formValues.nip_pimpinan && formValues.nip_pimpinan !== "-"
                      ? `NIP. ${formValues.nip_pimpinan}`
                      : "NIP. ........................"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3.5 text-xs text-slate-600">
              <p className="font-medium text-slate-700 mb-1">Terintegrasi ke:</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                <li>Laporan Rekap Pendaftaran Peserta (ICT &amp; TOEFL)</li>
                <li>Laporan Rekap Kelulusan Ujian (ICT &amp; TOEFL)</li>
                <li>Laporan Rekap Sesi Ujian (ICT &amp; TOEFL)</li>
              </ul>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}