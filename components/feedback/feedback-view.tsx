"use client";

import { ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../provider/language-provider";

export function FeedbackView() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string | null>(null);
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

  const handleOpenFeedbackPanel = (panel: string) => {
    setActiveTab(panel);

    // Set the selected item
    setSelectedItem(panel);

    // Clear any existing timeout
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    // Set timeout to clear selection after 2 seconds
    selectionTimeoutRef.current = setTimeout(() => {
      setSelectedItem(null);
    }, 2000);

    if (window.openFeedbackPanel) {
      window.openFeedbackPanel(panel);
    }
  };

  // Function to get the style for buttons based on selection state
  const getButtonStyle = (itemId: string) => {
    // Base classes with added dark mode shadow at the bottom
    const baseClasses =
      "w-full rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] dark:bg-[#333333] p-4 flex justify-between items-center bg-white transition-all duration-200";

    if (selectedItem === itemId) {
      return `${baseClasses} border-2 border-blue-600`;
    } else {
      return `${baseClasses} hover:border-2 hover:border-blue-600`;
    }
  };

  // Function to get the style for the main feedback button
  const getMainButtonStyle = () => {
    const baseClasses =
      "w-full cursor-default bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)] text-white text-lg font-normal py-4 rounded-[24px] shadow-md transition-all duration-200";

    if (selectedItem === "main-feedback") {
      return `${baseClasses} border-2 border-blue-600`;
    } else {
      return `${baseClasses}`;
    }
  };

  const handleMainFeedbackClick = () => {
    // Set the selected item
    setSelectedItem("main-feedback");

    // Clear any existing timeout
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    // Set timeout to clear selection after 2 seconds
    selectionTimeoutRef.current = setTimeout(() => {
      setSelectedItem(null);
    }, 2000);

    // Add any additional functionality here
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center py-4">
        <h1 className="text-xl font-medium text-blue-600">
          {t("common.feedback")}
        </h1>
      </div>

      {/* Blue feedback button */}
      <div className="px-6 py-4">
        <button
          className={getMainButtonStyle()}
          onClick={handleMainFeedbackClick}
        >
          {t("feedback.for.developers")}
        </button>
      </div>

      <div className="px-6 space-y-3">
        {/* Часто задаваемые вопросы */}
        <button
          onClick={() => handleOpenFeedbackPanel("faq")}
          className={getButtonStyle("faq")}
        >
          <span className="text-base font-normal">{t("feedback.faq")}</span>
          <ChevronRight className="h-5 w-5 text-black dark:text-white" />
        </button>
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 px-2">
          {t("feedback.type")}
        </div>
        {/* Рекомендации */}
        <button
          onClick={() => handleOpenFeedbackPanel("recommendations")}
          className={getButtonStyle("recommendations")}
        >
          <span className="text-base font-normal">
            {t("feedback.recommendations")}
          </span>
          <ChevronRight className="h-5 w-5 text-black dark:text-white" />
        </button>

        {/* Пожаловаться */}
        <button
          onClick={() => handleOpenFeedbackPanel("complaint")}
          className={getButtonStyle("complaint")}
        >
          <span className="text-base font-normal">
            {t("feedback.complaint")}
          </span>
          <ChevronRight className="h-5 w-5 text-black dark:text-white" />
        </button>

        {/* Другое */}
        <button
          onClick={() => handleOpenFeedbackPanel("other")}
          className={getButtonStyle("other")}
        >
          <span className="text-base font-normal">{t("feedback.other")}</span>
          <ChevronRight className="h-5 w-5 text-black dark:text-white" />
        </button>
      </div>
    </div>
  );
}
