/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MessageSquare, Copy, ExternalLink, Check, Send } from "lucide-react";
import { cleanPhoneNumber, getWhatsAppUrl, WhatsAppNotification } from "../utils/whatsapp";

interface WhatsAppModalProps {
  notification: WhatsAppNotification;
  onClose: () => void;
}

export default function WhatsAppModal({ notification, onClose }: WhatsAppModalProps) {
  const [phone, setPhone] = useState(notification.phone);
  const [messageText, setMessageText] = useState(notification.message);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = messageText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const cleanPhone = cleanPhoneNumber(phone);
  const waUrl = getWhatsAppUrl(cleanPhone, messageText);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in border border-slate-100">
        {/* WhatsApp Header */}
        <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="bg-emerald-500 p-1.5 rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm font-sans">WhatsApp Notifikasi Otomatis</h3>
              <p className="text-[10px] text-emerald-100 font-mono tracking-wide uppercase">
                Kategori: {notification.category}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-100 hover:text-white font-bold text-lg focus:outline-none"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Nama Penerima
              </label>
              <input
                type="text"
                disabled
                value={notification.recipientName}
                className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-500 bg-slate-50 font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                No. WhatsApp (HP)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0812345678"
                className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 bg-slate-50/30 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block flex justify-between items-center">
              <span>Isi Pesan Notifikasi</span>
              <span className="text-[9px] text-emerald-600 lowercase font-bold">Karakter: {messageText.length}</span>
            </label>
            <textarea
              rows={8}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-700 bg-slate-50/20 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none leading-relaxed"
            />
          </div>

          {!cleanPhone && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-700 font-medium">
              ⚠️ Nomor handphone belum diatur atau kosong. Silakan ketik nomor tujuan di atas sebelum mengirim.
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="bg-slate-50 px-5 py-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span className="text-emerald-700">Teks Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Salin Teks</span>
              </>
            )}
          </button>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 border border-transparent rounded-xl text-slate-500 hover:text-slate-700 text-xs font-semibold"
            >
              Tutup
            </button>
            <a
              href={cleanPhone ? waUrl : undefined}
              target={cleanPhone ? "_blank" : undefined}
              rel="noopener noreferrer"
              onClick={() => {
                if (cleanPhone) {
                  setTimeout(() => onClose(), 800);
                }
              }}
              className={`flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md transition-all ${
                cleanPhone
                  ? "hover:bg-emerald-700 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
              }`}
            >
              <Send className="w-3.5 h-3.5 text-white" />
              <span>Kirim WhatsApp</span>
              <ExternalLink className="w-3 h-3 text-emerald-200" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
