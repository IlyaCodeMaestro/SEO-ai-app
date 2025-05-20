"use client";

import { useState, useRef, useEffect } from "react";
import { Copy, X, MessageCircle } from "lucide-react";
import { useLanguage } from "../provider/language-provider";

interface ShareMenuProps {
  content: string;
  title?: string;
  onClose: () => void;
}

export function ShareMenu({ content, title, onClose }: ShareMenuProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleWhatsAppShare = () => {
    const shareText = encodeURIComponent(
      title ? `${title}\n\n${content}` : content
    );
    window.open(`https://wa.me/?text=${shareText}`, "_blank");
  };
  const handleTelegramShare = () => {
    const shareText = encodeURIComponent(
      title ? `${title}\n\n${content}` : content
    );
    window.open(`https://t.me/share/url?url=${shareText}`, "_blank");
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(title || t("share.default.title"));
    const body = encodeURIComponent(content);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center rounded-3xl">
      <div
        ref={menuRef}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-xs w-full mx-4 overflow-hidden"
      >
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="font-medium">{t("share.title")}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex justify-around mb-6">
            <button
              onClick={handleTelegramShare}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center mb-1">
                <img
                  src="/icons/telegram-logo.png"
                  alt="Telegram"
                  className="h-6 w-6 object-contain"
                />
              </div>
              <span className="text-xs">Telegram</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-1">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs">WhatsApp</span>
            </button>

            <button
              onClick={handleEmailShare}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-white"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <span className="text-xs">Gmail</span>
            </button>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCopy}
              className="w-full flex items-center py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Copy className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
              <span>{copied ? t("share.copied") : t("share.copy")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
