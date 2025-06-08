"use client";

import { useLanguage } from "@/components/provider/language-provider";
import { Copy } from "lucide-react";
import { useState } from "react";
import { notification } from "antd";

interface ProductInfoProps {
  item: {
    id: string;
    sku: string;
    name: string;
    type: "analysis" | "description" | "both"; // Это внутреннее представление типа
    typeText?: string; // Добавляем поле для текста типа из API (например, "Анализ")
    image?: string;
    status?: string;
    status_color?: string;
  };
  isMobile: boolean;
}

export function ProductInfo({ item, isMobile }: ProductInfoProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  
  const getItemType = (item: any): "analysis" | "description" | "both" => {
    if (item.type_id === 3) return "both";
    if (item.type_id === 2) return "analysis";
    return "description";
  };

  const getItemStatus = (item: any): string => {
    const type = getItemType(item);
    const status = item.status_id === 3 ? "completed" : "failed";
    return `${type} ${status}`;
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

  // Функция для копирования в буфер обмена
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);

    // Показываем уведомление
    api.success({
      message: t("common.copied") || "Скопировано",
      description:
        t("common.copied_success") || "Текст успешно скопирован в буфер обмена",
      placement: "bottomRight",
      duration: 2,
      style: {
        backgroundColor: "#f6ffed",
        border: "1px solid #b7eb8f",
      },
    });

    setTimeout(() => setCopied(false), 2000);
  };

  // Функция для копирования при клике на SKU
  const handleSkuClick = (sku: string) => {
    copyToClipboard(sku);
  };

  // Определяем цвет статуса
  const statusColor = item.status_color || "#3B82F6"; // Используем синий цвет по умолчанию

  if (isMobile) {
    return (
      <>
        {contextHolder}
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
              <p className="font-medium dark:text-gray-200 text-md leading-tight">
                {item.name}
              </p>
              <div className="flex items-center mt-1">
                <p
                  className="text-sm text-blue-600 cursor-pointer hover:underline"
                  onClick={() => handleSkuClick(item.sku)}
                >
                  {item.sku}
                </p>
                <button
                  onClick={() => copyToClipboard(item.sku)}
                  className="ml-1 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label={t("common.copy")}
                >
                  <Copy
                    size={14}
                    className={copied ? "text-blue-900" : "text-blue-600 "}
                  />
                </button>
              </div>
            </div>

            <div
              className="ml-2 max-w-[100px] text-md"
              style={{ color: statusColor }}
            >
              {formatStatusText(getItemStatus(item))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {contextHolder}
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
            <p
              className="text-md text-blue-600 cursor-pointer hover:underline"
              onClick={() => handleSkuClick(item.sku)}
            >
              {item.sku}
            </p>
            <button
              onClick={() => copyToClipboard(item.sku)}
              className="ml-1 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={t("common.copy")}
            >
              <Copy
                size={14}
                className={copied ? "text-blue-900" : "text-blue-600 "}
              />
            </button>
          </div>
        </div>
        <div className="flex items-center mt-3 sm:mt-0 sm:ml-4">
          <div
            className="text-xs px-2 py-1 rounded-full text-center"
            style={{
              color: statusColor,
              backgroundColor: item.status_color
                ? `${statusColor}10`
                : "rgba(59, 130, 246, 0.1)",
            }}
          >
            {formatStatusText(getItemStatus(item))}
          </div>
        </div>
      </div>
    </>
  );
}
