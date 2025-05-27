"use client";

import { useLanguage } from "@/components/provider/language-provider";
import { ChevronDown, ChevronUp, Maximize2 } from "lucide-react";
import React from "react";


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

  if (isMobile) {
    return (
      <div className="bg-[#f9f8f8] dark:bg-[#333333] rounded-xl shadow-md overflow-hidden">
        <div className="p-4">
          {/* Simplified header with just the title */}
          <div className="flex items-center justify-center mb-3">
            <h3 className="text-sm font-medium text-center" title={title}>
              {t("keywords.missed")}
            </h3>
          </div>

          {/* Sетка с ключевыми словами */}
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
                    {keyword.frequency}
                  </div>
                </React.Fragment>
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
    <div
      className={`bg-[#f9f8f8] dark:bg-[#333333] rounded-[20px] shadow-md overflow-hidden ${
        !isExpanded ? "h-[202px]" : "h-full"
      }`}
    >
      <div className="p-4 border-b dark:border-gray-700 relative">
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
            <span className="text-right">{keyword.frequency}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
