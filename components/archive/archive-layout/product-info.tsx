"use client";

import { useLanguage } from "@/components/provider/language-provider";
import { Copy } from "lucide-react";
import { useState } from "react";


interface ProductInfoProps {
  item: {
    id: string;
    sku: string;
    name: string;
    type: "analysis" | "description" | "both";
    image?: string;
  };
  isMobile: boolean;
}

export function ProductInfo({ item, isMobile }: ProductInfoProps) {
  const { t } = useLanguage();
  // Add a state to track if the SKU was copied
  // Add this right at the beginning of the ProductInfo component body
  const [copied, setCopied] = useState(false);

  // Функция для определения статуса элемента
  const getItemStatus = (item: any) => {
    if (item.type === "both") {
      return t("product.status.both");
    } else if (item.type === "analysis") {
      return t("product.status.analysis");
    } else {
      return t("product.status.description");
    }
  };

  // Функция для разделения статуса на строки
  const formatStatusText = (status: string) => {
    const words = status.split(" ");
    if (words.length <= 1) return status;

    // Разделяем текст на две части: последнее слово и все остальные
    const lastWord = words[words.length - 1];
    const firstPart = words.slice(0, words.length - 1).join(" ");

    return (
      <>
        {firstPart}
        <br />
        {lastWord}
      </>
    );
  };

  // Add a function to copy text to clipboard inside the ProductInfo component
  // Add this right after the formatStatusText function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isMobile) {
    return (
      <div className="bg-white dark:bg-[#2C2B2B] dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-3xl p-4  mb-4">
        <div className="flex">
          <div className="w-16 h-16 bg-gray-200 rounded-lg mr-3 overflow-hidden flex-shrink-0">
            {item.image ? (
              <img
                src={`https://upload.seo-ai.kz/test/images/${item.image}`}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={`/placeholder.svg?height=48&width=48&query=product`}
                alt="Product"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm leading-tight">{item.name}</p>
            <div className="flex items-center mt-1">
              <p className="text-sm text-blue-600">{item.sku}</p>
              <button
                onClick={() => copyToClipboard(item.sku)}
                className="ml-1 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={t("common.copy")}
              >
                <Copy
                  size={14}
                  className={copied ? "text-green-500" : "text-blue-600"}
                />
              </button>
            </div>
          </div>
          <div className="ml-2 flex-shrink-0">
            <div className="text-xs text-blue-600 whitespace-nowrap">
              {formatStatusText(getItemStatus(item))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#2C2B2B] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-3xl p-4 w-full sm:w-auto sm:max-w-[550px] sm:ml-0 md:ml-28  mb-6 flex flex-col sm:flex-row items-center">
      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 sm:mb-0 sm:mr-3 overflow-hidden">
        {item.image ? (
          <img
            src={`https://upload.seo-ai.kz/test/images/${item.image}`}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={`/placeholder.svg?height=40&width=40&query=product`}
            alt="Product"
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="flex-1 overflow-hidden text-center sm:text-left">
        <p className="font-medium truncate">{item.name}</p>
        <div className="flex items-center justify-center sm:justify-start">
          <p className="text-md text-blue-600 ">{item.sku}</p>
          <button
            onClick={() => copyToClipboard(item.sku)}
            className="ml-1 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={t("common.copy")}
          >
            <Copy
              size={14}
              className={copied ? "text-green-500" : "text-blue-600 "}
            />
          </button>
        </div>
      </div>
      <div className="flex items-center mt-3 sm:mt-0 sm:ml-4">
        <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full text-center">
          {formatStatusText(getItemStatus(item))}
        </div>
      </div>
    </div>
  );
}
