"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Info, X, ChevronDown, ChevronUp } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useLanguage } from "../provider/language-provider";

import { Button } from "@/components/ui/button";
import { useGetBalanceHistoryQuery } from "@/store/services/main";

interface BalanceHistoryPanelProps {
  onClose: () => void;
}

export function BalanceHistoryPanel({ onClose }: BalanceHistoryPanelProps) {
  const { t } = useLanguage();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [currentPage, setCurrentPage] = useState(1);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [hasMoreContent, setHasMoreContent] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadedPages, setLoadedPages] = useState(1);

  // Fetch balance history data
  const {
    data: balanceHistory,
    isLoading,
    error,
  } = useGetBalanceHistoryQuery(currentPage);

  // Update allEvents when new data is loaded
  useEffect(() => {
    if (balanceHistory?.date_events) {
      if (currentPage === 1) {
        setAllEvents(balanceHistory.date_events);
        setLoadedPages(1);
      } else {
        // Append new events to existing ones
        setAllEvents((prev) => [...prev, ...balanceHistory.date_events]);
        setLoadedPages(currentPage);
      }

      // Check if there's more content to load
      setHasMoreContent(balanceHistory.date_events.length > 0);
      setIsLoadingMore(false);
    }
  }, [balanceHistory, currentPage]);

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

  // Handle load more
  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setCurrentPage((prev) => prev + 1);
  };

  // Handle collapse back to first page
  const handleCollapse = () => {
    setIsLoadingMore(true);
    // Keep only the first page of data
    setTimeout(() => {
      if (balanceHistory?.date_events) {
        setAllEvents(allEvents.slice(0, balanceHistory.date_events.length));
      }
      setCurrentPage(1);
      setLoadedPages(1);
      setHasMoreContent(true);
      setIsLoadingMore(false);
      // Scroll to top
      const panel = document.querySelector(".balance-history-panel");
      if (panel) {
        panel.scrollTop = 0;
      }
    }, 300);
  };

  return (
    <div className="h-full flex flex-col bg-white px-4 max-w-2xl mx-auto dark:bg-[#404040] balance-history-panel">
      {/* Header */}
      <div className="flex items-center">
        {isMobile ? (
          <>
            <button
              onClick={onClose}
              className="p-1 mt-3"
              aria-label={t("common.back")}
            >
              <ArrowLeft className="h-6 w-6 mb-4 dark:text-blue-600" />
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
              <X className="h-5 w-5 dark:text-blue-600" />
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-col gap-6 w-full md:max-w-md md:mx-auto">
        {/* Balance statement title */}
        <button className="w-full border border-white dark:border-none bg-blue-600 text-white py-5 rounded-[25px] text-xl font-medium shadow-md">
          {t("cabinet.balance.statement")}
        </button>

        {/* Balance statement content */}
        <div className="bg-gray-50 rounded-[25px] p-6 border shadow-md min-h-[500px] flex flex-col justify-between dark:border-none dark:bg-[#2C2B2B]">
          {/* Transaction list */}
          <div className="flex-grow overflow-y-auto">
            {isLoading && currentPage === 1 && (
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
                  {t("error.loading.balance.history")}
                </p>
              </div>
            )}

            {!isLoading && !error && allEvents.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <div className="bg-gray-500 rounded-full p-3 mb-4">
                  <Info className="h-6 w-6 text-white" />
                </div>
                <p className="text-xl font-bold dark:text-white">
                  {t("empty.balance.statement")}
                </p>
              </div>
            )}

            {!error &&
              allEvents.map((dateEvent, dateIndex) => (
                <div
                  key={`date-${dateEvent.id}-${dateIndex}`}
                  className="mb-6 last:mb-0"
                >
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    {formatDate(dateEvent.date)}
                  </h3>

                  {dateEvent.events.map((event: any, eventIndex) => (
                    <div
                      key={`event-${event.id}-${dateIndex}-${eventIndex}`}
                      className="mb-3 last:mb-0"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-xs text-gray-500">{event.time}</p>
                        </div>
                        <span
                          style={{ color: event.text_color }}
                          className="font-medium"
                        >
                          {event.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </div>

          {/* Load more button or collapse button */}
          {!isLoading && !error && allEvents.length > 0 && (
            <div className="flex justify-center items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              {loadedPages > 1 && !hasMoreContent ? (
                <Button
                  onClick={handleCollapse}
                  disabled={isLoadingMore}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  {isLoadingMore ? (
                    <div className="h-5 w-5 border-2 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
                  ) : (
                    <ChevronUp className="h-6 w-6 text-gray-600" />
                  )}
                </Button>
              ) : hasMoreContent ? (
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  {isLoadingMore ? (
                    <div className="h-5 w-5 border-2 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
                  ) : (
                    <ChevronDown className="h-6 w-6 text-blue-600" />
                  )}
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
