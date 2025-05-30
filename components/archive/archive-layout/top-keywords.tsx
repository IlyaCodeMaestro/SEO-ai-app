"use client";

import { useState } from "react";
import { Maximize2, ChevronUp, ChevronDown, Copy } from "lucide-react";
import { useLanguage } from "@/components/provider/language-provider";

interface TopKeywordsProps {
  section: string;
  isExpanded: boolean;
  onToggle: (section: string) => void;
  isMobile: boolean;
  keywords?: { name: string; sku: string; image?: string }[];
  onMaximize?: (section: string, title: string) => void;
}

export function TopKeywords({
  section,
  isExpanded,
  onToggle,
  isMobile,
  keywords = [],
  onMaximize,
}: TopKeywordsProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (sku: string) => {
    navigator.clipboard.writeText(sku);
    // Не меняем состояние copied, чтобы цвет оставался прежним
  };

  // Функция для определения цвета SKU и иконки копирования
  const getSkuColor = (index: number) => {
    return index === 0 ? "text-green-500" : "text-blue-600";
  };

  if (isMobile) {
    return (
      <div className="bg-[#f9f8f8] dark:bg-[#2C2B2B] dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)]  rounded-3xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] overflow-hidden">
        <div className="p-4">
          <h3 className="font-medium text-sm mb-3 text-center">
            {t("top.keywords.title")}
          </h3>
          <div className="space-y-3">
            {keywords
              .slice(0, isExpanded ? undefined : 1)
              .map((keyword, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-[#333333] dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)]  shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-[16px] p-3 flex items-start"
                >
                  <div className="w-14 h-14 bg-gray-200 rounded-3xl mr-3 overflow-hidden flex-shrink-0">
                    {keyword.image ? (
                      <img
                        src={`https://upload.seo-ai.kz/test/images/${keyword.image}`}
                        alt={keyword.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={`/placeholder.svg?height=56&width=56&query=product`}
                        alt="Product"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-tight mb-2">{keyword.name}</p>
                    <div className="flex items-center">
                      <p className={`text-base ${getSkuColor(index)}`}>
                        {keyword.sku}
                      </p>
                      <button
                        onClick={() => handleCopy(keyword.sku)}
                        className="ml-2"
                        aria-label={t("common.copy")}
                      >
                        <Copy size={16} className={getSkuColor(index)} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className="flex justify-center pb-2">
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={() => onToggle(section)}
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
    <div className="bg-[#f9f8f8] dark:bg-[#2C2B2B] rounded-3xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] overflow-hidden h-[225px]">
      <div className="relative px-4 py-3 flex flex-col sm:flex-row items-center">
        <h3 className="text-center font-medium text-base mx-auto w-max">
          {t("top.keywords.title")}
        </h3>

        <button
          onClick={() =>
            onMaximize && onMaximize("topKeywords", t("top.keywords.title"))
          }
          className="p-1 rounded-full hover:bg-gray-100 sm:absolute sm:right-4 sm:top-1/2 sm:-translate-y-1/2"
          aria-label="Развернуть"
        >
          <Maximize2 className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <div className="p-4 overflow-auto">
        <div className="space-y-3">
          {keywords
            .slice(0, isExpanded ? undefined : 1)
            .map((keyword, index) => (
              <div
                key={index}
                className="bg-white dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] dark:bg-[#333333] rounded-3xl p-3 flex flex-col sm:flex-row items-center sm:items-start"
              >
                <div className="w-[60px] h-[60px] bg-gray-200 rounded-3xl mb-3 sm:mb-0 sm:mr-3 overflow-hidden flex-shrink-0">
                  {keyword.image ? (
                    <img
                      src={`https://upload.seo-ai.kz/test/images/${keyword.image}`}
                      alt={keyword.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={`/placeholder.svg?height=60&width=60&query=product`}
                      alt="Product"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <p className="text-base font-medium leading-tight mb-2">
                    {keyword.name}
                  </p>
                  <div className="flex items-center justify-center sm:justify-start">
                    <p className={`text-base ${getSkuColor(index)}`}>
                      {keyword.sku}
                    </p>
                    <button
                      onClick={() => handleCopy(keyword.sku)}
                      className="ml-2"
                      aria-label={t("common.copy")}
                    >
                      <Copy size={16} className={getSkuColor(index)} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
