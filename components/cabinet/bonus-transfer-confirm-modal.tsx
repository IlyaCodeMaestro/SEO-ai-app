"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "../provider/language-provider";

interface BonusTransferConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function BonusTransferConfirmModal({
  onConfirm,
  onCancel,
}: BonusTransferConfirmModalProps) {
  const { t } = useLanguage();

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-xs mx-auto dark:bg-gray-800">
        <div className="text-center mb-6">
          <p className="text-lg">{t("bonus.transfer.confirm")}</p>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            className="bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)] border border-white text-white rounded-full py-3"
            onClick={onConfirm}
          >
            {t("bonus.transfer")}
          </Button>
          <Button
            variant="outline"
            className="border-gray-300 text-gray-700 rounded-full py-3 dark:text-white dark:bg-gray-400"
            onClick={onCancel}
          >
            {t("cabinet.cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
}
