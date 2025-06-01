"use client";

import { useLanguage } from "@/components/provider/language-provider";
import { ChevronDown, ChevronUp, Copy, Maximize2 } from "lucide-react";
import Image from "next/image";

interface KeywordsTableProps {
  title: string;
  keywords: { word: string; frequency: string | number; type?: number }[];
  section: string;
  isExpanded: boolean;
  onToggle: (section: string) => void;
  onCopy: (content: string, section: string) => void;
  onShare: (
    keywords: { word: string; frequency: string | number; type?: number }[],
    title: string
  ) => void;
  copiedSection: string | null;
  textColorClass?: string;
  isMobile: boolean;
  onMaximize?: (title: string) => void;
}

export function KeywordsTable({
  title,
  keywords,
  section,
  isExpanded,
  onToggle,
  onCopy,
  onShare,
  copiedSection,
  textColorClass = "",
  isMobile,
  onMaximize,
}: KeywordsTableProps) {
  const { t } = useLanguage();

  const getContentForCopy = () => {
    return keywords
      .map(
        (k) =>
          `${k.word}: ${
            typeof k.frequency === "number"
              ? k.frequency.toString()
              : k.frequency
          }`
      )
      .join("\n");
  };

  // Format frequency for display
  const formatFrequency = (frequency: string | number) => {
    if (typeof frequency === "number") {
      return new Intl.NumberFormat().format(frequency);
    }
    return frequency;
  };

  if (isMobile) {
    return (
      <div className="bg-[#f9f8f8] dark:bg-[#2C2B2B] rounded-3xl dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] overflow-hidden">
        <div className="p-4">
          {/* Верхняя строка: иконка - заголовок - иконка */}
          <div className="relative flex items-center justify-between mb-3">
            {/* Левая иконка копирования */}
            <button
              className="text-blue-600 z-10"
              onClick={() =>
                onCopy(keywords.map((k) => k.word).join(", "), section)
              }
              aria-label={t("common.copy")}
            >
              <Copy
                className={`h-4 w-4 ${
                  copiedSection === section ? "text-blue-900" : "text-blue-600"
                }`}
              />
            </button>

            {/* Заголовок — по центру, в одну строку, обрезается при переполнении */}
            <h3
              className="absolute left-1/2 transform -translate-x-1/2 text-sm font-medium max-w-[70%] text-center"
              title={title}
            >
              {t("keywords.used")}
            </h3>

            {/* Правая иконка — поделиться */}
            <button
              className="text-blue-600 z-10"
              onClick={() => onShare(keywords, title)}
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

          {/* Заголовки */}
          <div className="flex justify-between mb-2">
            <div className="font-medium text-sm">
              {t("keywords.column.keywords")}
            </div>
            <div className="font-medium text-sm">
              {t("keywords.column.frequency")}
            </div>
          </div>

          {/* Список ключевых слов без разделителей */}
          <div className="space-y-1">
            {keywords
              .slice(0, isExpanded ? undefined : 3)
              .map((keyword, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className={`text-sm ${textColorClass}`}>
                    {keyword.word}
                  </span>
                  <span className="text-sm">
                    {formatFrequency(keyword.frequency)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Иконка расширения / сворачивания */}
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

  return (
    <div className="bg-[#f9f8f8] dark:bg-[#2C2B2B] rounded-3xl dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] overflow-hidden h-[225px]">
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 relative">
        {/* Левая часть — только копирование */}
        <div className="flex items-center space-x-2 mb-2 sm:mb-0 z-10">
          <button
            onClick={() => onCopy(getContentForCopy(), section)}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={t("common.copy")}
          >
            <Copy
              className={`h-5 w-5 ${
                copiedSection === section ? "text-blue-900" : "text-blue-500"
              }`}
            />
          </button>
        </div>

        {/* Центр — заголовок, абсолютно по центру на десктопе, обычный на мобильном */}
        <h3 className="font-medium text-center leading-tight mb-2 sm:mb-0 sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2">
          {t("keywords.used")}
        </h3>

        {/* Правая часть — поделиться + расширение */}
        <div className="flex items-center space-x-2 z-10">
          {/* Правая иконка */}
          <button
            className="text-blue-600 z-10"
            onClick={() => onShare(keywords, title)}
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

        {/* Список ключевых слов без разделителей */}
        <div className="space-y-1">
          {keywords
            .slice(0, isExpanded ? undefined : 3)
            .map((keyword, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className={`text-sm ${textColorClass} truncate`}>
                  {keyword.word}
                </span>
                <span className="text-sm">
                  {formatFrequency(keyword.frequency)}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
