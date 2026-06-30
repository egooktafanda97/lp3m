"use client";

import { useEffect, useState, useCallback } from "react";
import { Button, Card, Input, Select, Table, Tag, message, Tabs } from "antd";

const kelulusanOptions = [
  { value: "lulus", label: "Lulus" },
  { value: "tidak_lulus", label: "Tidak Lulus" },
];

export default function HasilUjianAdminPage() {
  const [published, setPublished] = useState([]);
  const [inputRows, setInputRows] = useState([]);
  const [sesiList, setSesiList] = useState([]);
  const [sesiFilter, setSesiFilter] = useState(null);
  const [edits, setEdits] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPublished = useCallback(async () => {
    const res = await fetch("/api/admin/hasil");
    const data = await res.json();
    setPublished(data.data || []);
  }, []);

  const loadInputRows = useCallback(async (sesiId = null) => {
    const url = sesiId
      ? `/api/admin/hasil?view=input&sesi_ujian_id=${sesiId}`
      : "/api/admin/hasil?view=input";
    const res = await fetch(url);
    const data = await res.json();
    const rows = data.data || [];
    setInputRows(rows);

    const initialEdits = {};
    rows.forEach((row) => {
      initialEdits[row.pendaftaran_id] = {
        nilai: row.nilai || "",
        status_kelulusan: row.status_kelulusan || undefined,
      };
    });
    setEdits(initialEdits);
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      const sesiRes = await fetch("/api/admin/sesi-uian");
      const sesiData = await sesiRes.json();
      if (!active) return;

      setSesiList(sesiData.data || []);
      await Promise.all([loadPublished(), loadInputRows(null)]);
      if (active) setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [loadPublished, loadInputRows]);

  async function handleSesiChange(value) {
    setSesiFilter(value);
    setLoading(true);
    await loadInputRows(value);
    setLoading(false);
  }

  function updateEdit(pendaftaranId, field, value) {
    setEdits((prev) => ({
      ...prev,
      [pendaftaranId]: { ...prev[pendaftaranId], [field]: value },
    }));
  }

  function setAllKelulusan(status) {
    const next = { ...edits };
    inputRows.forEach((row) => {
      next[row.pendaftaran_id] = {
        ...next[row.pendaftaran_id],
        status_kelulusan: status,
      };
    });
    setEdits(next);
  }

  async function handlePublishMassal() {
    const items = inputRows
      .map((row) => {
        const edit = edits[row.pendaftaran_id] || {};
        return {
          pendaftaran_id: row.pendaftaran_id,
          nilai: edit.nilai?.trim() || null,
          status_kelulusan: edit.status_kelulusan,
        };
      })
      .filter((item) => item.status_kelulusan);

    if (items.length === 0) {
      message.warning("Isi status kelulusan minimal pada satu peserta");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/hasil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const result = await res.json();
      if (!res.ok) {
        message.error(result.error || "Gagal menyimpan");
        return;
      }
      message.success(result.message || "Hasil dipublikasikan");
      await Promise.all([loadPublished(), loadInputRows(sesiFilter)]);
    } catch {
      message.error("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  const inputColumns = [
    { title: "No", key: "no", width: 70, render: (_, __, i) => i + 1 },
    { title: "Nama Peserta", dataIndex: "nama_peserta", key: "nama_peserta" },
    { title: "Email", dataIndex: "email", key: "email", ellipsis: true },
    { title: "Prodi", dataIndex: "prodi", key: "prodi" },
    { title: "Ujian", dataIndex: "nama_ujian", key: "nama_ujian", width: 90 },
    { title: "Tanggal", dataIndex: "tanggal", key: "tanggal", width: 160 },
    {
      title: "Nilai / Skor",
      key: "nilai",
      width: 130,
      render: (_, record) => (
        <Input
          placeholder="450 / B+"
          value={edits[record.pendaftaran_id]?.nilai ?? ""}
          onChange={(e) => updateEdit(record.pendaftaran_id, "nilai", e.target.value)}
        />
      ),
    },
    {
      title: "Kelulusan",
      key: "status_kelulusan",
      width: 150,
      render: (_, record) => (
        <Select
          className="w-full"
          placeholder="Pilih"
          allowClear
          options={kelulusanOptions}
          value={edits[record.pendaftaran_id]?.status_kelulusan}
          onChange={(v) => updateEdit(record.pendaftaran_id, "status_kelulusan", v)}
        />
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 110,
      render: (_, record) =>
        record.tanggal_publish ? (
          <Tag color="green">Terpublish</Tag>
        ) : (
          <Tag color="default">Belum</Tag>
        ),
    },
  ];

  const publishedColumns = [
    { title: "Peserta", dataIndex: "nama_peserta", key: "nama_peserta" },
    { title: "Ujian", dataIndex: "nama_ujian", key: "nama_ujian" },
    { title: "Tanggal", dataIndex: "tanggal", key: "tanggal" },
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
    { title: "Dipublish", dataIndex: "tanggal_publish", key: "tanggal_publish" },
  ];

  const tabItems = [
    {
      key: "input",
      label: "Input Hasil Massal",
      children: (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Select
              className="min-w-[280px]"
              placeholder="Filter sesi ujian (semua)"
              allowClear
              value={sesiFilter}
              onChange={handleSesiChange}
              options={sesiList.map((s) => ({
                value: s.id,
                label: `${s.nama_ujian}   ${s.tanggal}`,
              }))}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setAllKelulusan("lulus")}>Semua Lulus</Button>
              <Button onClick={() => setAllKelulusan("tidak_lulus")}>Semua Tidak Lulus</Button>
              <Button type="primary" loading={saving} onClick={handlePublishMassal}>
                Publish Massal
              </Button>
            </div>
          </div>

          <Table
            columns={inputColumns}
            dataSource={inputRows}
            rowKey="pendaftaran_id"
            loading={loading}
            scroll={{ x: 1100 }}
            pagination={{ pageSize: 20, showSizeChanger: true }}
            locale={{ emptyText: "Tidak ada peserta terverifikasi" }}
          />
        </div>
      ),
    },
    {
      key: "published",
      label: "Hasil Terpublish",
      children: (
        <Table
          columns={publishedColumns}
          dataSource={published}
          rowKey="id"
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Hasil Ujian</h1>
        <p className="text-sm text-slate-500">
          Input nilai seluruh peserta terverifikasi sekaligus, lalu publish massal
        </p>
      </div>

      <Card bordered={false} className="shadow-sm">
        <Tabs items={tabItems} defaultActiveKey="input" />
      </Card>
    </div>
  );
}
