"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "../provider/language-provider";
import { CheckCircle } from "lucide-react";

interface BonusExchangeConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function BonusExchangeConfirmModal({
  onConfirm,
  onCancel,
}: BonusExchangeConfirmModalProps) {
  const { t } = useLanguage();

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-xs mx-auto dark:bg-gray-800">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <p className="text-lg">{t("bonus.exchange.confirm")}</p>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            className="bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)] border border-white text-white rounded-full py-3"
            onClick={onConfirm}
          >
            {t("bonus.exchange")}
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
