"use client";

import { useEffect, useState } from "react";
import PengumumanTabs from "@/components/pengumuman/PengumumanTabs";

export default function PengumumanPesertaPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pengumuman")
      .then((r) => r.json())
      .then((result) => setData(result.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pengumuman</h1>
        <p className="text-sm text-slate-500">
          Informasi resmi dari LP3M   tidak perlu grup WhatsApp
        </p>
      </div>
      <PengumumanTabs data={data} loading={loading} />
    </div>
  );
}
