"use client";

import { useState } from "react";
import { ArrowLeft, Info, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useLanguage } from "../provider/language-provider";

import { Button } from "@/components/ui/button";
import { useGetBonusHistoryQuery } from "@/store/services/main";

interface BonusStatementPanelProps {
  onClose: () => void;
}

export function BonusStatementPanel({ onClose }: BonusStatementPanelProps) {
  const { t } = useLanguage();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch bonus history data
  const {
    data: bonusHistory,
    isLoading,
    error,
  } = useGetBonusHistoryQuery(currentPage);

  // Format date string (YYYY-MM-DD) to a more readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString;
      }

      const day = date.getDate();
      const month = date.toLocaleString("default", { month: "long" });
      const year = date.getFullYear();

      return `${day} ${month} ${year}`;
    } catch (error) {
      return dateString;
    }
  };

  // Get text color based on transaction type
  const getTextColor = (typeId: number) => {
    // Если это пополнение бонусов (type_id = 8), то зеленый цвет
    if (typeId === 8) {
      return "text-green-600";
    }
    // Если это списание бонусов (type_id = 1, 9, 10), то красный цвет
    else if ([1, 9, 10].includes(typeId)) {
      return "text-red-600";
    }
    // По умолчанию черный цвет
    return "text-gray-800 dark:text-white";
  };

  // Format value with sign
  const formatValue = (typeId: number, value: number) => {
    // Если это пополнение бонусов (type_id = 8), то добавляем плюс
    if (typeId === 8) {
      return `+${value}`;
    }
    // Если это списание бонусов (type_id = 1, 9, 10), то добавляем минус
    else if ([1, 9, 10].includes(typeId)) {
      return `-${value}`;
    }
    // По умолчанию просто значение
    return value;
  };

  // Handle pagination
  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white px-4 max-w-2xl mx-auto dark:bg-[#333333]">
      {/* Header */}
      <div className="flex items-center">
        {isMobile ? (
          <>
            <button
              onClick={onClose}
              className="p-1 mt-3"
              aria-label={t("common.back")}
            >
              <ArrowLeft className="h-6 w-6 mb-4" />
            </button>
            <h1 className="text-xl font-medium text-center flex-1 pr-4 mb-4 mt-3 text-blue-600">
              {t("cabinet.title")}
            </h1>
          </>
        ) : (
          <div className="w-full flex justify-end">
            <button
              onClick={onClose}
              className="p-1"
              aria-label={t("common.close")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-col gap-6 w-full md:max-w-md md:mx-auto">
        {/* Bonus statement title */}
        <button className="w-full border border-white bg-blue-600 text-white py-5 rounded-[25px] text-xl font-medium shadow-md">
          {t("cabinet.bonus.statement")}
        </button>

        {/* Bonus statement content */}
        <div className="bg-gray-50 rounded-[25px] p-6 border shadow-md min-h-[500px] flex flex-col justify-between dark:bg-[#404040] dark:border-white">
          {/* Transaction list */}
          <div className="flex-grow">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <p>{t("common.loading")}</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <div className="bg-red-500 rounded-full p-3 mb-4">
                  <Info className="h-6 w-6 text-white" />
                </div>
                <p className="text-xl font-bold">
                  {t("error.loading.bonus.history")}
                </p>
              </div>
            )}

            {!isLoading &&
              !error &&
              bonusHistory?.date_events?.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <div className="bg-gray-500 rounded-full p-3 mb-4">
                    <Info className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-xl font-bold dark:text-white">
                    {t("empty.bonus.statement")}
                  </p>
                </div>
              )}

            {!isLoading &&
              !error &&
              bonusHistory?.date_events?.map((dateEvent) => (
                <div key={dateEvent.id} className="mb-6 last:mb-0">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    {formatDate(dateEvent.date)}
                  </h3>

                  {dateEvent.events.map((event) => (
                    <div key={event.id} className="mb-3 last:mb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {event.title} {event.from_name && event.from_name}
                          </p>
                          <p className="text-xs text-gray-500">{event.time}</p>
                        </div>
                        <span
                          className={`font-medium ${getTextColor(
                            event.type_id
                          )}`}
                        >
                          {formatValue(event.type_id, event.value)}{" "}
                          {t("bonus.points")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </div>

          {/* Pagination */}
          {!isLoading && !error && bonusHistory?.date_events?.length > 0 && (
            <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <Button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                {t("page")} {currentPage}
              </span>
              <Button
                onClick={handleNextPage}
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
