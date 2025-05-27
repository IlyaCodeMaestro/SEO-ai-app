"use client";

import { useLanguage } from "@/components/provider/language-provider";
import { ChevronDown, ChevronUp, Copy, Maximize2 } from "lucide-react";
import Image from "next/image";
import React from "react";


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
      <div className="bg-[#f9f8f8] dark:bg-[#333333] rounded-xl shadow-md overflow-hidden">
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
                  copiedSection === section ? "text-green-500" : ""
                }`}
              />
            </button>

            {/* Заголовок — по центру, в одну строку, обрезается при переполнении */}
            <h3
              className="absolute left-1/2 transform -translate-x-1/2 text-sm font-medium  max-w-[70%] text-center"
              title={title}
            >
              {t("keywords.used")}
            </h3>

            {/* Правая иконка — поделиться */}
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
                className="h-4 w-4"
              />
            </button>
          </div>

          {/* Сетка с ключевыми словами */}
          <div className="grid grid-cols-2 gap-x-4 text-sm">
            <div className="font-medium mb-2">
              {t("keywords.column.keywords")}
            </div>
            <div className="font-medium mb-2 text-right">
              {t("keywords.column.frequency")}
            </div>

            {keywords
              .slice(0, isExpanded ? undefined : 3)
              .map((keyword, index) => (
                <React.Fragment key={index}>
                  <div
                    className={`text-sm py-2 border-t border-gray-100 ${textColorClass}`}
                  >
                    {keyword.word}
                  </div>
                  <div className="text-sm py-2 border-t border-gray-100 text-right">
                    {formatFrequency(keyword.frequency)}
                  </div>
                </React.Fragment>
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
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f8f8] dark:bg-[#333333] rounded-[20px] shadow-md overflow-hidden h-[225px]">
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b dark:border-gray-700 relative">
        {/* Левая часть — только копирование */}
        <div className="flex items-center space-x-2 mb-2 sm:mb-0 z-10">
          <button
            onClick={() => onCopy(getContentForCopy(), section)}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={t("common.copy")}
          >
            <Copy
              className={`h-5 w-5 ${
                copiedSection === section ? "text-green-500" : "text-blue-500"
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
              className="h-6 w-6"
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
        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
          <span className="font-medium">{t("keywords.column.keywords")}</span>
          <span className="font-medium text-right">
            {t("keywords.column.frequency")}
          </span>
        </div>
        {keywords.slice(0, isExpanded ? undefined : 2).map((keyword, index) => (
          <div
            key={index}
            className="grid grid-cols-2 gap-2 text-sm py-1 border-b border-gray-100 dark:border-gray-700"
          >
            <span className={`${textColorClass} truncate`}>{keyword.word}</span>
            <span className="text-right">
              {formatFrequency(keyword.frequency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
