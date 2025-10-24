"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PaymentRequestPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [formData, setFormData] = useState({
    requestorName: "",
    requestorEmail: "",
    itemDescription: "",
    estimatedPrice: "",
    file: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.requestorName.trim()) {
      newErrors.requestorName = "Nama pemohon wajib diisi";
    }

    if (!formData.itemDescription.trim()) {
      newErrors.itemDescription = "Deskripsi barang wajib diisi";
    }

    if (!formData.estimatedPrice || parseFloat(formData.estimatedPrice) <= 0) {
      newErrors.estimatedPrice = "Estimasi harga harus lebih dari 0";
    }

    if (formData.requestorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.requestorEmail)) {
      newErrors.requestorEmail = "Format email tidak valid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        requestorName: formData.requestorName.trim(),
        requestorEmail: formData.requestorEmail.trim() || null,
        itemDescription: formData.itemDescription.trim(),
        estimatedPrice: parseFloat(formData.estimatedPrice),
      };

      const response = await fetch("/api/payment-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmittedData(data.data);
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrors({ submit: data.error || "Terjadi kesalahan saat mengajukan pembayaran" });
      }
    } catch (error) {
      setErrors({ submit: "Terjadi kesalahan jaringan. Silakan coba lagi." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const formatCurrency = (value: string) => {
    const number = parseFloat(value);
    if (isNaN(number)) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  if (submittedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Pengajuan Berhasil!</h1>
            <p className="text-muted-foreground mb-6">
              Pengajuan pembayaran Anda telah berhasil diterima dan sedang dalam proses review.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold mb-4">Detail Pengajuan:</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nomor Tracking:</span>
                  <Badge variant="secondary" className="font-mono">
                    {submittedData.trackingNumber}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nama Pemohon:</span>
                  <span>{submittedData.requestorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deskripsi:</span>
                  <span className="text-right max-w-xs">{submittedData.itemDescription}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimasi Harga:</span>
                  <span className="font-semibold">{formatCurrency(submittedData.estimatedPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline">Menunggu Review Staf</Badge>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Simpan nomor tracking ini!</strong> Anda dapat menggunakan nomor tracking
                untuk memonitor status pengajuan Anda.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/track-payment">
                <Button variant="outline" className="w-full sm:w-auto">
                  Lacak Status
                </Button>
              </Link>
              <Button
                onClick={() => {
                  setSubmittedData(null);
                  setFormData({
                    requestorName: "",
                    requestorEmail: "",
                    itemDescription: "",
                    estimatedPrice: "",
                    file: null,
                  });
                }}
                className="w-full sm:w-auto"
              >
                Ajukan Lagi
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>
          <h1 className="text-3xl font-bold mb-2">Formulir Pengajuan Pembayaran</h1>
          <p className="text-muted-foreground">
            Isi formulir di bawah ini untuk mengajukan permintaan pembayaran
          </p>
        </div>

        {errors.submit && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informasi Pemohon */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Informasi Pemohon
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="requestorName">Nama Lengkap *</Label>
                  <Input
                    id="requestorName"
                    value={formData.requestorName}
                    onChange={(e) => handleInputChange("requestorName", e.target.value)}
                    placeholder="Masukkan nama lengkap Anda"
                    className={errors.requestorName ? "border-red-500" : ""}
                  />
                  {errors.requestorName && (
                    <p className="text-sm text-red-500 mt-1">{errors.requestorName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="requestorEmail">Email (Opsional)</Label>
                  <Input
                    id="requestorEmail"
                    type="email"
                    value={formData.requestorEmail}
                    onChange={(e) => handleInputChange("requestorEmail", e.target.value)}
                    placeholder="email@example.com"
                    className={errors.requestorEmail ? "border-red-500" : ""}
                  />
                  {errors.requestorEmail && (
                    <p className="text-sm text-red-500 mt-1">{errors.requestorEmail}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Detail Pembayaran */}
            <div>
              <h3 className="font-semibold mb-4">Detail Pembayaran</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="itemDescription">Deskripsi Barang/Jasa *</Label>
                  <Textarea
                    id="itemDescription"
                    value={formData.itemDescription}
                    onChange={(e) => handleInputChange("itemDescription", e.target.value)}
                    placeholder="Jelaskan barang atau jasa yang akan dibeli..."
                    rows={4}
                    className={errors.itemDescription ? "border-red-500" : ""}
                  />
                  {errors.itemDescription && (
                    <p className="text-sm text-red-500 mt-1">{errors.itemDescription}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="estimatedPrice">Estimasi Harga (IDR) *</Label>
                  <Input
                    id="estimatedPrice"
                    type="number"
                    value={formData.estimatedPrice}
                    onChange={(e) => handleInputChange("estimatedPrice", e.target.value)}
                    placeholder="0"
                    className={errors.estimatedPrice ? "border-red-500" : ""}
                  />
                  {errors.estimatedPrice && (
                    <p className="text-sm text-red-500 mt-1">{errors.estimatedPrice}</p>
                  )}
                  {formData.estimatedPrice && parseFloat(formData.estimatedPrice) > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Estimasi: {formatCurrency(formData.estimatedPrice)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Upload Dokumen */}
            <div>
              <h3 className="font-semibold mb-4">Dokumen Pendukung (Opsional)</h3>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  Upload dokumen pendukung (PDF, JPG, PNG)
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Maksimal ukuran file: 10MB
                </p>
                <Button type="button" variant="outline">
                  Pilih File
                </Button>
                {/* File upload functionality will be implemented later */}
                <p className="text-xs text-muted-foreground mt-4">
                  Note: Fitur upload akan tersedia segera
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? "Mengajukan..." : "Ajukan Pembayaran"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Info Section */}
        <Card className="p-6 mt-6 bg-blue-50 dark:bg-blue-900/10">
          <h3 className="font-semibold mb-3">Proses Selanjutnya</h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>1. Pengajuan Anda akan direview oleh Staf Pengadaan</li>
            <li>2. Jika disetujui, akan dilanjutkan ke Manager</li>
            <li>3. Setelah final approval, pembayaran akan diproses</li>
            <li>4. Anda dapat memonitor status menggunakan nomor tracking</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}