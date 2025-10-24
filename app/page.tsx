"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building,
  FileText,
  Search,
  Users,
  Zap,
  Shield,
  TrendingUp,
  Clock,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthButtons, HeroAuthButtons } from "@/components/auth-buttons";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="text-center py-12 sm:py-16 relative px-4">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <AuthButtons />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 bg-clip-text text-transparent">
            Koperasi Pegawai BKI
          </h1>
        </div>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4 mb-8">
          Sistem manajemen koperasi modern untuk pengajuan pembayaran dan pinjaman dengan approval workflow yang terintegrasi
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/payment-request">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
              <FileText className="w-5 h-5 mr-2" />
              Ajukan Pembayaran
            </Button>
          </Link>
          <Link href="/track-payment">
            <Button variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3">
              <Search className="w-5 h-5 mr-2" />
              Lacak Pembayaran
            </Button>
          </Link>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 pb-12 sm:pb-8 max-w-6xl">
        {/* Features Overview */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Layanan Kami</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sistem yang memudahkan pengajuan pembayaran dan pinjaman dengan proses approval yang transparan dan efisien
          </p>
        </div>

        {/* Public Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-xl mb-1">Pengajuan Pembayaran</h3>
                <p className="text-muted-foreground">Ajukan permintaan pembayaran dengan mudah</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              <li>• Formulir pengajuan yang sederhana</li>
              <li>• Upload dokumen pendukung</li>
              <li>• Dapatkan nomor tracking untuk monitoring</li>
              <li>• Proses approval yang transparan</li>
            </ul>
            <Link href="/payment-request">
              <Button className="w-full">
                Mulai Pengajuan
              </Button>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/30 transition-colors">
                <Search className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-xl mb-1">Lacak Status Pembayaran</h3>
                <p className="text-muted-foreground">Monitor status pengajuan pembayaran Anda</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              <li>• Real-time status tracking</li>
              <li>• Update otomatis setiap proses approval</li>
              <li>• Informasi detail tentang status pembayaran</li>
              <li>• Notifikasi ketika status berubah</li>
            </ul>
            <Link href="/track-payment">
              <Button variant="outline" className="w-full">
                Lacak Pembayaran
              </Button>
            </Link>
          </Card>
        </div>

        {/* Member Services */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/10 dark:to-green-900/10 rounded-xl p-8 mb-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Layanan Anggota</h2>
            <p className="text-muted-foreground">Akses khusus untuk anggota koperasi</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Info Simpanan</h3>
              <p className="text-sm text-muted-foreground">
                Pantau saldo simpanan Anda yang terintegrasi dengan sistem Accurate.id
              </p>
            </Card>

            <Card className="p-4 text-center">
              <FileText className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Ajukan Pinjaman</h3>
              <p className="text-sm text-muted-foreground">
                Pengajuan pinjaman multi-tipe dengan simulasi dan perhitungan otomatis
              </p>
            </Card>

            <Card className="p-4 text-center">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Histori Transaksi</h3>
              <p className="text-sm text-muted-foreground">
                Track semua pengajuan dan transaksi Anda dalam satu dashboard
              </p>
            </Card>
          </div>

          <div className="text-center mt-6">
            <HeroAuthButtons />
          </div>
        </div>

        {/* Process Flow */}
        <Card className="p-8 bg-white dark:bg-gray-800/50">
          <h3 className="font-bold text-xl mb-6 text-center">Alur Proses</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-semibold mb-2">Pengajuan</h4>
              <p className="text-sm text-muted-foreground">
                Submit formulir pengajuan pembayaran atau pinjaman
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-orange-600">2</span>
              </div>
              <h4 className="font-semibold mb-2">Review</h4>
              <p className="text-sm text-muted-foreground">
                Tim terkait melakukan review dan analisis pengajuan
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h4 className="font-semibold mb-2">Approval</h4>
              <p className="text-sm text-muted-foreground">
                Proses approval multi-level sesuai kebijakan koperasi
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-green-600">4</span>
              </div>
              <h4 className="font-semibold mb-2">Selesai</h4>
              <p className="text-sm text-muted-foreground">
                Pembayaran diproses dan status diperbarui secara real-time
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
