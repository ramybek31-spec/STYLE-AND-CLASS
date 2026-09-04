import React, { useState } from "react";
import { X, Copy, Check, MessageSquare, RefreshCw } from "lucide-react";

interface ManagerReportModalProps {
  orderId: string;
  orderNumber: string;
  reportText: string;
  whatsAppUrl: string;
  managerPhone: string;
  onClose: () => void;
  onResendReport: () => Promise<void>;
}

export const ManagerReportModal: React.FC<ManagerReportModalProps> = ({
  orderId,
  orderNumber,
  reportText,
  whatsAppUrl,
  managerPhone,
  onClose,
  onResendReport
}) => {
  const [copied, setCopied] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResend = async () => {
    setResending(true);
    setResendStatus(null);
    try {
      await onResendReport();
      setResendStatus("Report re-queued to notification service successfully!");
    } catch {
      setResendStatus("Failed to re-queue notification.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-stone-900 w-full max-w-xl rounded-lg shadow-2xl p-6 border border-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              Manager Sale Notification Report
            </h3>
            <p className="text-xs text-stone-500">Order #{orderNumber} &middot; Official dispatch format</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Manager Phone & Direct Actions */}
        <div className="my-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-emerald-900">Destination: </span>
            <span className="text-emerald-800">{managerPhone}</span>
            <span className="text-emerald-600 ml-1.5">(WhatsApp Mode A)</span>
          </div>
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded font-semibold transition"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Open in WhatsApp
          </a>
        </div>

        {/* Report Content Preview (Fixed Courier Font, Official Layout) */}
        <div className="relative">
          <pre className="p-4 bg-stone-900 text-stone-100 rounded-md text-xs font-mono leading-relaxed overflow-x-auto max-h-96 whitespace-pre-wrap select-all">
            {reportText}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 bg-stone-800 hover:bg-stone-700 text-white text-xs px-2.5 py-1.5 rounded flex items-center gap-1 border border-stone-700 shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Report"}</span>
          </button>
        </div>

        {resendStatus && (
          <div className="mt-3 text-xs p-2 bg-stone-100 rounded text-stone-700 text-center font-medium">
            {resendStatus}
          </div>
        )}

        {/* Modal Actions */}
        <div className="mt-5 pt-4 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={handleResend}
            disabled={resending}
            className="inline-flex items-center gap-1.5 text-xs text-stone-700 hover:text-black border border-stone-300 hover:border-stone-400 px-3 py-2 rounded transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
            <span>Resend Sale Report</span>
          </button>
          <button
            onClick={onClose}
            className="bg-stone-100 hover:bg-stone-200 text-stone-800 px-4 py-2 rounded text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
