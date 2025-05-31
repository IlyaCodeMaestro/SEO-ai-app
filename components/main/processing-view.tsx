"use client";

import { X, ArrowLeft } from "lucide-react";
import { useProcessingContext } from "./processing-provider";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useGetProcessListQuery } from "@/store/services/main";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../provider/language-provider";
import { useEffect, useState } from "react";

interface ProcessingViewProps {
  onClose: () => void;
}

export function ProcessingView({ onClose }: ProcessingViewProps) {
  const {
    data: apiProcessData,
    isLoading,
    error,
    refetch: refetchProcessList,
  } = useGetProcessListQuery(undefined, {
    pollingInterval: 5000, // Poll every 5 seconds
  });
  const { processingItems: contextProcessingItems } = useProcessingContext();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { t } = useLanguage();

  // State to store combined and deduplicated items
  const [displayItems, setDisplayItems] = useState<any[]>([]);

  // Combine and deduplicate items from API and context
  useEffect(() => {
    const combinedItems: any[] = [];
    const processedIds = new Set<number>();

    // First add items from context (these are the most up-to-date)
    if (contextProcessingItems && contextProcessingItems.length > 0) {
      contextProcessingItems.forEach((item) => {
        if (item.cardId && !processedIds.has(item.cardId)) {
          combinedItems.push({
            ...item.cardData,
            id: item.cardId,
            type_id: item.type === "analysis" ? 2 : 1,
            // Add any other necessary fields
          });
          processedIds.add(item.cardId);
        }
      });
    }

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
  }, [apiProcessData, contextProcessingItems]);

  // Check if there are any items to display
  const hasNoItems = displayItems.length === 0;

  // Function to get the type text based on the type
  const getTypeText = (type: string | number) => {
    if (typeof type === "string") {
      if (type === "both") {
        return "Анализ и описание";
      }
      return type === "analysis"
        ? t("processing.analysis")
        : t("processing.description");
    } else {
      // For numeric type_id values
      if (type === 3) {
        return "Анализ и описание";
      }
      return type === 1
        ? t("processing.description")
        : type === 2
        ? t("processing.analysis")
        : "Неизвестный тип";
    }
  };

  return (
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
                    className="bg-white rounded-xl p-4 shadow-sm border mb-4 dark:bg-[#333333] "
                  >
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-md mr-3 overflow-hidden">
                        {card.images && card.images.length > 0 ? (
                          <img
                            src={`https://upload.seo-ai.kz/test/images/${card.images[0].image}`}
                            alt="Product"
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{card.name}</p>
                        <p className="text-sm text-gray-500">
                          SKU: {card.article}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-blue-600">
                          {getTypeText(card.type_id)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
