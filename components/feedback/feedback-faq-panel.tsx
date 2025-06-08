"use client";

import { useState } from "react";
import { X, ChevronUp, ChevronDown, ArrowLeft, Loader2 } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useLanguage } from "../provider/language-provider";
import { useGetFaqQuestionsQuery } from "@/store/services/feedback-api";
import type { IFaqQuestion } from "@/store/types";

interface FeedbackFaqPanelProps {
  onClose: () => void;
}

export function FeedbackFaqPanel({ onClose }: FeedbackFaqPanelProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { language } = useLanguage();

  // Получаем данные FAQ из API
  const { data: faqData, isLoading, error } = useGetFaqQuestionsQuery();

  const toggleFaqItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Функция для получения заголовка вопроса на нужном языке из API
  const getQuestionTitle = (question: IFaqQuestion): string => {
    if (language === "kz" && question.title_kk) {
      return question.title_kk;
    } else if (language === "en" && question.title_en) {
      return question.title_en;
    } else if (language === "ru" && question.title_ru) {
      return question.title_ru;
    }
    return question.title; // Возвращаем дефолтный заголовок
  };

  // Функция для получения текста ответа на нужном языке из API
  const getQuestionMessage = (question: IFaqQuestion): string => {
    if (language === "kz" && question.message_kk) {
      return question.message_kk;
    } else if (language === "en" && question.message_en) {
      return question.message_en;
    } else if (language === "ru" && question.message_ru) {
      return question.message_ru;
    }
    return question.message; // Возвращаем дефолтный текст
  };

  // Функция для форматирования текста с переносами строк
  const formatMessage = (message: string) => {
    return message.split("\n").map((line, i) => (
      <span key={i}>
        {line}
        {i < message.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  // Определяем размер иконок в зависимости от устройства
  const iconSize = 20;

  // Получаем заголовки из API или используем дефолтные значения
  const getHeaderTitle = () => {
    // Можно добавить заголовок в API ответ, пока используем дефолтные значения
    if (language === "kz") return "Кері байланыс";
    if (language === "en") return "Feedback";
    return "Обратная связь";
  };

  const getFaqTitle = () => {
    // Можно добавить заголовок в API ответ, пока используем дефолтные значения
    if (language === "kz") return "Жиі қойылатын сұрақтар";
    if (language === "en") return "Frequently Asked Questions";
    return "Часто задаваемые вопросы";
  };

  const getLoadingText = () => {
    if (language === "kz") return "Жүктелуде...";
    if (language === "en") return "Loading...";
    return "Загрузка...";
  };

  const getErrorText = () => {
    if (language === "kz") return "FAQ жүктеу қатесі";
    if (language === "en") return "Error loading FAQ";
    return "Ошибка загрузки FAQ";
  };

  const getNoQuestionsText = () => {
    if (language === "kz") return "Сұрақтар жоқ";
    if (language === "en") return "No questions available";
    return "Нет доступных вопросов";
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#404040]">
      {/* Заголовок */}
      <div className="flex items-center justify-between p-4 relative">
        {isMobile ? (
          <>
            <button
              onClick={onClose}
              className="absolute left-4 top-1/2 -translate-y-1/2"
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
            <button onClick={onClose} className="p-1 mr-2">
              <X size={24} className="text-gray-400 dark:text-blue-600" />
            </button>
          </>
        )}
      </div>

      {/* Контент */}
      <div className="w-full flex justify-center px-4 pb-6 overflow-y-auto">
        <div className="w-full max-w-[560px]">
          {/* Подзаголовок */}
          <div className="py-4 flex justify-center">
            <div className="bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)] text-white rounded-full py-3 px-6 text-center font-medium w-full">
              {getFaqTitle()}
            </div>
          </div>

          {/* Содержимое */}
          <div className="space-y-4">
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                <span className="ml-2 text-blue-600">{getLoadingText()}</span>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-red-500">{getErrorText()}</p>
              </div>
            )}

            {!isLoading &&
              !error &&
              faqData?.questions.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#f9f9f9] dark:bg-[#2C2B2B] border shadow-md overflow-hidden dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)]"
                >
                  <button
                    onClick={() => toggleFaqItem(index)}
                    className="w-full flex justify-between items-center px-5 py-4 text-left"
                  >
                    <span className="text-base text-[#1e1e1e] dark:text-white font-medium pr-2">
                      {getQuestionTitle(item)}
                    </span>
                    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                      {openIndex === index ? (
                        <ChevronUp size={iconSize} className="text-[#4C6FFF]" />
                      ) : (
                        <ChevronDown
                          size={iconSize}
                          className="text-[#4C6FFF]"
                        />
                      )}
                    </div>
                  </button>
                  {openIndex === index && (
                    <div className="px-5 pb-4 text-sm text-gray-600 dark:text-white">
                      {formatMessage(getQuestionMessage(item))}
                    </div>
                  )}
                </div>
              ))}

            {!isLoading && !error && faqData?.questions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-white">
                  {getNoQuestionsText()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
