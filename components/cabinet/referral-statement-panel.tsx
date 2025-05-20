"use client";

import { useState } from "react";
import { ArrowLeft, Info, X, ChevronLeft, ChevronRight } from "lucide-react";
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

  // Fetch referral history data
  const {
    data: referralHistory,
    isLoading,
    error,
  } = useGetReferralHistoryQuery(currentPage);

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
    <div className="h-full flex flex-col bg-white px-4 py-6 max-w-2xl mx-auto dark:bg-[#333333]">
      {/* Header */}
      <div className="flex items-center">
        {isMobile ? (
          <>
            <button
              onClick={onClose}
              className="p-1"
              aria-label={t("common.back")}
            >
              <ArrowLeft className="h-6 w-6 mb-4" />
            </button>
            <h1 className="text-xl font-medium text-center flex-1 pr-4 text-blue-600 mb-4">
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
        {/* Referral statement title */}
        <button className="w-full border border-white bg-blue-600 text-white py-5 rounded-[25px] text-xl font-medium shadow-md">
          {t("cabinet.referral.statement")}
        </button>

        {/* Referral statement content */}
        <div className="bg-gray-50 rounded-[25px] p-6 border shadow-sm min-h-[500px] flex flex-col justify-between dark:bg-[#2C2B2B] dark:border-white">
          {/* Referral list */}
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
                  {t("error.loading.referral.history")}
                </p>
              </div>
            )}

            {!isLoading &&
              !error &&
              (!referralHistory?.date_referrals ||
                referralHistory.date_referrals.length === 0) && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <div className="bg-gray-500 rounded-full p-3 mb-4">
                    <Info className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-xl font-bold dark:text-white">
                    {t("empty.referral.statement")}
                  </p>
                </div>
              )}

            {!isLoading &&
              !error &&
              referralHistory?.date_referrals?.map((dateGroup) => (
                <div key={dateGroup.id} className="mb-6 last:mb-0">
                  <h3 className="text-base font-medium text-gray-700 mb-4 dark:text-white">
                    {formatDate(dateGroup.date)}
                  </h3>

                  {dateGroup.referrals.map((referral) => (
                    <div
                      key={referral.id}
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
                      <span className="text-gray-500">{referral.phone}</span>
                    </div>
                  ))}
                </div>
              ))}
          </div>

          {/* Pagination */}
          {!isLoading &&
            !error &&
            referralHistory?.date_referrals?.length > 0 && (
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
