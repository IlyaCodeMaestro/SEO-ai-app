"use client";

import type React from "react";

import { X, ArrowLeft, Copy } from "lucide-react";
import { useProcessingContext } from "./processing-provider";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  useGetArchiveQuery,
  useGetProcessListQuery,
} from "@/store/services/main";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../provider/language-provider";
import { useEffect, useRef, useState } from "react";
import { notification } from "antd"; // Добавляем импорт notification

interface ProcessingViewProps {
  onClose: () => void;
}

export function ProcessingView({ onClose }: ProcessingViewProps) {
  const {
    processingItems: contextProcessingItems,
    hasNotifications,
    setHasNotifications,
    processingItems,
  } = useProcessingContext();

  const {
    data: apiProcessData,
    isLoading,
    error,
    refetch: refetchProcessList,
  } = useGetProcessListQuery(undefined, {
    pollingInterval: 5000, // Poll every 5 seconds
  });

  const { data: archiveData, refetch: refetchArchive } = useGetArchiveQuery(1, {
    pollingInterval: 5000, // Poll every 5 seconds
  });

  const processingItemsRef = useRef(processingItems);

  useEffect(() => {
    if (!archiveData || !archiveData.card_dates) return;

    const currentProcessingItems = [...processingItemsRef.current];

    // Go through each card in the archive
    archiveData.card_dates.forEach((dateGroup) => {
      dateGroup.cards.forEach((card) => {
        const processingItem = currentProcessingItems.find(
          (item) => item.cardId === card.id
        );

        if (processingItem) {
          // Log the complete processing item to see all properties
          console.log(
            "Processing item:",
            JSON.stringify(processingItem, null, 2)
          );

          let isCompleted = false;

          // Check various status properties that might indicate completion
          if (card.status_id === 3 || card.status_id === 4) {
            isCompleted = true;
          } else if (
            card.status === "выполнен" ||
            card.status === "завершен" ||
            card.status === "завершен успешно"
          ) {
            isCompleted = true;
          } else if (
            processingItem.type === "description" &&
            card.type_id === 1
          ) {
            isCompleted = true;
          }

          if (isCompleted) {
          }
        }
      });
    });
  }, [archiveData]);

  console.log("123", apiProcessData);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { t } = useLanguage();
  const [copiedCardId, setCopiedCardId] = useState<number | null>(null);
  const [api, contextHolder] = notification.useNotification(); // Добавляем хук для уведомлений
  const { hasNewItems, clearNewItems } = useProcessingContext();

  // State to store combined and deduplicated items
  const [displayItems, setDisplayItems] = useState<any[]>([]);

  console.log("asd", displayItems);

  // Combine and deduplicate items from API and context
  useEffect(() => {
    const combinedItems: any[] = [];
    const processedIds = new Set<number>();

    // First add items from context (these are the most up-to-date)
    // if (apiProcessData && apiProcessData?.card_dates.length > 0) {
    //   console.log("546", apiProcessData);
    //   apiProcessData.card_dates.forEach((item) => {
    //     if (item.cardId && !processedIds.has(item.cardId)) {
    //       combinedItems.push({
    //         ...item.cardData,
    //         id: item.cardId,
    //         type:
    //           item.type === "analysis"
    //             ? "Анализ"
    //             : item.type === "description"
    //             ? "Описание"
    //             : "Анализ и описание",
    //         type_id:
    //           item.type === "analysis"
    //             ? 2
    //             : item.type === "description"
    //             ? 1
    //             : 3,
    //         status: "в обработке",
    //         status_color: "#000000",
    //         // Add any other necessary fields
    //       });
    //       processedIds.add(item.cardId);
    //     }
    //   });
    // }

    // Then add items from API that aren't already added
    if (apiProcessData && apiProcessData.card_dates) {
      apiProcessData.card_dates.forEach((dateGroup) => {
        if (dateGroup.cards) {
          dateGroup.cards.forEach((card) => {
            if (!processedIds.has(card.id)) {
              combinedItems.push(card);
              processedIds.add(card.id);
            }
          });
        }
      });
    }

    setDisplayItems(combinedItems);
  }, [apiProcessData]);

  // Check if there are any items to display
  const hasNoItems = displayItems.length === 0;

  // Функция для разделения текста на две строки
  const formatProductName = (name: string) => {
    const words = name.split(" ");
    const midpoint = Math.ceil(words.length / 2);

    const firstLine = words.slice(0, midpoint).join(" ");
    const secondLine = words.slice(midpoint).join(" ");

    return (
      <>
        <span className="block">{firstLine}</span>
        {secondLine && <span className="block">{secondLine}</span>}
      </>
    );
  };

  // Обновленная функция копирования с уведомлениями
  const handleCopySku = (e: React.MouseEvent, cardId: number, sku: string) => {
    e.stopPropagation(); // Prevent triggering the card click
    navigator.clipboard
      .writeText(sku)
      .then(() => {
        setCopiedCardId(cardId);

        // Показываем уведомление об успешном копировании
        api.success({
          message: t("common.copied") || "Скопировано",
          description:
            t("common.copied_success") ||
            "Текст успешно скопирован в буфер обмена",
          placement: "bottomRight",
          duration: 2,
          style: {
            backgroundColor: "#f6ffed",
            border: "1px solid #b7eb8f",
          },
        });

        setTimeout(() => setCopiedCardId(null), 2000); // Reset after 2 seconds
      })
      .catch((err) => {
        console.error("Failed to copy SKU:", err);

        // Показываем уведомление об ошибке
        api.error({
          message: "Ошибка",
          description: "Не удалось скопировать текст",
          placement: "bottomRight",
          duration: 3,
        });
      });
  };

  return (
    <>
      {contextHolder}{" "}
      {/* Добавляем contextHolder для отображения уведомлений */}
      <div className="h-full flex flex-col dark:bg-[#404040]">
        {/* Заголовок с кнопкой закрытия */}
        <div className="p-6">
          <div className="flex items-center justify-between relative">
            {isMobile && (
              <button
                onClick={onClose}
                className="absolute left-0"
                aria-label={t("common.back")}
              >
                <ArrowLeft className="h-5 w-5 dark:text-blue-600" />
              </button>
            )}

            <h2 className="text-lg font-medium w-full text-center dark:text-blue-600">
              {t("processing.title")}
            </h2>

            {!isMobile && (
              <button
                onClick={onClose}
                className="absolute right-0"
                aria-label={t("common.close")}
              >
                <X className="h-5 w-5 dark:text-blue-600" />
              </button>
            )}
          </div>
        </div>

        {/* Содержимое */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <p>{t("processing.loading")}</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{t("processing.error")}</p>
              <Button
                onClick={() => refetchProcessList()}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                {t("processing.try.again")}
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4 font-medium text-gray-800 dark:text-white">
                {t("processing.today")}
              </div>

              {hasNoItems ? (
                <div className="text-center py-8 text-gray-500">
                  {t("processing.empty")}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Display combined items */}
                  {displayItems.map((card) => (
                    <div
                      key={card.id}
                      className="bg-white dark:bg-[#2C2B2B] dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-3xl p-4 flex items-start mb-4 relative"
                    >
                      <div className="w-16 h-16 bg-gray-200 rounded-md mr-4 overflow-hidden flex-shrink-0">
                        {card.images && card.images.length > 0 ? (
                          <img
                            src={`https://upload.seo-ai.kz/test/images/${card.images[0].image}`}
                            alt="Product"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={`/placeholder.svg?height=64&width=64&query=product`}
                            alt="Product"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="font-normal md:text-md sm:text-md text-md text-black dark:text-white leading-tight mb-2">
                          {formatProductName(card.name)}
                        </div>
                        <div className="flex items-center mt-1">
                          <p
                            className="text-blue-600 md:text-base sm:text-md text-md cursor-pointer hover:underline"
                            onClick={(e) =>
                              handleCopySku(e, card.id, card.article)
                            }
                          >
                            {card.article}
                          </p>
                          <button
                            onClick={(e) =>
                              handleCopySku(e, card.id, card.article)
                            }
                            className="ml-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            aria-label={t("common.copy")}
                          >
                            {copiedCardId === card.id ? (
                              <Copy className="h-4 w-4 text-blue-900" />
                            ) : (
                              <Copy className="h-4 w-4 text-blue-600" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div
                        className="text-right mt-3 md:text-md sm:text-md text-md font-normal ml-2 md:w-28 sm:w-24 w-24"
                        style={{ color: card.status_color }}
                      >
                        {card.type}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
