"use client";

import { useState, useEffect } from "react";
import { CabinetView } from "@/components/cabinet/cabinet-view";
import { useMediaQuery } from "@/hooks/use-media-query";
import { BalanceTopupPanel } from "@/components/cabinet/balance-topup-panel";
import { BalanceHistoryPanel } from "@/components/cabinet/balance-history-panel";
import { BonusExchangePanel } from "@/components/cabinet/bonus-exchange-panel";
import { BonusStatementPanel } from "@/components/cabinet/bonus-statement-panel";
import { ReferralStatementPanel } from "@/components/cabinet/referral-statement-panel";
import { TariffPanel } from "@/components/cabinet/tariff-panel";
import { ActiveDevicesPanel } from "@/components/cabinet/active-devices-panel";
import { DeleteAccountPanel } from "@/components/cabinet/delete-account-panel";
import { ExitAccountPanel } from "@/components/cabinet/exit-account-panel";
import { DeleteAccountRequestPanel } from "@/components/cabinet/delete-account-request-panel";

type ActivePanel =
  | null
  | "product-analysis"
  | "product-description"
  | "processing"
  | "archive-item"
  | "balance-topup"
  | "balance-history"
  | "bonus-exchange"
  | "bonus-statement"
  | "referral-statement"
  | "tariff"
  | "active-devices"
  | "exit-account"
  | "delete-account"
  | "standard-program"
  | "premium-program"
  | "empty-panel"
  | "faq"
  | "recommendations"
  | "complaint"
  | "other";

// Глобальные функции для открытия панелей из других компонентов
declare global {
  interface Window {
    openPartnerPanel?: (panel: string) => void;
    openFeedbackPanel?: (panel: string) => void;
    openShareMenu?: (title: string, content: string) => void;
    openEmptyPanel?: (panel: string) => void;
  }
}

export function Cabinet() {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [activeTab, setActiveTab] = useState("main");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [shareContent, setShareContent] = useState({ title: "", content: "" });

  // Регистрируем глобальные функции для открытия панелей
  useEffect(() => {
    window.openPartnerPanel = (panel: string) => {
      setActivePanel(panel as ActivePanel);
    };

    window.openFeedbackPanel = (panel: string) => {
      setActivePanel(panel as ActivePanel);
    };

    window.openShareMenu = (title: string, content: string) => {
      setShareContent({ title, content });
      setShareMenuOpen(true);
    };

    return () => {
      window.openPartnerPanel = undefined;

      window.openFeedbackPanel = undefined;
      window.openShareMenu = undefined;
    };
  }, []);

  // Обновляем URL при изменении вкладки
  useEffect(() => {
    if (activeTab) {
      window.location.hash = activeTab;
    }
  }, [activeTab]);

  const handleOpenPanel = (panel: ActivePanel, data?: any) => {
    setActivePanel(panel);
  };

  const handleClosePanel = () => {
    setActivePanel(null);
  };

  // Рендерим содержимое левого блока в зависимости от активной вкладки
  const renderLeftContent = () => {
    return <CabinetView onOpenPanel={handleOpenPanel} />;
  };

  // Рендерим содержимое правого блока в зависимости от активной панели
  const renderRightContent = () => {
    if (activePanel === "balance-topup") {
      return <BalanceTopupPanel onClose={handleClosePanel} />;
    } else if (activePanel === "balance-history") {
      return <BalanceHistoryPanel onClose={handleClosePanel} />;
    } else if (activePanel === "bonus-exchange") {
      return <BonusExchangePanel onClose={handleClosePanel} />;
    } else if (activePanel === "bonus-statement") {
      return <BonusStatementPanel onClose={handleClosePanel} />;
    } else if (activePanel === "referral-statement") {
      return <ReferralStatementPanel onClose={handleClosePanel} />;
    } else if (activePanel === "tariff") {
      return <TariffPanel onClose={handleClosePanel} />;
    } else if (activePanel === "active-devices") {
      return <ActiveDevicesPanel onClose={handleClosePanel} />;
    } else if (activePanel === "exit-account") {
      return <ExitAccountPanel onClose={handleClosePanel} />;
    } else if (activePanel === "delete-account") {
      return <DeleteAccountPanel onClose={handleClosePanel} />;
    }

    return null;
  };

  // Для мобильной версии
  if (isMobile) {
    // Если есть активная панель, показываем только её
    if (activePanel) {
      return (
        <div className="flex flex-1 justify-center w-full min-h-[calc(100vh-65px)] ">
          <div className="w-full bg-white dark:bg-[#333333] rounded-none">
            {renderRightContent()}
          </div>
        </div>
      );
    }

    // Иначе показываем только левый блок
    return (
      <div className="flex flex-1 justify-center w-full min-h-[calc(100vh-65px)] ">
        <div className="w-full bg-[#F6F6F6] rounded-none dark:bg-[#404040]">
          {renderLeftContent()}
        </div>
      </div>
    );
  }

  // Для десктопной версии - оригинальный макет с общим скроллом
  return (
    <div className="flex flex-1 w-full max-w-[1380px] mx-auto px-2 md:px-4 lg:px-6 xl:px-8 min-h-[calc(100vh-110px)] h-full ">
      {/* Левая панель - всегда видима */}

      <div className="w-[430px] bg-[#f9f8f8] rounded-[25px] mt-[30px] mb-[30px] z-10 border shadow-md dark:bg-[#303030]  ">
        {renderLeftContent()}
      </div>
      {/* Правая панель - по умолчанию пустая */}
      <div className="flex-1 max-w-[1000px] relative ml-6 md:ml-8 lg:ml-10 xl:ml-12  ">
        <div
          className={`w-full bg-white rounded-[25px] dark:bg-[#404040] mt-[30px]`}
        >
          {renderRightContent()}
        </div>
      </div>
    </div>
  );
}
