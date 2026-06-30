"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Form, Input, Button, Card, message } from "antd";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onFinish(values) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        message.error(data.error || "Registrasi gagal");
        return;
      }
      message.success("Registrasi berhasil. Silakan login.");
      router.push("/login");
    } catch {
      message.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-lg shadow-lg" title="Registrasi Peserta Ujian">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Nama Lengkap" name="nama" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item label="Nomor Identitas (NIM/KTM)" name="nomor_identitas">
            <Input />
          </Form.Item>
          <Form.Item label="Program Studi" name="prodi">
            <Input />
          </Form.Item>
          <Form.Item label="No. HP" name="no_hp">
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Daftar
          </Button>
        </Form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-violet-600 hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
