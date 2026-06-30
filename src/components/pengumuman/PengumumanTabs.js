"use client";

import { Card, List, Spin, Tabs, Tag, Empty } from "antd";
import { KATEGORI_PENGUMUMAN_LABEL, KATEGORI_PENGUMUMAN_TABS } from "@/lib/constants";

function PengumumanList({ items, showAdmin = true }) {
  if (items.length === 0) {
    return <Empty description="Belum ada pengumuman di kategori ini" className="py-8" />;
  }

  return (
    <List
      dataSource={items}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            title={
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold">{item.judul}</span>
                <Tag color="violet">{KATEGORI_PENGUMUMAN_LABEL[item.kategori] || item.kategori}</Tag>
              </div>
            }
            description={
              <div>
                <p className="mt-2 whitespace-pre-wrap text-slate-600">{item.isi}</p>
                <p className="mt-3 text-xs text-slate-400">
                  {showAdmin && item.nama_admin ? `${item.nama_admin}   ` : ""}
                  {item.tanggal_publish}
                </p>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
}

export default function PengumumanTabs({ data, loading }) {
  const tabItems = KATEGORI_PENGUMUMAN_TABS.map(({ key, label }) => ({
    key,
    label,
    children: (
      <PengumumanList
        items={data.filter((item) => item.kategori === key)}
        showAdmin
      />
    ),
  }));

  return (
    <Card className="shadow-sm" bordered={false}>
      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <Tabs items={tabItems} defaultActiveKey="terbaru" />
      )}
    </Card>
  );
}
