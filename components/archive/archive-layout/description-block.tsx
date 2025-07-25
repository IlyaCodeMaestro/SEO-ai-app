"use client";

import { useLanguage } from "@/components/provider/language-provider";
import { ChevronDown, ChevronUp, Copy, Maximize2 } from "lucide-react";
import Image from "next/image";
import {
  useGetCardAnalysisQuery,
  useGetCardDescriptionQuery,
} from "@/store/services/main";
import { notification } from "antd";

interface DescriptionBlockProps {
  title: string;
  description: string;
  descriptionLength?: number; // добавить опциональный проп
  section: string;
  isExpanded: boolean;
  onToggle: (section: string) => void;
  onCopy: (content: string, section: string) => void;
  onShare: () => void;
  copiedSection: string | null;
  fullWidth?: boolean;
  isMobile: boolean;
  onMaximize?: (title: string) => void;
  cardId?: number; // добавить новый проп для ID карточки
  itemType?: "analysis" | "description" | "both"; // добавить тип элемента
}

export function DescriptionBlock({
  title,
  description,
  descriptionLength,
  section,
  isExpanded,
  onToggle,
  onCopy,
  onShare,
  copiedSection,
  fullWidth = false,
  isMobile,
  onMaximize,
  cardId,
  itemType,
}: DescriptionBlockProps) {
  const { t } = useLanguage();
  const [api, contextHolder] = notification.useNotification();

  // Определяем, какие API запросы нужно делать
  const shouldFetchAnalysis = itemType === "analysis" || itemType === "both";
  const shouldFetchDescription =
    itemType === "description" || itemType === "both";

  // Получаем данные через API
  const { data: analysisData } = useGetCardAnalysisQuery(cardId!, {
    skip: !shouldFetchAnalysis || !cardId,
  });

  const { data: descriptionData } = useGetCardDescriptionQuery(cardId!, {
    skip: !shouldFetchDescription || !cardId,
  });

  // Вычисляем количество символов из API данных
  const symbolsCount =
    descriptionLength ||
    descriptionData?.description?.length ||
    analysisData?.analysis?.description?.length ||
    0;

  // Функция для копирования с уведомлением
  const handleCopy = (content: string, section: string) => {
    onCopy(content, section);
    api.success({
      message: t("common.copied") || "Скопировано",
      placement: "bottomRight",
      duration: 2,
      style: {
        backgroundColor: "#f6ffed",
        border: "1px solid #b7eb8f",
      },
    });
  };

  if (isMobile) {
    return (
      <>
        {contextHolder}
        <div className="bg-[#f9f8f8] dark:bg-[#2C2B2B] rounded-3xl dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] overflow-hidden">
          <div className="p-4">
            {/* Верхняя строка: копировать — заголовок — поделиться */}
            <div className="relative flex items-center justify-between mb-3">
              {/* Левая иконка */}
              <button
                className="text-blue-600 z-10"
                onClick={() => handleCopy(description, section)}
                aria-label={t("common.copy")}
              >
                <Copy
                  className={`h-4 w-4 ${
                    copiedSection === section
                      ? "text-blue-900"
                      : "text-blue-600"
                  }`}
                />
              </button>

              {/* Заголовок — по центру, в одну строку, обрезается если не помещается */}
              <h3
                className="absolute left-1/2 transform -translate-x-1/2 text-sm font-medium z-0 truncate max-w-[70%] text-center"
                title={title} // показываем подсказку при наведении
              >
                {t("description.title")}
              </h3>

              {/* Правая иконка */}
              <button
                className="text-blue-600 z-10"
                onClick={onShare}
                aria-label="Share description"
              >
                <Image
                  src="/icons/free-icon-share-8162990.png"
                  alt="Share"
                  width={16}
                  height={16}
                  className="h-5 w-7"
                />
              </button>
            </div>

            {/* Основной текст — выравниваем по левому краю */}
            <p
              className={`text-xs leading-relaxed text-left ${
                isExpanded ? "" : "line-clamp-3"
              } whitespace-pre-wrap`}
            >
              {description}
            </p>

            {/* Количество символов - показываем только при расширенном состоянии */}
            {isExpanded && symbolsCount > 0 && (
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                {t("symbols")} {symbolsCount}
              </p>
            )}

            {/* Иконка раскрытия / скрытия */}
            <div className="flex justify-center mt-2">
              <button
                onClick={() => onToggle(section)}
                className="text-gray-400 hover:text-gray-600"
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {contextHolder}
      <div
        className={`bg-[#f9f8f8] dark:bg-[#2C2B2B] rounded-3xl dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] overflow-hidden ${
          fullWidth ? "col-span-2" : ""
        }`}
      >
        <div className="relative flex flex-col sm:flex-row items-center p-4">
          {/* Левая иконка копирования */}
          <div className="flex items-center z-10 mb-2 sm:mb-0">
            <button
              onClick={() => handleCopy(description, section)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={t("common.copy")}
            >
              <Copy
                className={`h-5 w-5 ${
                  copiedSection === section ? "text-blue-900" : "text-blue-600"
                }`}
              />
            </button>
          </div>

          {/* Заголовок по центру */}
          <h3 className="sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2 font-medium z-0 text-center w-full sm:w-auto mb-2 sm:mb-0">
            {t("description.title")}
          </h3>

          {/* Правые иконки */}
          <div className="sm:ml-auto flex items-center space-x-2 z-10">
            {/* Правая иконка */}
            <button
              className="text-blue-600 z-10"
              onClick={onShare}
              aria-label="Share description"
            >
              <Image
                src="/icons/free-icon-share-8162990.png"
                alt="Share"
                width={16}
                height={16}
                className="h-5 w-7"
              />
            </button>
            <button
              onClick={() => onMaximize && onMaximize(title)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Maximize"
            >
              <Maximize2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <p
            className={`text-sm leading-relaxed ${
              isExpanded ? "" : "line-clamp-6"
            } whitespace-pre-wrap`}
          >
            {description}
          </p>
        </div>
      </div>
    </>
  );
}
