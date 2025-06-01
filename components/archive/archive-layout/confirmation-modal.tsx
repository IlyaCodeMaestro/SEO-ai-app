"use client";

import { useLanguage } from "@/components/provider/language-provider";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}: ConfirmationModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 rounded-3xl">
      {/* Затемнение — клик по нему закрывает окно */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Сам pop-up */}
      <div
        className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:mt-0 mt-48 shadow-lg w-full max-w-xs animate-in slide-in-from-bottom z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-4">
          <h3 className="font-medium">{t("confirmation.title")}</h3>
          <p className="text-sm">{t("confirmation.message")}</p>
          <p className="text-sm">{t("confirmation.notification")}</p>
          <div className="flex justify-center mt-4">
            <button
              onClick={onConfirm}
              className="bg-gradient-to-r h-[40px] w-36 rounded-[25px] shadow-custom from-[#0d52ff] to-[rgba(11,60,187,1)] border border-white text-white"
            >
              {t("confirmation.next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
