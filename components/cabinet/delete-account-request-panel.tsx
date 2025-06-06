"use client";

import { useEffect, useState } from "react";
import { X, ArrowLeft, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useLanguage } from "../provider/language-provider";
import { useRouter } from "next/navigation";

import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  useGetDeleteAccountInfoQuery,
  useConfirmDeleteAccountMutation,
} from "@/store/services/profile-api";

interface DeleteAccountRequestPanelProps {
  onClose: () => void;
  onBack?: () => void; // Новый пропс для возврата к предыдущему экрану
}

export function DeleteAccountRequestPanel({
  onClose,
  onBack,
}: DeleteAccountRequestPanelProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { t } = useLanguage();
  const router = useRouter();

  // Добавить состояние для управления модальным окном
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Получаем информацию о запросе на удаление
  const { data: deleteInfo, isLoading, error } = useGetDeleteAccountInfoQuery();

  // Мутация для подтверждения удаления
  const [confirmDelete, { isLoading: isConfirming }] =
    useConfirmDeleteAccountMutation();

  // Показываем ошибку, если она есть
  useEffect(() => {
    if (error) {
      toast({
        title: (
          <div className="flex items-center gap-2 text-red-600">
            <Info className="h-5 w-5" />
            <span>{t("error")}</span>
          </div>
        ),
        description: t("error.loading.delete.info"),
        className: "bg-red-50 border-red-200 text-red-800",
      });
    }
  }, [error, t]);

  const handleBackToHome = () => {
    setShowConfirmModal(true);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleConfirmClose = async () => {
    try {
      await confirmDelete().unwrap();

      toast({
        title: (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>{t("success")}</span>
          </div>
        ),
        description: t("cabinet.delete.confirmed"),
        className: "bg-green-50 border-green-200 text-green-800",
      });

      setShowConfirmModal(false);
      onClose();
    } catch (error) {
      toast({
        title: (
          <div className="flex items-center gap-2 text-red-600">
            <Info className="h-5 w-5" />
            <span>{t("error")}</span>
          </div>
        ),
        description: t("error.confirm.delete"),
        className: "bg-red-50 border-red-200 text-red-800",
      });
      setShowConfirmModal(false);
    }
  };

  const handleCancelClose = () => {
    setShowConfirmModal(false);
  };

  return (
    <div className="h-full flex flex-col justify-start bg-white px-4 md:px-0 dark:bg-[#404040] delete-account-panel">
      {/* Модалка с затемнённым фоном */}
      {showConfirmModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 rounded-3xl mt-0 sm:mt-7">
          <div className="bg-white rounded-xl p-6 max-w-xs w-full mb-64 mx-4 dark:bg-gray-800">
            <p className="text-center font-medium mb-6">
              {t("cabinet.confirm.delete-cancel")}
            </p>

            <div className="space-y-3">
              <div className="flex justify-center">
                <Button
                  onClick={handleConfirmClose}
                  disabled={isConfirming}
                  className="w-36 bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)] border border-white text-white rounded-full"
                >
                  {isConfirming ? t("loading") : t("cabinet.delete-cancel")}
                </Button>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleCancelClose}
                  disabled={isConfirming}
                  className="w-36 bg-gray-400 hover:bg-gray-500 text-white rounded-full"
                >
                  {t("cabinet.cancel")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Toaster />

      {/* Заголовок с кнопкой закрытия */}
      <div className="flex items-center justify-between mb-4 mt-3">
        {isMobile ? (
          <>
            <button
              onClick={onBack || onClose}
              className="p-1"
              aria-label={t("common.back")}
            >
              <ArrowLeft className="h-5 w-5 dark:text-blue-600" />
            </button>
            <div className="flex-1 text-center">
              <h2 className="text-xl font-medium text-blue-600">
                {t("cabinet.title")}
              </h2>
            </div>
            <div className="w-5"></div>
          </>
        ) : (
          <>
            <div className="flex-1"></div>
            <button
              onClick={onClose}
              className="p-1"
              aria-label={t("common.close")}
            >
              <X className="h-5 w-5 dark:text-blue-600" />
            </button>
          </>
        )}
      </div>

      <div className="flex-1 pt-0 max-w-md mx-auto w-full px-2 md:px-0">
        {/* Заголовок успеха */}
        <div className="w-full border border-white bg-blue-600 dark:border-none py-5 rounded-[25px] text-xl font-medium shadow-md p-4 mb-6 text-white text-center">
          <div className="flex justify-center items-center gap-2">
            <span className="text-lg font-medium">
              {t("cabinet.delete.account")}
            </span>
          </div>
        </div>

        {/* Информация о статусе запроса */}
        <div className="bg-white rounded-3xl p-6 shadow-md border dark:bg-[#2C2B2B] dark:border-none">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <p>{t("common.loading")}</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <div className="bg-red-500 rounded-full p-3 mb-4">
                <Info className="h-6 w-6 text-white" />
              </div>
              <p className="text-xl font-bold">
                {t("error.loading.delete.info")}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4 text-center mb-6">
                <p className="text-gray-700 dark:text-white">
                  {t("cabinet.delete.request.processing")}
                </p>
              </div>

              <div className="flex justify-center space-x-4">
                <Button
                  onClick={handleBackToHome}
                  className="w-64 h-12 bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)] border border-white text-white rounded-full text-lg font-normal"
                >
                  {t("common.closed")}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
