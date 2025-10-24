"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  FileText,
  ArrowLeft,
  Upload,
} from "lucide-react";
import Link from "next/link";

const STATUS_CONFIG = {
  PENDING_STAFF_APPROVAL: {
    label: "Menunggu Review Staf",
    color: "yellow",
    description: "Pengajuan sedang direview oleh Staf Pengadaan",
    progress: 20,
  },
  PENDING_MANAGER_APPROVAL: {
    label: "Menunggu Approval Manager",
    color: "orange",
    description: "Pengajuan menunggu persetujuan dari Manager",
    progress: 40,
  },
  APPROVED: {
    label: "Disetujui",
    color: "blue",
    description: "Pengajuan telah disetujui dan akan diproses",
    progress: 60,
  },
  SPP_PROCESSED: {
    label: "SPP Diproses",
    color: "blue",
    description: "Surat Perintah Pembayaran telah dibuat",
    progress: 70,
  },
  PROCESSED: {
    label: "Sedang Dikirim",
    color: "purple",
    description: "Barang/jasa sedang dalam proses pengiriman",
    progress: 80,
  },
  ITEM_RECEIVED: {
    label: "Barang Diterima",
    color: "green",
    description: "Barang telah diterima oleh pemohon",
    progress: 90,
  },
  COMPLETED: {
    label: "Selesai",
    color: "green",
    description: "Transaksi pembayaran telah selesai",
    progress: 100,
  },
  REJECTED: {
    label: "Ditolak",
    color: "red",
    description: "Pengajuan ditolak",
    progress: 0,
  },
};

