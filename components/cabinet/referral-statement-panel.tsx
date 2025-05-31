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
  const [currentPage, setCurrentPage] = useState(1);
  const [allReferrals, setAllReferrals] = useState<any[]>([]);
  const [hasMoreContent, setHasMoreContent] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadedPages, setLoadedPages] = useState(1);

  // Fetch referral history data
  const {
    data: referralHistory,
    isLoading,
    error,
  } = useGetReferralHistoryQuery(currentPage);

  // Update allReferrals when new data is loaded
  useEffect(() => {
    if (referralHistory?.date_referrals) {
      if (currentPage === 1) {
        setAllReferrals(referralHistory.date_referrals);
        setLoadedPages(1);
      } else {
        // Append new referrals to existing ones
        setAllReferrals((prev) => [...prev, ...referralHistory.date_referrals]);
        setLoadedPages(currentPage);
      }

      // Check if there's more content to load
      setHasMoreContent(referralHistory.date_referrals.length > 0);
      setIsLoadingMore(false);
    }
  }, [referralHistory, currentPage]);

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

  // Determine if a referral is active based on type_id
  // Assuming type_id = 2 means active, but this should be adjusted based on actual business logic
  const isReferralActive = (typeId: number) => {
    return typeId === 2;
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
      if (referralHistory?.date_referrals) {
        setAllReferrals(
          allReferrals.slice(0, referralHistory.date_referrals.length)
        );
      }
      setCurrentPage(1);
      setLoadedPages(1);
      setHasMoreContent(true);
      setIsLoadingMore(false);
      // Scroll to top
      const panel = document.querySelector(".referral-statement-panel");
      if (panel) {
        panel.scrollTop = 0;
      }
    }, 300);
  };

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

            {!error &&
              allReferrals.map((dateGroup, dateIndex) => (
                <div
                  key={`date-${dateGroup.id}-${dateIndex}`}
                  className="mb-6 last:mb-0"
                >
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    {formatDate(dateGroup.date)}
                  </h3>

                  {dateGroup.referrals.map((referral: any, refIndex) => (
                    <div
                      key={`referral-${referral.id}-${dateIndex}-${refIndex}`}
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
              ))}
          </div>

          {/* Load more button or collapse button */}
          {!isLoading && !error && allReferrals.length > 0 && (
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
