/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { formatRupiah } from "../utils";

// Clean phone number format for WhatsApp api (must start with country code e.g. 62)
export function cleanPhoneNumber(phone: string): string {
  if (!phone) return "";
  let clean = phone.replace(/[^0-9]/g, "");
  if (clean.startsWith("0")) {
    clean = "62" + clean.slice(1);
  }
  return clean;
}

// Generate WhatsApp direct send link
export function getWhatsAppUrl(phone: string, text: string): string {
  const formattedPhone = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`;
}

export interface WhatsAppNotification {
  recipientName: string;
  phone: string;
  category: "Pembayaran Siswa" | "Piutang Siswa" | "Dana Masuk Transfer" | "Gaji & Payroll";
  message: string;
}

// 1. WhatsApp Student Payment Receipt
export function formatPaymentNotification(
  studentName: string,
  amount: number,
  description: string,
  date: string,
  remainingDebt: number,
  lembaga: string = "LPK Nandita Floating Hotel"
): string {
  return `*BUKTI PEMBAYARAN RESMI* ✅
LPK NANDITA FLOATING HOTEL & KAPAL PESIAR

Yth. *${studentName}*,
Terima kasih, pembayaran Anda telah berhasil kami terima dan verifikasi.

*Rincian Transaksi:*
- *Tanggal:* ${date}
- *Nominal:* ${formatRupiah(amount)}
- *Keterangan:* ${description}
- *Sisa Piutang:* ${formatRupiah(remainingDebt)}

Pembayaran ini telah tercatat secara otomatis di Buku Induk Siswa. Silakan hubungi bagian Administrasi jika ada pertanyaan.
_Pesan ini dikirim otomatis oleh Sistem Keuangan ${lembaga}._`;
}

// 2. WhatsApp Student Receivable Reminder
export function formatReceivableNotification(
  studentName: string,
  totalBiaya: number,
  unpaidAmount: number,
  lembaga: string = "LPK Nandita Floating Hotel"
): string {
  const paidAmount = totalBiaya - unpaidAmount;
  return `*PENGINGAT TAGIHAN PIUTANG SISWA* 📢
LPK NANDITA FLOATING HOTEL & KAPAL PESIAR

Yth. *${studentName}*,
Kami menginfokan ringkasan administrasi keuangan pendidikan Anda:

- *Total Biaya Pendidikan:* ${formatRupiah(totalBiaya)}
- *Sudah Dibayarkan:* ${formatRupiah(paidAmount)}
- *Sisa Piutang Aktif:* *${formatRupiah(unpaidAmount)}*

Mohon untuk segera melakukan pembayaran angsuran melalui transfer atau tunai ke bagian kasir LPK Nandita sebelum batas waktu program berakhir.
_Pesan ini dikirim otomatis oleh Sistem Keuangan ${lembaga}._`;
}

// 3. WhatsApp Incoming Transfer Notification
export function formatIncomeNotification(
  penerima: string,
  category: string,
  description: string,
  amount: number,
  date: string,
  lembaga: string = "LPK Nandita Floating Hotel"
): string {
  return `*NOTIFIKASI UANG MASUK (TRANSFER)* 💰
LPK NANDITA FLOATING HOTEL & KAPAL PESIAR

Telah diterima dana transfer masuk ke rekening lembaga:

- *Tanggal Penerimaan:* ${date}
- *Nominal:* *${formatRupiah(amount)}*
- *Kategori:* ${category}
- *Keterangan:* ${description}
- *Penerima Kas:* ${penerima}

Dana telah diverifikasi aman dan dibukukan ke dalam Kas Operasional ${lembaga}.`;
}

// 4. WhatsApp Staff and Instructor Salary Payroll
export function formatSalaryNotification(
  staffName: string,
  role: string,
  month: string,
  basic: number,
  allowance: number,
  bonus: number,
  deduction: number,
  net: number,
  date: string,
  lembaga: string = "LPK Nandita Floating Hotel"
): string {
  return `*SLIP GAJI BULANAN RESMI (WHATSAPP)* 💼
LPK NANDITA FLOATING HOTEL & KAPAL PESIAR

Yth. *${staffName}* (${role}),
Gaji Anda untuk periode *${month}* telah berhasil dibayarkan pada tanggal ${date}.

*Rincian Slip Gaji:*
- *Gaji Pokok:* ${formatRupiah(basic)}
- *Tunjangan Tetap:* ${formatRupiah(allowance)}
- *Lembur & Bonus:* ${formatRupiah(bonus)}
- *Potongan Kas:* -${formatRupiah(deduction)}
- *Take Home Pay:* *${formatRupiah(net)}*

_Gaji telah ditransfer ke rekening terdaftar Anda. Terima kasih atas dedikasi dan profesionalisme Anda dalam memajukan ${lembaga}!_`;
}
