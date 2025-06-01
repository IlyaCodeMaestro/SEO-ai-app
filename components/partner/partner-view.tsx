"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../provider/language-provider";
import { useGetAffiliateItemQuery } from "@/store/services/affiliate-api";

interface PartnerCardProps {
  title: string;
  gradient: string;
  onNavigate: () => void;
  isSelected: boolean;
  id: string;
  onSelect: (id: string) => void;
}

function PartnerCard({
  title,
  gradient,
  onNavigate,
  isSelected,
  id,
  onSelect,
}: PartnerCardProps) {
  const { t } = useLanguage();

  const handleClick = () => {
    onSelect(id);
    onNavigate();
  };

  // Apply blue border when selected
  const borderClass = isSelected ? "border-4 border-blue-600" : "border";

  return (
    <div
      className={`${gradient} rounded-[20px] p-6 text-white ${borderClass} shadow-custom mb-4 cursor-pointer transition-all duration-200`}
      onClick={handleClick}
    >
      <p className="text-xl font-normal mb-4">{title}</p>
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering parent onClick
          handleClick();
        }}
        className="bg-white text-black rounded-full px-6 py-2 border border-white text-sm font-light hover:bg-gray-100 transition-colors"
      >
        {t("common.go")}
      </button>
    </div>
  );
}

export function PartnerView() {
  const { t } = useLanguage();
  const [shareContent, setShareContent] = useState<{
    content: string;
    title: string;
  } | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, []);

  // Получаем данные партнерской программы из API
  const { data: affiliateData, isLoading, error } = useGetAffiliateItemQuery(1);

  const handleSelectItem = (id: string) => {
    // Set the selected item
    setSelectedItem(id);

    // Clear any existing timeout
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    // Set timeout to clear selection after 2 seconds
    selectionTimeoutRef.current = setTimeout(() => {
      setSelectedItem(null);
    }, 2000);
  };

  const handleOpenStandardProgram = () => {
    if (window.openPartnerPanel) {
      window.openPartnerPanel("standard-program");
    }
  };

  const handleOpenPremiumProgram = () => {
    if (window.openPartnerPanel) {
      window.openPartnerPanel("premium-program");
    }
  };

  const handleOpenEmptyPanel = () => {
    if (window.openPartnerPanel) {
      window.openPartnerPanel("empty-panel");
    }
  };

  // Формируем контент для шаринга с использованием ссылки из API
  const getShareContent = () => {
    if (affiliateData?.link_share) {
      // Используем ссылку из API для формирования контента
      return {
        content: `${t("partner.share.content")} https://seo-ai.kz/?ref=${
          affiliateData.link_share
        }`,
        title: t("partner.program"),
      };
    } else {
      // Если ссылка не получена, используем дефолтный контент
      return {
        content: t("partner.share.content"),
        title: t("partner.program"),
      };
    }
  };

  const handleShare = () => {
    // Set the selected item to share-button
    setSelectedItem("share-button");
    handleOpenEmptyPanel();
    setShareContent(getShareContent());

    // Clear any existing timeout
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    // Set timeout to clear selection after 2 seconds
    selectionTimeoutRef.current = setTimeout(() => {
      setSelectedItem(null);
    }, 2000);
  };

  const handleCloseShareMenu = () => {
    setShareContent(null);
  };

  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleOpenPanel = () => {
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  // Get style for share button
  const getShareButtonStyle = () => {
    const baseClasses =
      "bg-gradient-to-r h-[60px] w-80 rounded-[25px] shadow-custom from-[#0d52ff] to-[rgba(11,60,187,1)] text-white text-2xl md:text-xl transition-all duration-200";

    // Apply border based on selection
    const borderClass =
      selectedItem === "share-button"
        ? "border-4 border-blue-600"
        : "border border-white";

    return `${baseClasses} ${borderClass}`;
  };

  return (
    <div className="h-full  flex flex-col p-6 items-center relative overflow-hidden">
      <h1 className="text-lg sm:text-xl font-medium text-blue-600 mb-6 ml-4">
        {t("partner.referral.program")}
      </h1>

      <PartnerCard
        id="standard-program"
        title={t("partner.card.premium")}
        gradient="bg-gradient-to-r from-[#64cada] to-[#4169E1]"
        onNavigate={handleOpenStandardProgram}
        isSelected={selectedItem === "standard-program"}
        onSelect={handleSelectItem}
      />

      <PartnerCard
        id="premium-program"
        title={t("partner.card.standard")}
        gradient="bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)]"
        onNavigate={handleOpenPremiumProgram}
        isSelected={selectedItem === "premium-program"}
        onSelect={handleSelectItem}
      />

      <div className="mt-12 flex justify-center">
        <button onClick={handleShare} className={getShareButtonStyle()}>
          {isLoading ? t("loading") : t("common.share")}
        </button>
      </div>
    </div>
  );
}
