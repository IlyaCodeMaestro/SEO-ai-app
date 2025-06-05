"use client";

import { useLanguage } from "@/components/provider/language-provider";
import { ChevronDown, ChevronUp, Maximize2 } from "lucide-react";

interface KeywordsTableProps {
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

export function IrrelevantKeywordsTable({
  title,
  keywords,
  section,
  isExpanded,
  onToggle,
  textColorClass = "",
  isMobile,
  onMaximize,
}: KeywordsTableProps) {
  const { t } = useLanguage();

  const getContentForCopy = () => {
    return keywords.map((k) => `${k.word}: ${k.frequency}`).join("\n");
  };

  if (isMobile) {
    return (
      <div className="bg-[#f9f8f8] dark:bg-[#2C2B2B] rounded-3xl dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-center w-full mb-3">
            <h3 className="font-medium text-md text-center">
              {t("keywords.irrelevant")}
            </h3>
          </div>

          {/* Заголовки */}
          <div className="flex justify-between mb-2">
            <div className="font-medium text-sm">
              {t("keywords.column.irrelevant")}
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
                  <span className="text-sm text-blue-500">{keyword.word}</span>
                  <span className="text-sm text-blue-500">
                    {keyword.frequency}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Warning Messages */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-3">
            <div className="flex gap-2">
              <div className="text-red-500 font-bold text-lg flex-shrink-0 leading-none ">
                !
              </div>
              <p className="text-xs text-black dark:text-white leading-relaxed text-left">
                {t("keywords.warning.categories")}
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-red-500 font-bold text-lg flex-shrink-0 leading-none">
                !
              </span>
              <p className="text-xs text-black dark:text-white leading-relaxed text-left">
                {t("keywords.warning.budget")}
              </p>
            </div>
          </div>
        )}

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
    <div className="bg-[#f9f8f8] dark:bg-[#2C2B2B] dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden">
      <div className="flex flex-col items-center p-4 relative">
        <h3 className="font-medium mb-2 text-center">
          {t("keywords.irrelevant")}
        </h3>
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
      <div className="p-4">
        {/* Заголовки */}
        <div className="flex justify-between mb-2">
          <span className="font-medium text-sm">
            {t("keywords.column.irrelevant")}
          </span>
          <span className="font-medium text-sm">
            {t("keywords.column.frequency")}
          </span>
        </div>

        {/* Список ключевых слов без разделителей */}
        <div className="space-y-1">
          {keywords
            .slice(0, isExpanded ? undefined : 10)
            .map((keyword, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-blue-500 truncate">
                  {keyword.word}
                </span>
                <span className="text-sm text-blue-500">
                  {keyword.frequency}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Warning Messages */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="flex gap-3">
            <span className="text-red-500 font-bold text-xl flex-shrink-0 leading-none">
              !
            </span>
            <p className="text-sm text-black dark:text-white leading-relaxed text-left">
              {t("keywords.warning.categories")}
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-red-500 font-bold text-xl flex-shrink-0 leading-none">
              !
            </span>
            <p className="text-sm text-black dark:text-white leading-relaxed text-left">
              {t("keywords.warning.budget")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
