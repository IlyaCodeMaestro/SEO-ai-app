"use client";

import { ArrowLeft } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useState } from "react";
import { ShareMenuWithoutCopy } from "../shared/share-menu-without-copy";
import { useLanguage } from "../provider/language-provider";
import { useGetAffiliateItemQuery } from "@/store/services/affiliate-api";
import { Loader2 } from "lucide-react";

interface PartnerPremiumPanelProps {
  onClose: () => void;
}

export default function PartnerPremiumPanel({
  onClose,
}: PartnerPremiumPanelProps) {
  const { t } = useLanguage();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [shareContent, setShareContent] = useState<{
    content: string;
    title: string;
  } | null>(null);

  // Получаем данные премиум партнерской программы из API (id: 2)
  const { data: affiliateData, isLoading, error } = useGetAffiliateItemQuery(2);

  // Формируем контент для шаринга с использованием ссылки из API
  const getShareContent = () => {
    if (affiliateData?.link_share) {
      // Используем ссылку из API для формирования контента
      return {
        content: `${t("partner.share.content")} https://seo-ai.kz/?ref=${
          affiliateData.link_share
        }`,
        title: t("partner.referral.program"),
      };
    } else {
      // Если ссылка не получена, используем дефолтный контент
      return {
        content: t("partner.share.content"),
        title: t("partner.referral.program"),
      };
    }
  };

  const handleShare = () => {
    setShareContent(getShareContent());
  };

  const handleCloseShareMenu = () => {
    setShareContent(null);
  };

  if (isLoading) {
    return (
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl dark:bg-[#404040] mb-7 mx-auto h-full flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-2 text-blue-600">{t("loading")}</p>
      </div>
    );
  }

  if (error || !affiliateData) {
    return (
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl dark:bg-[#404040] mb-7 mx-auto h-full flex flex-col items-center justify-center">
        <p className="text-red-500">{t("error.loading")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md md:max-w-2xl lg:max-w-4xl dark:bg-[#404040] mb-7 mx-auto h-full flex flex-col rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center p-4 bg-white relative dark:bg-[#404040]">
        {isMobile ? (
          <>
            <button onClick={onClose} className="absolute left-4">
              <ArrowLeft size={24} className="dark:text-blue-600" />
            </button>
            <h1 className="text-xl font-medium text-blue-600 text-center w-full">
              {t("partner.referral.program")}
            </h1>
          </>
        ) : (
          <button onClick={onClose} className="text-gray-600 absolute right-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-x dark:text-blue-600"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Blue banner with API data */}
      <div
        className="p-6 rounded-[30px] mx-4 mb-4 text-center"
        style={{
          background: `linear-gradient(to right, ${affiliateData.shares.b_start_color}, ${affiliateData.shares.b_end_color})`,
        }}
      >
        <p className="text-xl font-medium leading-tight text-white dark:text-gray-200">
          {affiliateData.shares.title}
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-gray-100 rounded-[30px] dark:bg-[#333333] mx-4 p-6 shadow-md border">
        <h2 className="text-xl font-medium mb-6 dark:text-white">
          {affiliateData.shares.header}
        </h2>

        <div className="space-y-8 relative">
          {/* Vertical line */}
          <div className="absolute left-[20px] top-[20px] little:h-[610px] h-[600px] md:h-[395px] xs-range:h-[595px] sm:h-[590px] w-px border-l border-dashed border-blue-700 z-0" />

          {/* Dynamic steps from API */}
          {affiliateData.shares.share_items.map((item, index) => (
            <div key={item.id} className="flex">
              <div className="flex-shrink-0 mr-4 z-10">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                  {item.number}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 dark:text-white">
                  {item.header}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{item.title}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleShare}
            className="bg-gradient-to-r h-[60px] w-80 rounded-[25px] shadow-custom from-[#0d52ff] to-[rgba(11,60,187,1)] border border-white text-white text-2xl md:text-xl"
          >
            {t("common.share")}
          </button>
        </div>

        {/* ShareMenu with overlay */}
        {shareContent && (
          <div className="absolute inset-0 z-50 flex items-center justify-center overflow-y-auto rounded-3xl overflow-x-hidden">
            <div
              onClick={onClose}
              className="absolute mt-7 mb-6 inset-0 bg-[#1e1e1e] bg-opacity-50"
            >
              <ShareMenuWithoutCopy
                content={shareContent.content}
                title={shareContent.title}
                onClose={handleCloseShareMenu}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
