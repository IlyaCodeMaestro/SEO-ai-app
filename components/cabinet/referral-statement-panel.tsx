"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Info, X, ChevronDown, ChevronUp } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useLanguage } from "../provider/language-provider";

import { Button } from "@/components/ui/button";
import { useGetReferralHistoryQuery } from "@/store/services/main";

interface ReferralStatementPanelProps {
  onClose: () => void;
}

export function ReferralStatementPanel({
  onClose,
}: ReferralStatementPanelProps) {
  const { t } = useLanguage();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Используем старый API пока не обновим бэкенд
  const [currentPage, setCursor] = useState(1);
  const [allReferrals, setAllReferrals] = useState<any[]>([]);
  const [hasMoreContent, setHasMoreContent] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadedBatches, setLoadedBatches] = useState(0);

  // State for content expansion
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const maxVisibleReferrals = 100;

  // Используем старый API с page параметром
  const {
    data: referralHistory,
    isLoading,
    error,
  } = useGetReferralHistoryQuery(currentPage);

  // Update allReferrals when new data is loaded
  useEffect(() => {
    if (referralHistory) {
      if (
        referralHistory.date_referrals &&
        referralHistory.date_referrals.length > 0
      ) {
        if (currentPage === 1) {
          // First load - replace all data
          setAllReferrals(referralHistory.date_referrals);
          setLoadedBatches(1);
        } else {
          // Subsequent loads - append data
          setAllReferrals((prev) => [
            ...prev,
            ...referralHistory.date_referrals,
          ]);
          setLoadedBatches((prev) => prev + 1);
        }

        // Check if there's more content based on response
        setHasMoreContent(referralHistory.date_referrals.length > 0);
      } else {
        setHasMoreContent(false);
      }

      setIsLoadingMore(false);
    }
  }, [referralHistory, currentPage]);

  // Get all referrals flattened
  const getAllReferrals = () => {
    const referrals: Array<{
      dateGroup: any;
      referral: any;
      refIndex: number;
    }> = [];

    allReferrals.forEach((dateGroup) => {
      if (dateGroup.referrals && Array.isArray(dateGroup.referrals)) {
        dateGroup.referrals.forEach((referral: any, refIndex: number) => {
          referrals.push({ dateGroup, referral, refIndex });
        });
      }
    });

    return referrals;
  };

  // Get visible referrals based on expansion state
  const getVisibleReferrals = () => {
    const allReferralsList = getAllReferrals();

    if (isContentExpanded) {
      return allReferralsList;
    }

    return allReferralsList.slice(0, maxVisibleReferrals);
  };

  // Get total number of referrals
  const getTotalReferralsCount = () => {
    return getAllReferrals().length;
  };

  // Get hidden referrals count
  const getHiddenReferralsCount = () => {
    const total = getTotalReferralsCount();
    return Math.max(0, total - maxVisibleReferrals);
  };

  // Group visible referrals by date for display
  const getGroupedVisibleReferrals = () => {
    const visibleReferrals = getVisibleReferrals();
    const grouped: Record<
      string,
      Array<{ referral: any; refIndex: number }>
    > = {};

    visibleReferrals.forEach(({ dateGroup, referral, refIndex }) => {
      if (!grouped[dateGroup.date]) {
        grouped[dateGroup.date] = [];
      }
      grouped[dateGroup.date].push({ referral, refIndex });
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

  // Determine if a referral is active based on type_id
  const isReferralActive = (typeId: number) => {
    return typeId === 2;
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!hasMoreContent || isLoadingMore) return;

    setIsLoadingMore(true);
    setCursor((prev) => prev + 1);
  };

  // Handle collapse back to first batch
  const handleCollapse = () => {
    setIsLoadingMore(true);

    setTimeout(() => {
      setCursor(1);
      setLoadedBatches(0);
      setHasMoreContent(true);
      setIsContentExpanded(false); // Also collapse content when resetting
      setIsLoadingMore(false);

      // Scroll to top
      const panel = document.querySelector(".referral-statement-panel");
      if (panel) {
        panel.scrollTop = 0;
      }
    }, 300);
  };

  // Toggle content expansion
  const toggleContentExpansion = () => {
    setIsContentExpanded(!isContentExpanded);
  };

  // Debug info
  const totalReferrals = getTotalReferralsCount();
  const hiddenReferrals = getHiddenReferralsCount();

  console.log("Debug referrals:", {
    totalReferrals,
    hiddenReferrals,
    maxVisible: maxVisibleReferrals,
    isExpanded: isContentExpanded,
    allReferralsLength: allReferrals.length,
  });

  return (
    <div className="h-full flex flex-col bg-white px-4 max-w-2xl mx-auto dark:bg-[#404040] referral-statement-panel">
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
        {/* Referral statement title */}
        <button className="w-full border border-white dark:border-none bg-blue-600 text-white py-5 rounded-[25px] text-xl font-medium shadow-md">
          {t("cabinet.referral.statement")}
        </button>

        {/* Referral statement content */}
        <div className="bg-gray-50 rounded-[25px] p-6 border shadow-md min-h-[500px] flex flex-col justify-between dark:bg-[#2C2B2B] dark:border-none">
          {/* Referral list */}
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
                  {t("error.loading.referral.history")}
                </p>
              </div>
            )}

            {!isLoading && !error && allReferrals.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <div className="bg-gray-500 rounded-full p-3 mb-4">
                  <Info className="h-6 w-6 text-white" />
                </div>
                <p className="text-xl font-bold dark:text-white">
                  {t("empty.referral.statement")}
                </p>
              </div>
            )}

            {!error && allReferrals.length > 0 && (
              <>
                {Object.entries(getGroupedVisibleReferrals()).map(
                  ([date, referrals]) => (
                    <div key={`date-${date}`} className="mb-6 last:mb-0">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        {formatDate(date)}
                      </h3>

                      {referrals.map(({ referral, refIndex }) => (
                        <div
                          key={`referral-${referral.id}-${refIndex}`}
                          className="mb-5 last:mb-0 flex justify-between items-center"
                        >
                          <div className="flex items-center">
                            <p
                              className={
                                isReferralActive(referral.type_id)
                                  ? "font-bold"
                                  : "font-normal"
                              }
                            >
                              {referral.name}
                            </p>
                          </div>
                          <span className="text-black dark:text-white font-light">
                            {referral.phone}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* Loading indicator for additional content */}
                {isLoadingMore && currentPage > 1 && (
                  <div className="flex justify-center py-4">
                    <div className="h-6 w-6 border-2 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Bottom controls */}
          {!isLoading && !error && allReferrals.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              {/* Debug info - remove in production */}

              {/* Content expansion button - показываем всегда если есть данные для тестирования */}
              {totalReferrals > 0 && (
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
              </div>

              {/* Batch indicator */}
              {loadedBatches > 1 && <div className="text-center mt-2"></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
