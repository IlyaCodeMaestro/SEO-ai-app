"use client";

import { useLanguage } from "@/components/provider/language-provider";
import { ChevronDown, ChevronUp, Maximize2 } from "lucide-react";

interface MissedKeywordsTableProps {
  title: string;
  keywords: { word: string; frequency: number }[];
  section: string;
  isExpanded: boolean;
  onToggle: (section: string) => void;
  onCopy: (content: string, section: string) => void;
  onShare: (
    keywords: { word: string; frequency: string }[],
    title: string
  ) => void;
  copiedSection: string | null;
  textColorClass?: string;
  isMobile: boolean;
  onMaximize?: (title: string) => void;
}

export function MissedKeywordsTable({
  title,
  keywords,
  section,
  isExpanded,
  onToggle,
  textColorClass = "",
  isMobile,
  onMaximize,
}: MissedKeywordsTableProps) {
  const { t } = useLanguage();

  const getContentForCopy = () => {
    return keywords.map((k) => `${k.word}: ${k.frequency}`).join("\n");
  };

  // Функция для получения прозрачности элемента
  const getOpacity = (index: number, totalVisible: number) => {
    // Применяем затухание только в раскрытом состоянии
    if (!isExpanded) return 1;

    // Для последних двух элементов применяем затухание
    if (index === totalVisible - 2) return 0.6;
    if (index === totalVisible - 1) return 0.3;

    return 1;
  };

  if (isMobile) {
    const visibleKeywords = keywords.slice(0, isExpanded ? undefined : 3);

    return (
      <div className="bg-[#f9f8f8] dark:bg-[#2C2B2B] rounded-3xl dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] overflow-hidden">
        <div className="p-4">
          {/* Simplified header with just the title */}
          <div className="flex items-center justify-center mb-3">
            <h3 className="text-md font-medium text-center" title={title}>
              {t("keywords.missed")}
            </h3>
          </div>

          {/* Заголовки */}
          <div className="flex justify-between mb-2">
            <div className="font-medium text-sm">
              {t("keywords.column.keywords")}
            </div>
            <div className="font-medium text-sm">
              {t("keywords.column.frequency")}
            </div>
          </div>

          {/* Список ключевых слов с эффектом затухания */}
          <div className="space-y-1">
            {visibleKeywords.map((keyword, index) => (
              <div
                key={index}
                className="flex justify-between items-center transition-opacity duration-300"
                style={{ opacity: getOpacity(index, visibleKeywords.length) }}
              >
                <span className={`text-sm ${textColorClass}`}>
                  {keyword.word}
                </span>
                <span className="text-sm text-blue-500">
                  {keyword.frequency}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Keep the chevron icons for expand/collapse */}
        <div className="flex justify-center pb-2">
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={() => onToggle(section)}
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
    );
  }

  const visibleKeywords = keywords.slice(0, isExpanded ? undefined : 2);

  return (
    <div
      className={`bg-[#f9f8f8] dark:bg-[#2C2B2B] rounded-3xl dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] overflow-hidden ${
        !isExpanded ? "h-[193px]" : "h-full"
      }`}
    >
      <div className="p-4 relative">
        {/* Title in a single line */}
        <h3 className="font-medium text-center mb-0">{t("keywords.missed")}</h3>

        {/* Right side - only maximize icon */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => (onMaximize ? onMaximize(title) : onToggle(section))}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Maximize"
          >
            <Maximize2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="p-4 overflow-auto">
        {/* Заголовки */}
        <div className="flex justify-between mb-2">
          <span className="font-medium text-sm">
            {t("keywords.column.keywords")}
          </span>
          <span className="font-medium text-sm">
            {t("keywords.column.frequency")}
          </span>
        </div>

        {/* Список ключевых слов с эффектом затухания */}
        <div className="space-y-1 relative">
          {visibleKeywords.map((keyword, index) => (
            <div
              key={index}
              className="flex justify-between items-center transition-opacity duration-300"
              style={{ opacity: getOpacity(index, visibleKeywords.length) }}
            >
              <span className={`text-sm ${textColorClass}`}>
                {keyword.word}
              </span>
              <span className="text-sm text-blue-500">{keyword.frequency}</span>
            </div>
          ))}

          {/* Дополнительный эффект затухания с градиентом (опционально) */}
          {isExpanded && keywords.length > 2 && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#f9f8f8] dark:from-[#2C2B2B] to-transparent pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
}
