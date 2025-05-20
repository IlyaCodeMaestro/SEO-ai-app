"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../provider/language-provider";

export function FeedbackView() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleOpenFeedbackPanel = (panel: string) => {
    setActiveTab(panel);
    setSelectedItem(panel);
    if (window.openFeedbackPanel) {
      window.openFeedbackPanel(panel);
    }
  };

  // Function to get the style for buttons based on selection state
  const getButtonStyle = (itemId: string) => {
    const baseClasses =
      "w-full rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.1)] dark:bg-[#333333] p-4 flex justify-between items-center bg-white transition-all duration-200";

    if (selectedItem === itemId) {
      return `${baseClasses} border-2 border-blue-600`;
    } else {
      return `${baseClasses} hover:border-2 hover:border-blue-600`;
    }
  };

  // Function to get the style for the main feedback button
  const getMainButtonStyle = () => {
    const baseClasses =
      "w-full bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)] text-white text-lg font-normal py-4 rounded-[24px] shadow-md transition-all duration-200";

    if (selectedItem === "main-feedback") {
      return `${baseClasses} border-2 border-blue-600`;
    } else {
      return `${baseClasses} border border-white hover:border-2 hover:border-blue-600`;
    }
  };

  const handleMainFeedbackClick = () => {
    setSelectedItem("main-feedback");
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
        <div className="text-sm text-gray-500 mb-2 px-2">
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
