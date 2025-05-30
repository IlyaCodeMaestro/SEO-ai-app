"use client";

import type React from "react";

import { useLanguage } from "../provider/language-provider";
import { ChevronRight, Sun, Moon } from "lucide-react";
import { useTheme } from "../provider/theme-provider";
import { useTariff } from "../provider/tariff-provider";
import { useState } from "react";
import { useGetProfileQuery } from "@/store/services/main";

interface CabinetViewProps {
  onOpenPanel?: (panel: string, data?: any) => void;
}

function isMobileDevice() {
  if (typeof window !== "undefined") {
    return window.innerWidth < 768; // Common breakpoint for mobile devices
  }
  return false;
}
// Добавим функцию translateApiContent, как в tariff-panel.tsx
const translateApiContent = (text: string, language: string): string => {
  if (!text) return text;

  // Проверяем, есть ли точное совпадение для этого текста
  if (apiTranslations[text]) {
    return apiTranslations[text][language] || text;
  }

  // Если точного совпадения нет, ищем частичное совпадение
  for (const key in apiTranslations) {
    // Удаляем все пробелы и переносы строк для сравнения
    const normalizedKey = key.replace(/\s+/g, "");
    const normalizedText = text.replace(/\s+/g, "");

    if (
      normalizedKey.includes(normalizedText) ||
      normalizedText.includes(normalizedKey)
    ) {
      return apiTranslations[key][language] || text;
    }
  }

  // Если совпадения не найдено, возвращаем оригинальный текст
  return text;
};
export function CabinetView({ onOpenPanel }: CabinetViewProps) {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { currentTariff, getTariffById } = useTariff();
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Fetch profile data
  const { data: profileData, isLoading, error } = useGetProfileQuery();

  // Получаем данные текущего тарифа
  const currentTariffData = getTariffById(currentTariff);

  const handleButtonClick =
    (panelName: string, itemId: string, callback?: Function, ...args: any[]) =>
    (e: React.MouseEvent) => {
      setSelectedItem(itemId);
      if (panelName) setActivePanel(panelName);
      if (callback) {
        callback(...args);
      }
      if (onOpenPanel) onOpenPanel(panelName);
      scrollToTop();

      // Clear the selected item after 2 seconds
      setTimeout(() => {
        setSelectedItem(null);
      }, 2000);
    };

  // Update the getTranslatedTariffName function to properly handle English translations

  // Replace the current getTranslatedTariffName function with this updated version:
  const getTranslatedTariffName = () => {
    if (currentTariffData.id === "seller") {
      return language === "ru"
        ? "Селлер"
        : language === "kz"
        ? "Сатушы"
        : "Seller";
    } else if (currentTariffData.id === "manager") {
      return language === "ru"
        ? "Менеджер"
        : language === "kz"
        ? "Менеджер"
        : "Manager";
    } else if (currentTariffData.id === "premium") {
      return language === "ru"
        ? "Премиум"
        : language === "kz"
        ? "Премиум"
        : "Premium";
    }
    return currentTariffData.name;
  };

  const scrollToTop = () => {
    if (!isMobileDevice()) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const getItemStyle = (itemId: string) => {
    // Базовые классы, которые всегда применяются
    const baseClasses =
      "bg-white rounded-[25px] shadow-md transition-all duration-200";

    // Добавляем тень снизу для темной темы
    const darkModeClasses =
      "dark:bg-[#333333] dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)]";

    // Если элемент выбран - тонкая синяя граница
    if (selectedItem === itemId) {
      return `${baseClasses} ${darkModeClasses} border-2 border-blue-600`;
    } else {
      // Если элемент не выбран - обычная граница и тонкая синяя при наведении
      return `${baseClasses} ${darkModeClasses} border hover:border-2 hover:border-blue-600`;
    }
  };
  // Функция для форматирования количества баллов с учетом языка
  const formatBonusPoints = (points: number | string | undefined): string => {
    if (points === undefined) return `0 ${t("bonus.points")}`;

    const numPoints =
      typeof points === "string" ? Number.parseInt(points, 10) : points;

    if (language === "ru") {
      // Для русского языка используем правильные окончания
      if (numPoints === 1) {
        return `${numPoints} ${t("bonus.point")}`;
      } else if (numPoints >= 2 && numPoints <= 4) {
        return `${numPoints} ${t("bonus.points.2_4")}`;
      } else {
        return `${numPoints} ${t("bonus.points")}`;
      }
    } else {
      // Для других языков просто используем множественную форму
      return `${numPoints} ${t(
        numPoints === 1 ? "bonus.point" : "bonus.points"
      )}`;
    }
  };

  // Состояние загрузки
  if (isLoading) {
    return (
      <div className="h-full flex flex-col justify-center items-center">
        <p className="text-lg md:text-lg">{t("loading")}</p>
      </div>
    );
  }

  // Состояние ошибки
  if (error) {
    return (
      <div className="h-full flex flex-col justify-center items-center">
        <p className="text-lg md:text-lg text-red-500">
          {t("error.loading.profile")}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Заголовок по центру без кнопки назад */}
      <div className="p-4 flex items-center justify-center">
        <h2 className="text-lg md:text-xl text-[#1950DF] font-medium">
          {t("cabinet.title")}
        </h2>
      </div>

      {/* Серый блок с контентом */}
      <div className="flex-1 mx-4 mb-4 rounded-[24px]">
        {/* Информация о пользователе */}
        <div className="px-4 pb-2">
          <div className="text-center mb-0">
            <h3 className="text-xl font-medium">
              {profileData?.user.name || "Загрузка..."}
            </h3>
            <p className="text-base dark:text-xs md:text-base dark:md:text-sm font-sm text-gray-600 dark:text-white">
              {profileData?.user.phone || "Загрузка..."}
            </p>
            <p className="text-base dark:text-xs md:text-base dark:md:text-sm font-sm text-gray-600 dark:text-white">
              {profileData?.user.email || "Загрузка..."}
            </p>
          </div>

          {/* Баланс */}
          <div
            className={`${getItemStyle(
              "balance"
            )} bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)] rounded-[25px] h-[70px] px-6 py-3 mt-2 mb-4 text-white flex flex-col justify-between cursor-pointer shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)]`}
            onClick={handleButtonClick("balance-topup", "balance")}
          >
            <div className="flex justify-between items-start">
              <span className="font-sm text-md md:text-base pt-[10px]">
                {t("cabinet.balance")}
              </span>
              <span className="font-medium text-sm md:text-base">
                {profileData?.user.balance || "0 ₸"}
              </span>
            </div>
            <div className="flex justify-end">
              {profileData?.user.refill_visible && (
                <button
                  className="text-xs font-light text-white underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleButtonClick("balance-topup", "balance")(e);
                  }}
                >
                  {t("cabinet.topup")}
                </button>
              )}
            </div>
          </div>

          {/* Выписка по балансу */}
          <div
            className={`${getItemStyle(
              "balance-statement"
            )} p-6 mb-4 h-[70px] cursor-pointer`}
            onClick={handleButtonClick("balance-history", "balance-statement")}
          >
            <div className="flex justify-between items-center h-full">
              <span className="text-base md:text-base leading-tight">
                {t("cabinet.balance.statement")}
              </span>
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-black dark:text-white flex-shrink-0" />
            </div>
          </div>

          {/* Бонусы */}

          <div
            className={`${getItemStyle(
              "bonuses"
            )} h-[70px] px-6 pt-4 pb-2 mb-4 flex flex-col justify-between cursor-pointer`}
            onClick={handleButtonClick("bonus-exchange", "bonuses")}
          >
            <div className="flex justify-between items-start">
              <span className="text-base md:text-base pt-2 text-[#020817] dark:text-white leading-tight">
                {t("cabinet.bonuses")}
              </span>
              <span className="text-sm md:text-base text-[#020817] dark:text-white">
                {formatBonusPoints(profileData?.user.bonuses)}
              </span>
            </div>
            <div className="flex justify-end">
              <button
                className="text-xs font-light text-black underline dark:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleButtonClick("bonus-exchange", "bonuses")(e);
                }}
              >
                {t("cabinet.exchange")}
              </button>
            </div>
          </div>
          {/* Выписка по бонусам */}
          <div
            className={`${getItemStyle(
              "bonus-statement"
            )} p-6 mb-4 h-[70px] cursor-pointer`}
            onClick={handleButtonClick("bonus-statement", "bonus-statement")}
          >
            <div className="flex justify-between items-center h-full">
              <span className="text-base md:text-base leading-tight">
                {t("cabinet.bonus.statement")}
              </span>
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-black dark:text-white flex-shrink-0" />
            </div>
          </div>

          {/* Выписка по рефералам */}
          <div
            className={`${getItemStyle(
              "referral-statement"
            )} p-6 mb-4 h-[70px] cursor-pointer`}
            onClick={handleButtonClick(
              "referral-statement",
              "referral-statement"
            )}
          >
            <div className="flex justify-between items-center h-full">
              <span className="text-base md:text-base leading-tight">
                {t("cabinet.referral.statement")}
              </span>
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-black dark:text-white flex-shrink-0" />
            </div>
          </div>

          {/* Тариф */}
          <div
            className={`${getItemStyle(
              "tariff"
            )} h-[70px] px-6 pt-4 mb-4 flex flex-col justify-between cursor-pointer`}
            onClick={handleButtonClick("tariff", "tariff")}
          >
            <div className="flex justify-between items-center">
              <span className="text-base md:text-base pb-[10px] leading-tight">
                {t("cabinet.tariff")}
              </span>
              <div className="flex flex-col items-end gap-2">
                <span className="text-sm md:text-base text-gray-800 dark:text-white leading-tight">
                  {profileData?.user.tariff
                    ? profileData.user.tariff.includes("Премиум")
                      ? `«${language === "en" ? "Premium" : "Премиум"}»`
                      : profileData.user.tariff
                    : `«${getTranslatedTariffName()}»`}
                </span>
                <button
                  className="text-xs font-light text-black underline dark:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleButtonClick("tariff", "tariff")(e);
                  }}
                >
                  {t("tariff.switch")}
                </button>
              </div>
            </div>
          </div>

          {/* Язык - обновленный стиль */}
          <div className="relative mb-4">
            <div className="bg-white rounded-[25px] dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] transition-all duration-200 border h-[70px] p-4 flex justify-between items-center dark:bg-[#333333] dark:border-gray-700">
              <span className="text-base md:text-base ml-2 leading-tight">
                {t("cabinet.language")}
              </span>
              <div className="bg-gray-100 rounded-[25px] p-1 flex dark:bg-[#4D4D4D]">
                <button
                  className={`px-2 md:px-3 py-1 md:py-2 rounded-[20px] text-xs md:text-sm transition-all ${
                    language === "kz"
                      ? "bg-white text-blue-600 font-medium shadow-md dark:bg-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-white"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLanguage("kz");
                  }}
                >
                  Каз.
                </button>
                <button
                  className={`px-2 md:px-3 py-1 md:py-2 rounded-[20px] text-xs md:text-sm transition-all ${
                    language === "ru"
                      ? "bg-white text-blue-600 font-medium shadow-md dark:bg-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-white"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLanguage("ru");
                  }}
                >
                  Рус.
                </button>
                <button
                  className={`px-2 md:px-3 py-1 md:py-2 rounded-[20px] text-xs md:text-sm transition-all ${
                    language === "en"
                      ? "bg-white text-blue-600 font-medium shadow-md dark:bg-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-white"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLanguage("en");
                  }}
                >
                  Eng.
                </button>
              </div>
            </div>
          </div>

          {/* Тема - обновленный стиль */}
          <div className="relative mb-4">
            <div className="bg-white rounded-[25px]  shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] transition-all duration-200 border h-[70px] p-4 flex justify-between items-center dark:bg-[#333333] dark:border-gray-700 dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)]">
              <span className="text-base md:text-base ml-2 leading-tight">
                {t("cabinet.theme")}
              </span>
              <div className="bg-gray-100 rounded-[25px] p-1 flex dark:bg-[#4D4D4D]">
                <button
                  className={`px-2 md:px-3 py-1 md:py-2 rounded-[20px] flex items-center transition-all ${
                    theme === "light"
                      ? "bg-white text-blue-600 shadow-md"
                      : "text-gray-500 dark:text-white"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTheme("light");
                  }}
                >
                  <Sun className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  <span className="text-xs md:text-sm leading-none">
                    {t("cabinet.theme.light")}
                  </span>
                </button>
                <button
                  className={`px-2 md:px-3 py-1 md:py-2 rounded-[20px] flex items-center transition-all ${
                    theme === "dark"
                      ? "bg-white text-blue-600 shadow-md dark:text-white dark:bg-gray-900"
                      : "text-gray-500 dark:text-white"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTheme("dark");
                  }}
                >
                  <Moon className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  <span className="text-xs md:text-sm leading-none">
                    {t("cabinet.theme.dark")}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Активные устройства */}
          <div
            className={`${getItemStyle(
              "active-devices"
            )} p-6 mb-4 h-[70px] cursor-pointer`}
            onClick={handleButtonClick("active-devices", "active-devices")}
          >
            <div className="flex justify-between items-center h-full">
              <span className="text-base md:text-base leading-tight">
                {t("cabinet.active.devices")}
              </span>
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-black dark:text-white flex-shrink-0" />
            </div>
          </div>

          {/* Удалить аккаунт */}
          <div
            className={`${getItemStyle(
              "delete-account"
            )} p-6 mb-4 h-[70px] cursor-pointer`}
            onClick={handleButtonClick("delete-account", "delete-account")}
          >
            <div className="flex justify-between items-center h-full">
              <span className="text-base md:text-base text-black dark:text-white leading-tight">
                {t("cabinet.delete.account")}
              </span>
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-black dark:text-white flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
