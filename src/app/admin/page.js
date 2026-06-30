"use client";

import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Spin } from "antd";
import {
  HiOutlineUsers,
  HiOutlineClipboardCheck,
  HiOutlineCalendar,
  HiOutlineAcademicCap,
} from "react-icons/hi";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((data) => setStats(data.stats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  const items = [
    { title: "Total Peserta", value: stats?.total_peserta || 0, icon: HiOutlineUsers, color: "text-violet-600", bg: "bg-violet-50" },
    { title: "Menunggu Verifikasi", value: stats?.pendaftaran_menunggu || 0, icon: HiOutlineClipboardCheck, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Sesi Aktif", value: stats?.sesi_aktif || 0, icon: HiOutlineCalendar, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Hasil Dipublish", value: stats?.hasil_dipublish || 0, icon: HiOutlineAcademicCap, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Admin LP3M</h1>
        <p className="mt-1 text-sm text-slate-500">
          Sistem Informasi Ujian ICT dan TOEFL   Universitas Islam Kuantan Singingi
        </p>
      </div>

      <Row gutter={[16, 16]}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Col xs={24} sm={12} xl={6} key={item.title}>
              <Card className="shadow-sm" bordered={false}>
                <div className="flex items-start justify-between">
                  <Statistic title={item.title} value={item.value} />
                  <div className={`rounded-lg p-2.5 ${item.bg}`}>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