export default function TrackPaymentPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState("");
  const [showProofUpload, setShowProofUpload] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setError("Nomor tracking wajib diisi");
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      const response = await fetch(`/api/payment-requests?trackingNumber=${encodeURIComponent(trackingNumber.trim())}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setPaymentData(data.data);
        // Show upload section if status is PROCESSED
        setShowProofUpload(data.data.status === "PROCESSED");
      } else {
        setError(data.error || "Pengajuan tidak ditemukan");
        setPaymentData(null);
      }
    } catch (error) {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
      setPaymentData(null);
    } finally {
      setIsSearching(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "REJECTED":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "PROCESSED":
        return <Truck className="w-5 h-5 text-purple-600" />;
      case "ITEM_RECEIVED":
        return <Package className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const handleProofUpload = async () => {
    // This will be implemented later with actual file upload functionality
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      // Show success message and update status
      alert("Fitur upload bukti terima akan segera tersedia");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>
          <h1 className="text-3xl font-bold mb-2">Lacak Status Pembayaran</h1>
          <p className="text-muted-foreground">
            Masukkan nomor tracking untuk memonitor status pengajuan pembayaran Anda
          </p>
        </div>

        {/* Search Form */}
        <Card className="p-6 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="trackingNumber" className="sr-only">
                Nomor Tracking
              </Label>
              <Input
                id="trackingNumber"
                type="text"
                placeholder="Masukkan nomor tracking (contoh: BKI-PO-1234567890)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="text-base"
              />
            </div>
            <Button
              type="submit"
              disabled={isSearching}
              className="px-6"
              size="lg"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Mencari...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Lacak
                </>
              )}
            </Button>
          </form>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Payment Details */}
        {paymentData && (
          <>
            <Card className="p-6 mb-6">
              {/* Header with Status */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Detail Pengajuan</h2>
                  <p className="text-sm text-muted-foreground">
                    Nomor Tracking: <span className="font-mono font-semibold">{paymentData.trackingNumber}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-4 sm:mt-0">
                  {getStatusIcon(paymentData.status)}
                  <Badge
                    variant="outline"
                    className={
                      STATUS_CONFIG[paymentData.status as keyof typeof STATUS_CONFIG]?.color === "green"
                        ? "border-green-600 text-green-600"
                        : STATUS_CONFIG[paymentData.status as keyof typeof STATUS_CONFIG]?.color === "red"
                        ? "border-red-600 text-red-600"
                        : ""
                    }
                  >
                    {STATUS_CONFIG[paymentData.status as keyof typeof STATUS_CONFIG]?.label}
                  </Badge>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <Progress
                  value={STATUS_CONFIG[paymentData.status as keyof typeof STATUS_CONFIG]?.progress || 0}
                  className="h-2"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {STATUS_CONFIG[paymentData.status as keyof typeof STATUS_CONFIG]?.description}
                </p>
              </div>

              <Separator className="mb-6" />

              {/* Request Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Informasi Pemohon</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nama:</span>
                      <span>{paymentData.requestorName}</span>
                    </div>
                    {paymentData.requestorEmail && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{paymentData.requestorEmail}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tanggal Pengajuan:</span>
                      <span>{formatDate(paymentData.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Detail Pembayaran</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-muted-foreground">Deskripsi:</span>
                      <p className="mt-1">{paymentData.itemDescription}</p>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimasi Harga:</span>
                      <span>{formatCurrency(paymentData.estimatedPrice)}</span>
                    </div>
                    {paymentData.approvedPrice && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Harga Disetujui:</span>
                        <span className="font-semibold">{formatCurrency(paymentData.approvedPrice)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rejection Reason */}
              {paymentData.status === "REJECTED" && paymentData.rejectionReason && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                    Alasan Penolakan:
                  </h4>
                  <p className="text-red-700 dark:text-red-300">{paymentData.rejectionReason}</p>
                </div>
              )}
            </Card>

            {/* Proof of Delivery Upload */}
            {showProofUpload && (
              <Card className="p-6 mb-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Bukti Penerimaan
                </h3>
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Barang Anda telah dikirim. Silakan upload bukti penerimaan untuk menyelesaikan transaksi.
                  </p>
                </div>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">
                    Upload bukti penerimaan (PDF, JPG, PNG)
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Maksimal ukuran file: 10MB
                  </p>
                  <Button
                    onClick={handleProofUpload}
                    disabled={uploading}
                    variant="outline"
                  >
                    {uploading ? "Mengupload..." : "Pilih File"}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Note: Fitur upload akan tersedia segera
                  </p>
                </div>
              </Card>
            )}

            {/* Status Timeline */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Timeline Status</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Pengajuan Dibuat</p>
                    <p className="text-sm text-muted-foreground">{formatDate(paymentData.createdAt)}</p>
                  </div>
                </div>

                {/* Add more timeline items based on status */}
                {paymentData.status !== "PENDING_STAFF_APPROVAL" && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Review Staf Selesai</p>
                      <p className="text-sm text-muted-foreground">Status diperbarui</p>
                    </div>
                  </div>
                )}

                {paymentData.status === "COMPLETED" && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Transaksi Selesai</p>
                      <p className="text-sm text-muted-foreground">{formatDate(paymentData.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}

        {/* Help Section */}
        {!paymentData && !error && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Bantuan
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>Cara menemukan nomor tracking:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Nomor tracking akan diberikan setelah Anda mengajukan pembayaran</li>
                <li>Format nomor tracking: BKI-PO-[angka unik]</li>
                <li>Simpan nomor tracking untuk monitoring status pengajuan</li>
              </ul>
              <p className="pt-2">
                <strong>Status pengajuan:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><span className="text-yellow-600">Menunggu Review</span> - Pengajuan sedang diproses</li>
                <li><span className="text-blue-600">Disetujui</span> - Pengajuan disetujui dan akan diproses</li>
                <li><span className="text-purple-600">Dikirim</span> - Barang/jasa sedang dikirim</li>
                <li><span className="text-green-600">Selesai</span> - Transaksi selesai</li>
                <li><span className="text-red-600">Ditolak</span> - Pengajuan tidak disetujui</li>
              </ul>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}