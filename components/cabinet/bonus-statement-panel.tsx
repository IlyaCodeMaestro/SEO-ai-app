"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Info, X, ChevronDown, ChevronUp } from "lucide-react";
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

  // Cursor-based pagination state
  const [cursor, setCursor] = useState<string | null>(null);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [hasMoreContent, setHasMoreContent] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadedBatches, setLoadedBatches] = useState(0);
  const [cursors, setCursors] = useState<string[]>([]); // Store cursors for each batch

  // State for content expansion
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const maxVisibleTransactions = 10;

  // Fetch bonus history data with cursor
  const {
    data: bonusHistory,
    isLoading,
    error,
  } = useGetBonusHistoryQuery({ cursor, limit: 10 });

  // Update allEvents when new data is loaded
  useEffect(() => {
    if (bonusHistory) {
      if (bonusHistory.date_events && bonusHistory.date_events.length > 0) {
        if (cursor === null) {
          // First load - replace all data
          setAllEvents(bonusHistory.date_events);
          setLoadedBatches(1);
          setCursors([]);
        } else {
          // Subsequent loads - append data
          setAllEvents((prev) => [...prev, ...bonusHistory.date_events]);
          setLoadedBatches((prev) => prev + 1);
        }

        // Update cursor for next load
        const lastEvent =
          bonusHistory.date_events[bonusHistory.date_events.length - 1];
        const lastEventInLastDate =
          lastEvent.events[lastEvent.events.length - 1];

        // Use timestamp + id as cursor for uniqueness
        const nextCursor = `${lastEvent.date}_${lastEventInLastDate.id}_${lastEventInLastDate.time}`;

        // Store current cursor for potential rollback
        if (cursor !== null) {
          setCursors((prev) => [...prev, cursor]);
        }

        // Check if there's more content based on response
        setHasMoreContent(
          bonusHistory.has_more || bonusHistory.date_events.length >= 10
        );
      } else {
        setHasMoreContent(false);
      }

      setIsLoadingMore(false);
    }
  }, [bonusHistory, cursor]);

  // Get all transactions flattened
  const getAllTransactions = () => {
    const transactions: Array<{
      dateEvent: any;
      event: any;
      eventIndex: number;
    }> = [];

    allEvents.forEach((dateEvent) => {
      dateEvent.events.forEach((event: any, eventIndex: number) => {
        transactions.push({ dateEvent, event, eventIndex });
      });
    });

    return transactions;
  };

  // Get visible transactions based on expansion state
  const getVisibleTransactions = () => {
    const allTransactions = getAllTransactions();

    if (isContentExpanded) {
      return allTransactions;
    }

    return allTransactions.slice(0, maxVisibleTransactions);
  };

  // Get total number of transactions
  const getTotalTransactionsCount = () => {
    return getAllTransactions().length;
  };

  // Get hidden transactions count
  const getHiddenTransactionsCount = () => {
    const total = getTotalTransactionsCount();
    return Math.max(0, total - maxVisibleTransactions);
  };

  // Group visible transactions by date for display
  const getGroupedVisibleTransactions = () => {
    const visibleTransactions = getVisibleTransactions();
    const grouped: Record<
      string,
      Array<{ event: any; eventIndex: number }>
    > = {};

    visibleTransactions.forEach(({ dateEvent, event, eventIndex }) => {
      if (!grouped[dateEvent.date]) {
        grouped[dateEvent.date] = [];
      }
      grouped[dateEvent.date].push({ event, eventIndex });
    });

    return grouped;
  };

  // Format date string (YYYY-MM-DD) to a more readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
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

  // Format time string to remove seconds (HH:MM:SS -> HH:MM)
  const formatTime = (timeString: string) => {
    try {
      if (timeString && timeString.includes(":")) {
        const timeParts = timeString.split(":");
        if (timeParts.length >= 2) {
          return `${timeParts[0]}:${timeParts[1]}`;
        }
      }
      return timeString;
    } catch (error) {
      return timeString;
    }
  };

  // Get text color based on transaction type
  const getTextColor = (typeId: number) => {
    if (typeId === 8) {
      return "text-green-600";
    } else if ([1, 9, 10].includes(typeId)) {
      return "text-red-600";
    }
    return "text-gray-800 dark:text-white";
  };

  // Format value with sign
  const formatValue = (typeId: number, value: number) => {
    if (typeId === 8) {
      return `+${value}`;
    } else if ([1, 9, 10].includes(typeId)) {
      return `-${value}`;
    }
    return value;
  };

  // Handle load more with cursor
  const handleLoadMore = () => {
    if (!hasMoreContent || isLoadingMore) return;

    setIsLoadingMore(true);

    // Get cursor from the last loaded event
    if (allEvents.length > 0) {
      const lastDateEvent = allEvents[allEvents.length - 1];
      const lastEvent = lastDateEvent.events[lastDateEvent.events.length - 1];
      const newCursor = `${lastDateEvent.date}_${lastEvent.id}_${lastEvent.time}`;
      setCursor(newCursor);
    }
  };

  // Handle collapse back to first batch
  const handleCollapse = () => {
    setIsLoadingMore(true);

    setTimeout(() => {
      setCursor(null);
      setLoadedBatches(0);
      setHasMoreContent(true);
      setCursors([]);
      setIsContentExpanded(false); // Also collapse content when resetting
      setIsLoadingMore(false);

      // Scroll to top
      const panel = document.querySelector(".bonus-statement-panel");
      if (panel) {
        panel.scrollTop = 0;
      }
    }, 300);
  };

  // Toggle content expansion
  const toggleContentExpansion = () => {
    setIsContentExpanded(!isContentExpanded);
  };

  return (
    <div className="h-full flex flex-col bg-white px-4 max-w-2xl mx-auto dark:bg-[#404040] bonus-statement-panel">
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
        {/* Bonus statement title */}
        <button className="w-full border border-white dark:border-none bg-blue-600 text-white py-5 rounded-[25px] text-xl font-medium shadow-md">
          {t("cabinet.bonus.statement")}
        </button>

        {/* Bonus statement content */}
        <div className="bg-gray-50 rounded-[25px] p-6 border shadow-md min-h-[500px] flex flex-col justify-between dark:bg-[#2C2B2B] dark:border-none">
          {/* Transaction list */}
          <div className="flex-grow overflow-y-auto">
            {isLoading && cursor === null && (
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

            {!isLoading && !error && allEvents.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <div className="bg-gray-500 rounded-full p-3 mb-4">
                  <Info className="h-6 w-6 text-white" />
                </div>
                <p className="text-xl font-bold dark:text-white">
                  {t("empty.bonus.statement")}
                </p>
              </div>
            )}

            {!error && allEvents.length > 0 && (
              <>
                {Object.entries(getGroupedVisibleTransactions()).map(
                  ([date, transactions]) => (
                    <div key={`date-${date}`} className="mb-6 last:mb-0">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        {formatDate(date)}
                      </h3>

                      {transactions.map(({ event, eventIndex }) => (
                        <div
                          key={`event-${event.id}-${eventIndex}`}
                          className="mb-3 last:mb-0"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                {event.title}{" "}
                                {event.from_name && event.from_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatTime(event.time)}
                              </p>
                            </div>
                            <span
                              className={`font-medium whitespace-nowrap ${getTextColor(
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
                  )
                )}

                {/* Loading indicator for additional content */}
                {isLoadingMore && cursor !== null && (
                  <div className="flex justify-center py-4">
                    <div className="h-6 w-6 border-2 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Bottom controls */}
          {!isLoading && !error && allEvents.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              {/* Content expansion button */}
              {getHiddenTransactionsCount() > 0 && (
                <div className="flex flex-col items-center gap-2 mb-4">
                  <Button
                    onClick={toggleContentExpansion}
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    title={isContentExpanded ? "Show less" : "Show more"}
                  >
                    {isContentExpanded ? (
                      <ChevronUp className="h-6 w-6 text-blue-600" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-blue-600" />
                    )}
                  </Button>

                 
                </div>
              )}

              {/* Pagination controls */}
              <div className="flex justify-center items-center gap-2">
                {/* Collapse button - show when we have loaded multiple batches */}
                {loadedBatches > 1 && (
                  <Button
                    onClick={handleCollapse}
                    disabled={isLoadingMore}
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    title="Collapse to first page"
                  >
                    <ChevronUp className="h-6 w-6 text-gray-600" />
                  </Button>
                )}

                {/* Load more button */}
                {hasMoreContent && (
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  >
                    {isLoadingMore && cursor !== null ? (
                      <div className="h-5 w-5 border-2 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
                    ) : (
                      <ChevronDown className="h-6 w-6 text-blue-600" />
                    )}
                  </Button>
                )}
              </div>

              {/* Batch indicator */}
              {loadedBatches > 1 && (
                <div className="text-center mt-2">
                  <span className="text-xs text-gray-500">
                    Loaded {loadedBatches} batch{loadedBatches > 1 ? "es" : ""}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
