"use client";

import { useState, useEffect } from "react";
import { X, ArrowLeft, AlertCircle, Info } from "lucide-react";
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
import { logout } from "@/utils/authService";

interface ExitAccountPanelProps {
  onClose: () => void;
}

export function ExitAccountPanel({ onClose }: ExitAccountPanelProps) {
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
      // Выходим из аккаунта после успешного удаления
      logout();
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
    <div className="h-full flex flex-col justify-start bg-white px-4 md:px-0 dark:bg-[#404040] delete-account-panel">
      {/* Add Toaster component to ensure toasts are displayed */}
      <Toaster />

      {/* Модалка с затемнённым фоном */}
      {showConfirmModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 rounded-3xl mt-0 sm:mt-7">
          <div className="bg-white rounded-xl p-6 max-w-xs w-full mb-64 mx-4 dark:bg-gray-800">
            <p className="text-center font-medium mb-6">
              {t("confirm")}
            </p>

            <div className="space-y-3">
              <div className="flex justify-center">
                <Button
                  onClick={handleConfirmDelete}
                  disabled={isConfirming}
                  className="w-36 bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)] border border-white text-white rounded-full"
                >
                  {isConfirming ? t("loading") : t("yes")}
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

      {/* Заголовок с кнопкой закрытия */}
      <div className="flex items-center justify-between mb-4 mt-3">
        {isMobile ? (
          <>
            <button
              onClick={onClose}
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
            <div className="w-5"></div> {/* Empty div for balanced spacing */}
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
        {/* Заголовок */}
        <div className="w-full border border-white bg-blue-600 dark:border-none py-5 rounded-[25px] text-xl font-medium shadow-md p-4 mb-6 text-white text-center">
          <div className="flex justify-center items-center">
            <span className="text-lg font-medium">
              {t("exit-account")}
            </span>
          </div>
        </div>
 {/* "exit":"Exit",
    "confirm":"Do you want to exit from account?",
    "yes":"Yes", */}
        {/* Информация об удалении */}
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
              <div className="flex justify-center">
                <Button
                  onClick={handleDeleteClick}
                  disabled={isRequesting}
                  className="w-36 bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)] border border-white text-white rounded-full"
                >
                  {isRequesting ? t("loading") : t("exit")}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
