"use client";

import { X, ArrowLeft, Loader2 } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import Image from "next/image";
import { useLanguage } from "../provider/language-provider";
import { useGetFeedbackTypesQuery } from "@/store/services/feedback-api";

interface FeedbackRecommendationsPanelProps {
  onClose: () => void;
}

export function FeedbackRecommendationsPanel({
  onClose,
}: FeedbackRecommendationsPanelProps) {
  const { language } = useLanguage();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Получаем данные типов обратной связи из API
  const { data: feedbackData, isLoading, error } = useGetFeedbackTypesQuery();

  // Находим данные для рекомендаций (id: 1)
  const recommendationsData = feedbackData?.feedback_type?.find(
    (item) => item.id === 1
  );

  // Функция для получения заголовка главной панели
  const getHeaderTitle = () => {
    if (language === "kz") return "Кері байланыс";
    if (language === "en") return "Feedback";
    return "Обратная связь";
  };

  const getWriteToText = () => {
    if (language === "kz") return "Жазу";
    if (language === "en") return "Write to";
    return "Написать в";
  };

  const getLoadingText = () => {
    if (language === "kz") return "Жүктелуде...";
    if (language === "en") return "Loading...";
    return "Загрузка...";
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-[#404040] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-2 text-blue-600">{getLoadingText()}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#404040]">
      {/* Заголовок */}
      <div className="flex items-center justify-between p-4 relative">
        {isMobile ? (
          <>
            <button
              onClick={onClose}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              aria-label="Назад"
            >
              <ArrowLeft
                size={24}
                className="text-gray-400 dark:text-blue-600"
              />
            </button>
            <h2 className="text-lg font-medium mx-auto text-center text-blue-600 pl-6">
              {getHeaderTitle()}
            </h2>
            <div className="w-6" />
          </>
        ) : (
          <>
            <div className="w-8" />
            <h2 className="text-lg font-medium flex-1 text-center text-blue-600"></h2>
            <button onClick={onClose} className="p-1 mr-2" aria-label="Закрыть">
              <X size={24} className="text-gray-400 dark:text-blue-600" />
            </button>
          </>
        )}
      </div>

      {/* Подзаголовок - синяя кнопка */}
      <div className="px-4 py-3 flex justify-center">
        <div className="bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)] text-white rounded-full py-3 w-[450px] text-center font-medium">
          {recommendationsData?.title || "Рекомендации"}
        </div>
      </div>

      {/* Содержимое */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-md mx-auto bg-gray-50 dark:bg-[#2C2B2B] rounded-lg p-6 shadow-md border">
          <p className="text-gray-600 mb-6 text-center text-sm dark:text-white">
            {recommendationsData?.note ||
              "Если у вас есть предложения по улучшению нашего сервиса, напишите нам в мессенджер."}
          </p>

          {/* Кнопка Телеграм */}
          <div className="flex justify-center">
            <a
              href="https://t.me/seoerlan?text=Рекомендация:"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 shadow-md bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)] border border-white text-white rounded-full py-2 px-5 transition-colors text-sm"
            >
              <span>{getWriteToText()}</span>
              <Image
                src="/icons/telegram-logo.png"
                alt="Telegram"
                width={20}
                height={20}
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
