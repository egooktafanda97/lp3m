"use client";

import { useEffect, useState } from "react";
import PengumumanTabs from "@/components/pengumuman/PengumumanTabs";

export default function PengumumanPublicPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/pengumuman")
      .then((r) => r.json())
      .then((res) => setData(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-6">
      <h1 className="text-3xl font-bold text-slate-800">Pengumuman</h1>
      <p className="mt-2 text-slate-500">
        Informasi resmi dari LP3M   pengumuman terbaru, jadwal ujian, dan hasil ujian.
      </p>

      <div className="mt-8">
        <PengumumanTabs data={data} loading={loading} />
      </div>
    </div>
  );
}
