"use client";

import type React from "react";

import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Inbox, Copy, Check } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useGetArchiveQuery } from "@/store/services/main";
import { Button } from "@/components/ui/button";
import  {useProcessingContext}  from "../main/processing-provider";
import { useLanguage } from "../provider/language-provider";

interface ArchiveViewProps {
  onSelectItem: (item: any) => void;
  selectedItemId: number | null;
}

function isMobileDevice() {
  if (typeof window !== "undefined") {
    return window.innerWidth < 768; // Common breakpoint for mobile devices
  }
  return false;
}

export function ArchiveView({
  onSelectItem,
  selectedItemId,
}: ArchiveViewProps) {
  const { t } = useLanguage();
  const { processedCardIds, clearProcessedCardIds } = useProcessingContext();
  const {
    data: archiveData,
    isLoading,
    error,
    refetch,
  } = useGetArchiveQuery(1, {
    pollingInterval: 10000, // Poll every 10 seconds
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [copiedCardId, setCopiedCardId] = useState<number | null>(null);

  console.log("Processed card IDs:", processedCardIds);

  // Filter archive data to only show items that have been processed by the user
  const filteredArchiveData = archiveData && {
    ...archiveData,
    card_dates: archiveData.card_dates
      .map((dateGroup) => ({
        ...dateGroup,
        cards: dateGroup.cards.filter((card) =>
          processedCardIds.includes(card.id)
        ),
      }))
      .filter((dateGroup) => dateGroup.cards.length > 0),
  };

  // Функция для безопасной проверки пустого архива
  const isArchiveEmpty = () => {
    return (
      !filteredArchiveData ||
      !filteredArchiveData.card_dates ||
      filteredArchiveData.card_dates.length === 0 ||
      processedCardIds.length === 0
    );
  };

  const scrollToTop = () => {
    if (!isMobileDevice()) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const getItemStatus = (item: any) => {
    if (item.type_id === 3) return t("archive.both.done");
    if (item.type_id === 2) return t("archive.analysis.done");
    return t("archive.description.done");
  };

  const getItemType = (item: any): "analysis" | "description" | "both" => {
    if (item.type_id === 3) return "both";
    if (item.type_id === 2) return "analysis";
    return "description";
  };

  const handleItemClick = (item: any) => {
    // Format the item for the parent component
    const formattedItem = {
      ...item,
      id: item.id,
      type: getItemType(item),
      status: "completed",
      timestamp: Date.now(),
      competitorSku: "",
    };

    // Pass the selected item to the parent component
    onSelectItem(formattedItem);
    scrollToTop();
  };

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollContainerRef.current;
      setCanScrollUp(scrollTop > 0);
      setCanScrollDown(scrollTop + clientHeight < scrollHeight);
      setShowScrollButtons(scrollHeight > clientHeight);
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener("resize", checkScrollability);
    return () => window.removeEventListener("resize", checkScrollability);
  }, [filteredArchiveData]);

  const handleScroll = () => {
    checkScrollability();
  };

  const formatStatusText = (text: string) => {
    return text.split("\n").map((line, i) => (
      <span key={i} className="block">
        {line}
      </span>
    ));
  };

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

  // Функция для определения стиля элемента в зависимости от его состояния
  const getItemStyle = (itemId: number) => {
    // Базовые классы, которые всегда применяются
    const baseClasses =
      "bg-white dark:bg-[#333333] rounded-2xl p-4 shadow-md flex items-start cursor-pointer mb-4 relative transition-all duration-200";

    // Только для десктопа (md:)
    if (selectedItemId === itemId) {
      // Если элемент выбран - синяя граница всегда видна
      return `${baseClasses} md:border-2 md:border-blue-600`;
    } else {
      // Если элемент не выбран - прозрачная граница по умолчанию, синяя при наведении
      return `${baseClasses} md:border-2 md:border-transparent md:hover:border-blue-600`;
    }
  };

  // Format date from API (YYYY-MM-DD) to readable format
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "d MMMM", { locale: ru });
    } catch (e) {
      return dateString;
    }
  };

  const handleCopySku = (e: React.MouseEvent, cardId: number, sku: string) => {
    e.stopPropagation(); // Prevent triggering the card click
    navigator.clipboard
      .writeText(sku)
      .then(() => {
        setCopiedCardId(cardId);
        setTimeout(() => setCopiedCardId(null), 2000); // Reset after 2 seconds
      })
      .catch((err) => {
        console.error("Failed to copy SKU:", err);
      });
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="py-4">
          <h2 className="text-blue-600 font-medium text-center text-xl">
            {t("archive.title")}
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p>{t("archive.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col">
        <div className="py-4">
          <h2 className="text-blue-600 font-medium text-center text-xl">
            {t("archive.title")}
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center flex-col">
          <p className="text-red-500">{t("archive.error")}</p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            {t("archive.try.again")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="py-4 flex justify-between items-center px-4">
        <h2 className="text-blue-600 font-medium text-center text-xl flex-1">
          {t("archive.title")}
        </h2>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto px-4"
        onScroll={handleScroll}
      >
        {isArchiveEmpty() ? (
          <div className="text-center py-8 text-[#161616] dark:text-white flex flex-col items-center justify-center">
            <Inbox className="w-12 h-12 text-gray-400 mb-3" />
            <p className="font-medium text-base dark:text-white">
              {t("archive.empty")}
            </p>
          </div>
        ) : (
          <div>
            {filteredArchiveData.card_dates.map((dateGroup) => (
              <div key={dateGroup.id} className="mb-6">
                <h3 className="text-[#333333] dark:text-white font-medium mb-4 text-lg md:text-lg sm:text-base">
                  {formatDate(dateGroup.date)}
                </h3>

                {dateGroup.cards.map((card) => (
                  <div
                    key={card.id}
                    className={getItemStyle(card.id)}
                    onClick={() => handleItemClick(card)}
                  >
                    <div className="w-16 h-16 rounded-md mr-4 overflow-hidden flex-shrink-0">
                      {card.images && card.images.length > 0 ? (
                        <img
                          src={`https://upload.seo-ai.kz/test/images/${card.images[0].image}`}
                          alt={card.name}
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
                        <p className="text-blue-600 md:text-base sm:text-md text-md">
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
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-blue-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-blue-600 text-right mt-3 md:text-md sm:text-md text-md font-normal ml-2 md:w-28 sm:w-24 w-24">
                      {formatStatusText(getItemStatus(card))}
                    </div>

                    {card.badge_visible && (
                      <div className="absolute right-1 top-1 w-6 h-6 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
