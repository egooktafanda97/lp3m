"use client";

import { useEffect, useState, useMemo } from "react";
import { Image, Spin, Empty } from "antd";
import { KATEGORI_GALERI } from "@/lib/constants";

export default function GaleriPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Semua");

  useEffect(() => {
    fetch("/api/public/galeri")
      .then((r) => r.json())
      .then((res) => setData(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const fromData = [...new Set(data.map((d) => d.kategori).filter(Boolean))];
    const ordered = KATEGORI_GALERI.filter((k) => fromData.includes(k));
    const extra = fromData.filter((k) => !KATEGORI_GALERI.includes(k));
    return ["Semua", ...ordered, ...extra];
  }, [data]);

  const filtered =
    filter === "Semua" ? data : data.filter((d) => d.kategori === filter);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800">Galeri Dokumentasi</h1>
        <p className="mx-auto mt-2 max-w-xl text-slate-500">
          Foto-foto kegiatan ujian ICT & TOEFL LP3M UNIKS. Klik foto untuk memperbesar.
        </p>
      </div>

      {!loading && categories.length > 1 && (
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === cat
                  ? "bg-violet-600 text-white"
                  : "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-24">
          <Spin size="large" />
        </div>
      ) : filtered.length === 0 ? (
        <Empty className="mt-16" description="Belum ada foto dokumentasi" />
      ) : (
        <Image.PreviewGroup>
          <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="group mb-4 break-inside-avoid overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-slate-100"
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={item.gambar_url}
                    alt={item.judul}
                    className="w-full object-cover transition duration-500 group-hover:scale-105"
                    style={{ display: "block", width: "100%" }}
                    preview={{
                      mask: (
                        <span className="text-sm font-medium text-white">
                          🔍 Perbesar
                        </span>
                      ),
                    }}
                  />
                  {item.kategori && (
                    <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                      {item.kategori}
                    </span>
                  )}
                </div>
                <div className="px-3 py-2.5">
                  <p className="text-sm font-semibold text-slate-800">{item.judul}</p>
                  {item.deskripsi && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                      {item.deskripsi}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Image.PreviewGroup>
      )}
    </div>
  );
}
