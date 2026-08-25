"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Button,
  Card,
  Input,
  Select,
  Table,
  Tag,
  message,
  Tabs,
  Modal,
  Upload,
  Alert,
  Divider,
  Space,
  Segmented,
} from "antd";
import {
  HiOutlineDownload,
  HiOutlineUpload,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from "react-icons/hi";
import * as XLSX from "xlsx";

const { Dragger } = Upload;

const kelulusanOptions = [
  { value: "lulus", label: "Lulus" },
  { value: "tidak_lulus", label: "Tidak Lulus" },
];

export default function HasilUjianAdminPage() {
  const [selectedUjian, setSelectedUjian] = useState("ICT");
  const [published, setPublished] = useState([]);
  const [inputRows, setInputRows] = useState([]);
  const [sesiList, setSesiList] = useState([]);
  const [sesiFilter, setSesiFilter] = useState(null);
  const [edits, setEdits] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Import Modal State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFileName, setImportFileName] = useState("");
  const [importData, setImportData] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [importPublishing, setImportPublishing] = useState(false);

  const loadPublished = useCallback(async (ujian) => {
    const res = await fetch(`/api/admin/hasil?ujian=${ujian}`);
    const data = await res.json();
    setPublished(data.data || []);
  }, []);

  const loadInputRows = useCallback(async (ujian, sesiId = null) => {
    const url = sesiId
      ? `/api/admin/hasil?view=input&ujian=${ujian}&sesi_ujian_id=${sesiId}`
      : `/api/admin/hasil?view=input&ujian=${ujian}`;
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

  // Load Sesi List
  const loadSesiList = useCallback(async () => {
    const sesiRes = await fetch("/api/admin/sesi-uian");
    const sesiData = await sesiRes.json();
    setSesiList(sesiData.data || []);
  }, []);

  // Initial and on selectedUjian change
  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      await loadSesiList();
      if (!active) return;
      await Promise.all([
        loadPublished(selectedUjian),
        loadInputRows(selectedUjian, null),
      ]);
      if (active) setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [selectedUjian, loadPublished, loadInputRows, loadSesiList]);

  // Handle Exam Switch (ICT vs TOEFL)
  function handleUjianChange(val) {
    setSelectedUjian(val);
    setSesiFilter(null);
  }

  // Handle Session Filter Change
  async function handleSesiChange(value) {
    setSesiFilter(value);
    setLoading(true);
    await loadInputRows(selectedUjian, value);
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
      message.success(result.message || `Hasil ujian ${selectedUjian} dipublikasikan`);
      await Promise.all([
        loadPublished(selectedUjian),
        loadInputRows(selectedUjian, sesiFilter),
      ]);
    } catch {
      message.error("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  // --- DOWNLOAD TEMPLATE EXCEL (Khusus Jenis Ujian yang Aktif) ---
  function handleDownloadTemplate() {
    let rowsToExport = inputRows;

    let filename = `Template_Nilai_${selectedUjian}_Semua_Sesi.xlsx`;
    if (sesiFilter) {
      const selectedSesi = sesiList.find((s) => s.id === sesiFilter);
      if (selectedSesi) {
        const kode = selectedSesi.kode_sesi || selectedUjian;
        filename = `Template_Nilai_${selectedUjian}_${kode}_${selectedSesi.tanggal.slice(0, 10)}.xlsx`;
      }
    }

    let dataForExcel = [];

    if (rowsToExport.length > 0) {
      dataForExcel = rowsToExport.map((r, i) => ({
        "No": i + 1,
        "Kode Sesi": r.kode_sesi || "-",
        "NIM / No Identitas": r.nomor_identitas || "-",
        "Nama Peserta": r.nama_peserta,
        "Program Studi": r.prodi || "-",
        "Jenis Ujian": r.nama_ujian,
        "Tanggal Sesi": r.tanggal,
        "Nilai / Skor": edits[r.pendaftaran_id]?.nilai || "",
        "Status Kelulusan":
          edits[r.pendaftaran_id]?.status_kelulusan === "lulus"
            ? "Lulus"
            : edits[r.pendaftaran_id]?.status_kelulusan === "tidak_lulus"
              ? "Tidak Lulus"
              : "",
      }));
    } else {
      dataForExcel = [
        {
          "No": 1,
          "Kode Sesi": selectedUjian === "ICT" ? "ICT01" : "TFL01",
          "NIM / No Identitas": "2021001",
          "Nama Peserta": "Contoh Nama Peserta",
          "Program Studi": "Teknik Informatika",
          "Jenis Ujian": selectedUjian,
          "Tanggal Sesi": "2026-06-15 08:00",
          "Nilai / Skor": selectedUjian === "ICT" ? "85" : "480",
          "Status Kelulusan": "Lulus",
        },
      ];
    }

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);

    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 20 },
      { wch: 30 },
      { wch: 25 },
      { wch: 14 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Nilai ${selectedUjian}`);
    XLSX.writeFile(workbook, filename);
    message.success(`Template ${filename} berhasil diunduh!`);
  }

  // --- PARSE & STRICT VALIDATION EXCEL ---
  function handleProcessExcel(file) {
    setImportFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target.result;
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          message.error("File Excel tidak memiliki lembar kerja");
          return;
        }

        const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
          defval: "",
        });

        if (rawRows.length === 0) {
          message.warning("File Excel kosong");
          setImportData([]);
          setImportErrors([
            {
              baris: "-",
              kode_sesi: "-",
              nim: "-",
              nama: "-",
              error: "File Excel kosong",
            },
          ]);
          return;
        }

        const parsedValid = [];
        const parsedErrors = [];
        const seenPendaftaranIds = new Set();

        rawRows.forEach((row, index) => {
          const barisExcel = index + 2;

          const rawKodeSesi =
            row["Kode Sesi"] ||
            row["kode_sesi"] ||
            row["Kode"] ||
            row["kode"] ||
            row["SESI"] ||
            row["Sesi"];
          const rawNim =
            row["NIM / No Identitas"] ||
            row["NIM"] ||
            row["nim"] ||
            row["No Identitas"] ||
            row["nomor_identitas"] ||
            row["NIM/ID"];
          const rawNama =
            row["Nama Peserta"] ||
            row["Nama"] ||
            row["nama_peserta"] ||
            row["nama"] ||
            row["Nama Lengkap"];
          const rawUjian =
            row["Jenis Ujian"] ||
            row["Ujian"] ||
            row["ujian"] ||
            row["nama_ujian"];
          const rawNilai =
            row["Nilai / Skor"] ||
            row["Nilai"] ||
            row["nilai"] ||
            row["Skor"] ||
            row["skor"] ||
            row["Score"];
          const rawStatus =
            row["Status Kelulusan"] ||
            row["Status"] ||
            row["status"] ||
            row["Kelulusan"] ||
            row["kelulusan"] ||
            row["status_kelulusan"];
          const rawId = row["ID Pendaftaran"] || row["id_pendaftaran"];

          const strKodeSesi = String(rawKodeSesi || "").trim().toUpperCase();
          const strNim = String(rawNim || "").trim();
          const strNama = String(rawNama || "").trim();
          const strUjian = String(rawUjian || "").trim().toUpperCase();
          const strNilai = String(rawNilai ?? "").trim();
          const strStatus = String(rawStatus || "").trim().toLowerCase();

          // Validasi jika jenis ujian di file tidak sesuai dengan tab aktif
          if (strUjian && strUjian !== selectedUjian) {
            parsedErrors.push({
              baris: barisExcel,
              kode_sesi: strKodeSesi || "-",
              nim: strNim || "-",
              nama: strNama || "-",
              error: `Jenis ujian (${strUjian}) bukan ujian ${selectedUjian}`,
            });
            return;
          }

          let matched = null;

          if (rawId && !isNaN(Number(rawId))) {
            matched = inputRows.find((p) => p.pendaftaran_id === Number(rawId));
          }

          if (!matched && strKodeSesi && strNim) {
            matched = inputRows.find(
              (p) =>
                String(p.kode_sesi || "").toUpperCase() === strKodeSesi &&
                String(p.nomor_identitas || "").trim() === strNim
            );
          }

          if (!matched && strKodeSesi && strNama) {
            matched = inputRows.find(
              (p) =>
                String(p.kode_sesi || "").toUpperCase() === strKodeSesi &&
                p.nama_peserta.trim().toLowerCase() === strNama.toLowerCase()
            );
          }

          if (!matched && strNim) {
            matched = inputRows.find(
              (p) => String(p.nomor_identitas || "").trim() === strNim
            );
          }

          if (!matched && strNama) {
            matched = inputRows.find(
              (p) => p.nama_peserta.trim().toLowerCase() === strNama.toLowerCase()
            );
          }

          if (!matched) {
            let errorMsg = `Peserta tidak terdaftar pada ${selectedUjian}`;
            if (strKodeSesi) {
              errorMsg = `Peserta tidak ada di sesi ${strKodeSesi}`;
            }

            parsedErrors.push({
              baris: barisExcel,
              kode_sesi: strKodeSesi || "-",
              nim: strNim || "-",
              nama: strNama || "-",
              error: errorMsg,
            });
            return;
          }

          if (seenPendaftaranIds.has(matched.pendaftaran_id)) {
            parsedErrors.push({
              baris: barisExcel,
              kode_sesi: strKodeSesi || matched.kode_sesi || "-",
              nim: strNim || matched.nomor_identitas || "-",
              nama: matched.nama_peserta,
              error: "Data peserta ini duplikat dalam file Excel",
            });
            return;
          }
          seenPendaftaranIds.add(matched.pendaftaran_id);

          if (!strNilai) {
            parsedErrors.push({
              baris: barisExcel,
              kode_sesi: strKodeSesi || matched.kode_sesi || "-",
              nim: strNim || matched.nomor_identitas || "-",
              nama: matched.nama_peserta,
              error: "Nilai belum diisi",
            });
            return;
          }

          let normalizedStatus = null;
          if (["lulus", "pass", "1", "l"].includes(strStatus)) {
            normalizedStatus = "lulus";
          } else if (
            [
              "tidak lulus",
              "tidak_lulus",
              "gagal",
              "fail",
              "0",
              "tl",
              "tidak",
            ].includes(strStatus)
          ) {
            normalizedStatus = "tidak_lulus";
          }

          if (!normalizedStatus) {
            parsedErrors.push({
              baris: barisExcel,
              kode_sesi: strKodeSesi || matched.kode_sesi || "-",
              nim: strNim || matched.nomor_identitas || "-",
              nama: matched.nama_peserta,
              error: `Status "${rawStatus || "-"}" tidak valid (harus Lulus / Tidak Lulus)`,
            });
            return;
          }

          parsedValid.push({
            pendaftaran_id: matched.pendaftaran_id,
            kode_sesi: matched.kode_sesi || strKodeSesi || "-",
            nomor_identitas: matched.nomor_identitas || strNim || "-",
            nama_peserta: matched.nama_peserta,
            prodi: matched.prodi || "-",
            nama_ujian: matched.nama_ujian,
            tanggal: matched.tanggal,
            nilai: strNilai,
            status_kelulusan: normalizedStatus,
          });
        });

        setImportData(parsedValid);
        setImportErrors(parsedErrors);

        if (parsedErrors.length > 0) {
          message.error(`Ada ${parsedErrors.length} baris yang perlu diperbaiki!`);
        } else {
          message.success(`${parsedValid.length} data peserta valid!`);
        }
      } catch (err) {
        message.error("Gagal membaca file Excel: " + err.message);
      }
    };

    reader.readAsArrayBuffer(file);
    return false;
  }

  function handleApplyImportToForm() {
    if (importErrors.length > 0 || importData.length === 0) return;

    const nextEdits = { ...edits };
    importData.forEach((item) => {
      nextEdits[item.pendaftaran_id] = {
        nilai: item.nilai,
        status_kelulusan: item.status_kelulusan,
      };
    });

    setEdits(nextEdits);
    message.success(`${importData.length} nilai dimasukkan ke formulir!`);
    setImportModalOpen(false);
    resetImportState();
  }

  async function handleDirectPublishImport() {
    if (importErrors.length > 0 || importData.length === 0) return;

    const items = importData.map((item) => ({
      pendaftaran_id: item.pendaftaran_id,
      nilai: item.nilai,
      status_kelulusan: item.status_kelulusan,
    }));

    setImportPublishing(true);
    try {
      const res = await fetch("/api/admin/hasil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const result = await res.json();
      if (!res.ok) {
        message.error(result.error || "Gagal menyimpan hasil ujian");
        return;
      }
      message.success(result.message || `${items.length} hasil ujian ${selectedUjian} berhasil dipublikasikan!`);
      setImportModalOpen(false);
      resetImportState();
      await Promise.all([
        loadPublished(selectedUjian),
        loadInputRows(selectedUjian, sesiFilter),
      ]);
    } catch {
      message.error("Terjadi kesalahan");
    } finally {
      setImportPublishing(false);
    }
  }

  function resetImportState() {
    setImportFileName("");
    setImportData([]);
    setImportErrors([]);
  }

  // Filtered session list based on active exam (ICT / TOEFL)
  const filteredSesiList = sesiList.filter((s) => s.nama_ujian === selectedUjian);

  const inputColumns = [
    { title: "No", key: "no", width: 50, render: (_, __, i) => i + 1 },
    {
      title: "Kode Sesi",
      dataIndex: "kode_sesi",
      key: "kode_sesi",
      width: 100,
      render: (v) => (
        <Tag color="blue" className="font-mono font-semibold">
          {v || "-"}
        </Tag>
      ),
    },
    { title: "NIM / ID", dataIndex: "nomor_identitas", key: "nomor_identitas", width: 120 },
    { title: "Nama Peserta", dataIndex: "nama_peserta", key: "nama_peserta" },
    { title: "Prodi", dataIndex: "prodi", key: "prodi" },
    { title: "Tanggal Sesi", dataIndex: "tanggal", key: "tanggal", width: 160 },
    {
      title: "Nilai / Skor",
      key: "nilai",
      width: 135,
      render: (_, record) => (
        <Input
          placeholder={selectedUjian === "TOEFL" ? "Contoh: 480" : "Contoh: 85"}
          value={edits[record.pendaftaran_id]?.nilai ?? ""}
          onChange={(e) =>
            updateEdit(record.pendaftaran_id, "nilai", e.target.value)
          }
        />
      ),
    },
    {
      title: "Kelulusan",
      key: "status_kelulusan",
      width: 140,
      render: (_, record) => (
        <Select
          className="w-full"
          placeholder="Pilih"
          allowClear
          options={kelulusanOptions}
          value={edits[record.pendaftaran_id]?.status_kelulusan}
          onChange={(v) =>
            updateEdit(record.pendaftaran_id, "status_kelulusan", v)
          }
        />
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 105,
      render: (_, record) =>
        record.tanggal_publish ? (
          <Tag color="green">Terpublish</Tag>
        ) : (
          <Tag color="default">Belum</Tag>
        ),
    },
  ];

  const publishedColumns = [
    {
      title: "Kode Sesi",
      dataIndex: "kode_sesi",
      key: "kode_sesi",
      width: 100,
      render: (v) => (
        <Tag color="blue" className="font-mono font-semibold">
          {v || "-"}
        </Tag>
      ),
    },
    { title: "Peserta", dataIndex: "nama_peserta", key: "nama_peserta" },
    { title: "Tanggal Sesi", dataIndex: "tanggal", key: "tanggal" },
    { title: "Nilai / Skor", dataIndex: "nilai", key: "nilai" },
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
      label: `Input Nilai Massal (${selectedUjian})`,
      children: (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Select
              className="min-w-[300px]"
              placeholder={`Filter sesi ${selectedUjian} (semua)`}
              allowClear
              value={sesiFilter}
              onChange={handleSesiChange}
              options={filteredSesiList.map((s) => ({
                value: s.id,
                label: `${s.kode_sesi ? `[${s.kode_sesi}] ` : ""}${s.tanggal} (${s.lokasi || "Reguler"})`,
              }))}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                icon={<HiOutlineDownload />}
                onClick={handleDownloadTemplate}
              >
                Download Template {selectedUjian}
              </Button>
              <Button
                icon={<HiOutlineUpload />}
                type="default"
                className="border-violet-600 text-violet-600 hover:border-violet-700 hover:text-violet-700"
                onClick={() => {
                  resetImportState();
                  setImportModalOpen(true);
                }}
              >
                Import Excel {selectedUjian}
              </Button>
              <Divider type="vertical" />
              <Button onClick={() => setAllKelulusan("lulus")}>Semua Lulus</Button>
              <Button onClick={() => setAllKelulusan("tidak_lulus")}>
                Semua Tidak Lulus
              </Button>
              <Button
                type="primary"
                loading={saving}
                onClick={handlePublishMassal}
              >
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
            locale={{ emptyText: `Tidak ada peserta ${selectedUjian} terverifikasi` }}
          />
        </div>
      ),
    },
    {
      key: "published",
      label: `Hasil Terpublish (${selectedUjian})`,
      children: (
        <Table
          columns={publishedColumns}
          dataSource={published}
          rowKey="id"
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: `Belum ada hasil ujian ${selectedUjian} yang dipublikasikan` }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Hasil Kelulusan Ujian</h1>
        <p className="text-sm text-slate-500">
          Kelola nilai kelulusan peserta ujian ICT dan TOEFL secara terpisah
        </p>
      </div>

      <Card bordered={false} className="shadow-sm">
        {/* SEGMENTED EXAM SWITCHER */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Kategori Ujian
            </p>
            <p className="text-base font-bold text-slate-800">
              {selectedUjian === "ICT" ? "Ujian Komputer (ICT)" : "Ujian Bahasa Inggris (TOEFL)"}
            </p>
          </div>
          <Segmented
            size="large"
            value={selectedUjian}
            onChange={handleUjianChange}
            options={[
              { label: "Ujian ICT", value: "ICT" },
              { label: "Ujian TOEFL", value: "TOEFL" },
            ]}
            className="bg-slate-200 p-1 font-semibold"
          />
        </div>

        <Tabs items={tabItems} defaultActiveKey="input" />
      </Card>

      {/* --- SIMPLIFIED IMPORT MODAL --- */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <HiOutlineUpload className="h-5 w-5 text-violet-600" />
            <span>Import Nilai {selectedUjian}</span>
          </div>
        }
        open={importModalOpen}
        onCancel={() => {
          setImportModalOpen(false);
          resetImportState();
        }}
        width={680}
        destroyOnClose
        footer={
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              onClick={() => {
                setImportModalOpen(false);
                resetImportState();
              }}
            >
              Batal
            </Button>
            <Button
              disabled={importErrors.length > 0 || importData.length === 0}
              onClick={handleApplyImportToForm}
            >
              Terapkan ke Form
            </Button>
            <Button
              type="primary"
              disabled={importErrors.length > 0 || importData.length === 0}
              loading={importPublishing}
              onClick={handleDirectPublishImport}
            >
              Simpan & Publish
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          {/* UPLOAD BOX */}
          <Dragger
            accept=".xlsx, .xls, .csv"
            showUploadList={false}
            beforeUpload={handleProcessExcel}
            className="border-dashed border-2 border-slate-300 bg-slate-50 hover:bg-violet-50/50 hover:border-violet-400 transition-all rounded-xl p-4"
          >
            <div className="flex flex-col items-center justify-center py-2 text-center">
              <HiOutlineUpload className="mb-2 h-8 w-8 text-violet-500" />
              <p className="text-sm font-semibold text-slate-700">
                {importFileName ? (
                  <span className="text-violet-700">{importFileName}</span>
                ) : (
                  `Pilih atau seret file Excel nilai ${selectedUjian}`
                )}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Format: .xlsx / .xls sesuai template yang telah diisi nilai & kelulusan
              </p>
            </div>
          </Dragger>

          {/* HASIL VALIDASI */}
          {importErrors.length > 0 && (
            <div className="space-y-2">
              <Alert
                type="error"
                showIcon
                icon={<HiOutlineXCircle className="h-5 w-5 text-rose-500" />}
                message={
                  <span className="font-semibold text-rose-800">
                    {`Terdapat ${importErrors.length} baris gagal validasi. Perbaiki file Excel Anda:`}
                  </span>
                }
              />
              <Table
                dataSource={importErrors}
                rowKey={(_, i) => `err-${i}`}
                size="small"
                pagination={{ pageSize: 5 }}
                scroll={{ y: 200 }}
                columns={[
                  { title: "Baris", dataIndex: "baris", width: 65 },
                  { title: "NIM / Nama", render: (_, r) => `${r.nim} - ${r.nama}` },
                  {
                    title: "Keterangan",
                    dataIndex: "error",
                    render: (text) => <span className="text-rose-600 font-medium">{text}</span>,
                  },
                ]}
              />
            </div>
          )}

          {importData.length > 0 && importErrors.length === 0 && (
            <div className="space-y-2">
              <Alert
                type="success"
                showIcon
                icon={<HiOutlineCheckCircle className="h-5 w-5 text-emerald-600" />}
                message={
                  <span className="font-semibold text-emerald-800">
                    {`Semua ${importData.length} data peserta ${selectedUjian} valid dan siap di-import.`}
                  </span>
                }
              />
              <Table
                dataSource={importData}
                rowKey="pendaftaran_id"
                size="small"
                pagination={{ pageSize: 5 }}
                scroll={{ y: 200 }}
                columns={[
                  { title: "Kode Sesi", dataIndex: "kode_sesi", width: 95, render: (v) => <Tag color="blue">{v}</Tag> },
                  { title: "NIM", dataIndex: "nomor_identitas", width: 110 },
                  { title: "Nama Peserta", dataIndex: "nama_peserta" },
                  { title: "Nilai", dataIndex: "nilai", width: 70 },
                  {
                    title: "Status",
                    dataIndex: "status_kelulusan",
                    width: 100,
                    render: (s) => (
                      <Tag color={s === "lulus" ? "green" : "red"}>
                        {s === "lulus" ? "Lulus" : "Tidak Lulus"}
                      </Tag>
                    ),
                  },
                ]}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
