"use client";

import { useState, useEffect } from "react";
import { X, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useLanguage } from "../provider/language-provider";
import { useRouter } from "next/navigation";
import {
  useGetDeleteAccountInfoQuery,
  useRequestDeleteAccountMutation,
  useConfirmDeleteAccountMutation,
} from "../../store/services/main";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface DeleteAccountPanelProps {
  onClose: () => void;
}

export function DeleteAccountPanel({ onClose }: DeleteAccountPanelProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { t } = useLanguage();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();

  // Получаем информацию о запросе на удаление
  const { data: deleteInfo, isLoading, error } = useGetDeleteAccountInfoQuery();

  // Мутации для запроса и подтверждения удаления
  const [requestDelete, { isLoading: isRequesting }] =
    useRequestDeleteAccountMutation();
  const [confirmDelete, { isLoading: isConfirming }] =
    useConfirmDeleteAccountMutation();

  // Показываем ошибку, если она есть
  useEffect(() => {
    if (error) {
      toast({
        title: (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>{t("error")}</span>
          </div>
        ),
        description: t("error.loading.delete.info"),
        className: "bg-red-50 border-red-200 text-red-800",
      });
    }
  }, [error, t]);

  const handleDeleteClick = async () => {
    try {
      // Если запрос на удаление уже существует, показываем модальное окно подтверждения
      if (deleteInfo?.delete_request?.request_send) {
        setShowConfirmModal(true);
      } else {
        // Иначе создаем запрос на удаление
        await requestDelete().unwrap();
        setShowConfirmModal(true);
      }
    } catch (error) {
      toast({
        title: (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>{t("error")}</span>
          </div>
        ),
        description: t("error.request.delete"),
        className: "bg-red-50 border-red-200 text-red-800",
      });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await confirmDelete().unwrap();
      // После успешного удаления перенаправляем на главную страницу
      router.push("/");
    } catch (error) {
      toast({
        title: (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>{t("error")}</span>
          </div>
        ),
        description: t("error.confirm.delete"),
        className: "bg-red-50 border-red-200 text-red-800",
      });
      setShowConfirmModal(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
  };

  return (
    <div className="h-full flex flex-col justify-start bg-white dark:bg-[#333333] px-4 md:px-0">
      {/* Add Toaster component to ensure toasts are displayed */}
      <Toaster />

      {/* Модалка с затемнённым фоном */}
      {showConfirmModal && (
        <div className="absolute pb-72 inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 rounded-3xl">
          <div className="bg-white rounded-xl p-6 max-w-xs w-full mx-4 dark:bg-gray-800">
            <p className="text-center font-medium mb-6">
              {t("cabinet.confirm.delete")}
            </p>

            <div className="space-y-3">
              <div className="flex justify-center">
                <Button
                  onClick={handleConfirmDelete}
                  disabled={isConfirming}
                  className="w-36 bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)] border border-white text-white rounded-full"
                >
                  {isConfirming ? t("loading") : t("cabinet.delete")}
                </Button>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleCancelDelete}
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

      {/* Основной контент */}
      <div className="flex-1 pt-0 max-w-md mx-auto w-full px-2 md:px-0">
        {/* Заголовок с крестиком или стрелкой */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center">
            {isMobile ? (
              <button
                onClick={onClose}
                className="pt-3"
                aria-label={t("common.back")}
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
            ) : null}
          </div>

          <div className="flex justify-center w-full pt-6">
            <h1 className="text-xl font-medium text-center text-blue-600">
              {t("cabinet.delete.account")}
            </h1>
          </div>

          {!isMobile && (
            <div className="flex items-center">
              <button
                onClick={onClose}
                className="p-1"
                aria-label={t("common.close")}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>

        {/* Информация об удалении */}
        <div className="bg-white rounded-xl border-white border p-6 shadow-md dark:border-white dark:bg-[rgba(0,0,0,0.25)]">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <p>{t("loading")}</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 text-center mb-6">
                <p className="text-gray-700 dark:text-white">
                  {t("cabinet.delete.personal.data")}
                </p>
                <p className="text-gray-700 dark:text-white">
                  {t("cabinet.delete.archive")}
                </p>
                <p className="text-gray-700 dark:text-white">
                  {t("cabinet.delete.balance")}
                </p>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleDeleteClick}
                  disabled={isRequesting}
                  className="w-36 bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)] border border-white text-white rounded-full"
                >
                  {isRequesting ? t("loading") : t("cabinet.delete")}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
