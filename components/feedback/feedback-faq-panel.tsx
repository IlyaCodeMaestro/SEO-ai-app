"use client";

import { useState } from "react";
import { X, ChevronUp, ChevronDown, ArrowLeft, Loader2 } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useLanguage } from "../provider/language-provider";
import { useGetFaqQuestionsQuery } from "@/store/services/feedback-api";
import { IFaqQuestion } from "@/store/types";
import { faqTranslations } from "./translations/faq-translations";

interface FeedbackFaqPanelProps {
  onClose: () => void
}

export function FeedbackFaqPanel({ onClose }: FeedbackFaqPanelProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const { t, language } = useLanguage()

  // Получаем данные FAQ из API
  const { data: faqData, isLoading, error } = useGetFaqQuestionsQuery()

  const toggleFaqItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  // Функция для получения заголовка вопроса на нужном языке
  const getQuestionTitle = (question: IFaqQuestion): string => {
    // Проверяем, есть ли перевод в файле переводов
    const translation = faqTranslations[question.id]?.[language as "kz" | "en" | "ru"]
    if (translation?.title) {
      return translation.title
    }

    // Если нет перевода в файле, проверяем, есть ли перевод в данных API
    if (language === "kz" && question.title_kk) {
      return question.title_kk
    } else if (language === "en" && question.title_en) {
      return question.title_en
    } else if (language === "ru" && question.title_ru) {
      return question.title_ru
    }

    return question.title // Возвращаем дефолтный заголовок, если перевод не найден
  }

  // Функция для получения текста ответа на нужном языке
  const getQuestionMessage = (question: IFaqQuestion): string => {
    // Проверяем, есть ли перевод в файле переводов
    const translation = faqTranslations[question.id]?.[language as "kz" | "en" | "ru"]
    if (translation?.message) {
      return translation.message
    }

    // Если нет перевода в файле, проверяем, есть ли перевод в данных API
    if (language === "kz" && question.message_kk) {
      return question.message_kk
    } else if (language === "en" && question.message_en) {
      return question.message_en
    } else if (language === "ru" && question.message_ru) {
      return question.message_ru
    }

    return question.message // Возвращаем дефолтный текст, если перевод не найден
  }

  // Функция для форматирования текста с переносами строк
  const formatMessage = (message: string) => {
    return message.split("\n").map((line, i) => (
      <span key={i}>
        {line}
        {i < message.split("\n").length - 1 && <br />}
      </span>
    ))
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#333333]">
      {/* Заголовок */}
      <div className="flex items-center justify-between p-4 relative">
        {isMobile ? (
          <>
            <button onClick={onClose} className="absolute left-4 top-1/2 -translate-y-1/2">
              <ArrowLeft size={24} className="text-gray-400 dark:text-white" />
            </button>
            <h2 className="text-lg font-medium mx-auto text-center text-blue-600 pl-6">{t("feedback.title")}</h2>
            <div className="w-6" />
          </>
        ) : (
          <>
            <div className="w-8" />
            <button onClick={onClose} className="p-1 mr-2">
              <X size={24} className="text-gray-400 dark:text-white" />
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
              {t("feedback.faq")}
            </div>
          </div>

          {/* Содержимое */}
          <div className="space-y-4">
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-red-500">{t("error.loading.faq")}</p>
              </div>
            )}

            {!isLoading &&
              !error &&
              faqData?.questions.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#f9f9f9] dark:bg-[#2C2B2B] border shadow-md overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaqItem(index)}
                    className="w-full flex justify-between items-center px-5 py-4 text-left"
                  >
                    <span className="text-base text-[#1e1e1e] dark:text-white font-medium">
                      {getQuestionTitle(item)}
                    </span>
                    {openIndex === index ? (
                      <ChevronUp size={20} className="text-[#4C6FFF]" />
                    ) : (
                      <ChevronDown size={20} className="text-[#4C6FFF]" />
                    )}
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
                <p className="text-gray-500 dark:text-white">{t("feedback.no.questions")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
