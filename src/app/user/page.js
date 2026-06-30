"use client";

import { useEffect, useState } from "react";
import { Card, Col, List, Row, Spin, Tag } from "antd";

export default function PesertaDashboardPage() {
  const [pendaftaran, setPendaftaran] = useState([]);
  const [pengumuman, setPengumuman] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/peserta/pendaftaran").then((r) => r.json()),
      fetch("/api/pengumuman").then((r) => r.json()),
    ]).then(([pendaftaranRes, pengumumanRes]) => {
      setPendaftaran(pendaftaranRes.data || []);
      setPengumuman((pengumumanRes.data || []).slice(0, 3));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Halaman User</h1>
        <p className="mt-1 text-sm text-slate-500">
          Portal peserta   pendaftaran dan informasi ujian ICT & TOEFL
        </p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Pendaftaran Terbaru" bordered={false} className="shadow-sm">
            {pendaftaran.length === 0 ? (
              <p className="text-slate-500">Belum ada pendaftaran. Daftar ujian di menu Daftar Ujian.</p>
            ) : (
              <List
                dataSource={pendaftaran.slice(0, 5)}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`${item.nama_ujian}   ${item.tanggal}`}
                      description={
                        <Tag color={item.status === "terverifikasi" ? "green" : item.status === "ditolak" ? "red" : "orange"}>
                          {item.status.replace(/_/g, " ")}
                        </Tag>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Pengumuman Terbaru" bordered={false} className="shadow-sm">
            {pengumuman.length === 0 ? (
              <p className="text-slate-500">Belum ada pengumuman.</p>
            ) : (
              <List
                dataSource={pengumuman}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta title={item.judul} description={item.tanggal_publish} />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
