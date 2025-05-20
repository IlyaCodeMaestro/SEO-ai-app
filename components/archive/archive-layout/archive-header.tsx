"use client";

import { useLanguage } from "@/components/provider/language-provider";
import { ArrowLeft, X } from "lucide-react";


interface ArchiveHeaderProps {
  onClose: () => void;
  isMobile: boolean;
  itemType?: "analysis" | "description" | "both";
}

export function ArchiveHeader({
  onClose,
  isMobile,
  itemType = "description",
}: ArchiveHeaderProps) {
  const { t } = useLanguage();

  // Функция для определения подзаголовка в зависимости от типа элемента
  const getSubtitle = () => {
    switch (itemType) {
      case "analysis":
        return t("archive.header.analysis");
      case "description":
        return t("archive.header.description");
      case "both":
        return t("archive.header.both");
      default:
        return t("archive.header.description");
    }
  };

  if (isMobile) {
    return (
      <div className="flex flex-col items-center mb-4 text-center">
        <div className="flex items-center w-full">
          <button onClick={onClose} className="mr-3" aria-label="Back">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h2 className="text-blue-600 font-medium text-xl mx-auto">
            {t("archive.title")}
          </h2>
        </div>
        <h3 className="text-gray-700 dark:text-white font-medium text-md mt-2">
          {getSubtitle()}
        </h3>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-3">
      <div className="w-5 hidden sm:block"></div>{" "}
      {/* Пустой элемент для выравнивания на десктопе */}
      <h2 className="text-blue-600 font-medium text-xl mb-2 sm:mb-0 sm:hidden">
        {t("archive.title")}
      </h2>
      <h3 className="text-gray-700 dark:text-white font-medium text-md mb-3 sm:mb-0 sm:hidden">
        {getSubtitle()}
      </h3>
      <button onClick={onClose} className="p-1" aria-label="Close">
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
