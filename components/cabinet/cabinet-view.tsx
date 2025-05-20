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
    };

  // Функция для получения переведенного названия тарифа
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

    // Если элемент выбран - тонкая синяя граница
    if (selectedItem === itemId) {
      return `${baseClasses} border-2 border-blue-600`;
    } else {
      // Если элемент не выбран - обычная граница и тонкая синяя при наведении
      return `${baseClasses} border hover:border-2 hover:border-blue-600`;
    }
  };

  // Состояние загрузки
  if (isLoading) {
    return (
      <div className="h-full flex flex-col justify-center items-center">
        <p className="text-lg">{t("loading")}</p>
      </div>
    );
  }

  // Состояние ошибки
  if (error) {
    return (
      <div className="h-full flex flex-col justify-center items-center">
        <p className="text-lg text-red-500">{t("error.loading.profile")}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Заголовок по центру без кнопки назад */}
      <div className="p-4 flex items-center justify-center">
        <h2 className="text-xl text-[#1950DF] font-medium">
          {t("cabinet.title")}
        </h2>
      </div>

      {/* Серый блок с контентом */}
      <div className="flex-1 mx-4 mb-4 rounded-[24px]">
        {/* Информация о пользователе */}
        <div className="px-4 pb-6">
          <div className="text-center mb-1">
            <h3 className="text-lg font-medium">
              {profileData?.user.name || "Загрузка..."}
            </h3>
            <p className="text-sm text-gray-500">
              {profileData?.user.phone || "Загрузка..."}
            </p>
            <p className="text-sm text-gray-500">
              {profileData?.user.email || "Загрузка..."}
            </p>
            <br />
          </div>

          {/* Баланс */}
          <div
            className={`${getItemStyle(
              "balance"
            )} bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)] rounded-[25px] h-[70px] px-6 py-3 mb-4 text-white flex flex-col justify-between cursor-pointer`}
            onClick={handleButtonClick("balance-topup", "balance")}
          >
            <div className="flex justify-between items-start">
              <span className="font-medium text-base pt-[10px]">
                {t("cabinet.balance")}
              </span>
              <span className="font-medium text-base">
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
            )} p-6 mb-4 h-[70px] cursor-pointer dark:bg-[#333333]`}
            onClick={handleButtonClick("balance-history", "balance-statement")}
          >
            <div className="flex justify-between items-center">
              <span>{t("cabinet.balance.statement")}</span>
              <ChevronRight className="h-6 w-6 text-black dark:text-white" />
            </div>
          </div>

          {/* Бонусы */}
          <div
            className={`${getItemStyle(
              "bonuses"
            )} h-[70px] px-6 pt-4 pb-2 mb-4 flex flex-col justify-between cursor-pointer dark:bg-[#333333]`}
            onClick={handleButtonClick("bonus-exchange", "bonuses")}
          >
            <div className="flex justify-between items-start">
              <span className="text-base pt-2 text-[#020817] dark:text-white">
                {t("cabinet.bonuses")}
              </span>
              <span className="text-base text-[#020817] dark:text-white">
                {profileData?.user.bonuses || "0 баллов"}
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
            )} p-6 mb-4 h-[70px] cursor-pointer dark:bg-[#333333]`}
            onClick={handleButtonClick("bonus-statement", "bonus-statement")}
          >
            <div className="flex justify-between items-center">
              <span>{t("cabinet.bonus.statement")}</span>
              <ChevronRight className="h-6 w-6 text-black dark:text-white" />
            </div>
          </div>

          {/* Выписка по рефералам */}
          <div
            className={`${getItemStyle(
              "referral-statement"
            )} p-6 mb-4 h-[70px] cursor-pointer dark:bg-[#333333]`}
            onClick={handleButtonClick(
              "referral-statement",
              "referral-statement"
            )}
          >
            <div className="flex justify-between items-center">
              <span>{t("cabinet.referral.statement")}</span>
              <ChevronRight className="h-6 w-6 text-black dark:text-white" />
            </div>
          </div>

          {/* Тариф */}
          <div
            className={`${getItemStyle(
              "tariff"
            )} h-[70px] px-6 pt-4 mb-4 flex flex-col justify-between cursor-pointer dark:bg-[#333333]`}
            onClick={handleButtonClick("tariff", "tariff")}
          >
            <div className="flex justify-between items-center">
              <span className="pb-[10px]">{t("cabinet.tariff")}</span>
              <div className="flex flex-col items-end gap-2">
                <span className="text-gray-800 dark:text-white">
                  {profileData?.user.tariff || `«${getTranslatedTariffName()}»`}
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
            <div
              className={`${getItemStyle(
                "language"
              )} h-[70px] p-4 flex justify-between items-center cursor-pointer dark:bg-[#333333]`}
              onClick={handleButtonClick("language", "language")}
            >
              <span className="text-base ml-2">{t("cabinet.language")}</span>
              <div className="bg-gray-100 rounded-[25px] p-1 flex dark:bg-[#4D4D4D]">
                <button
                  className={`px-3 py-2 rounded-[20px] text-sm transition-all ${
                    language === "kz"
                      ? "bg-white text-blue-600 font-medium shadow-md dark:bg-gray-900 dark:text-white"
                      : "text-gray-500"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLanguage("kz");
                  }}
                >
                  Каз.
                </button>
                <button
                  className={`px-3 py-2 rounded-[20px] text-sm transition-all ${
                    language === "ru"
                      ? "bg-white text-blue-600 font-medium shadow-md dark:bg-gray-900 dark:text-white"
                      : "text-gray-500"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLanguage("ru");
                  }}
                >
                  Рус.
                </button>
                <button
                  className={`px-3 py-2 rounded-[20px] text-sm transition-all ${
                    language === "en"
                      ? "bg-white text-blue-600 font-medium shadow-md dark:bg-gray-900 dark:text-white"
                      : "text-gray-500"
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
            {/* Shadow effect */}
            <div className="absolute inset-0 rounded-[40px] shadow-md -z-10"></div>
          </div>

          {/* Тема - обновленный стиль */}
          <div className="relative mb-4">
            <div
              className={`${getItemStyle(
                "theme"
              )} h-[70px] p-4 flex justify-between items-center cursor-pointer dark:bg-[#333333]`}
              onClick={handleButtonClick("theme", "theme")}
            >
              <span className="text-base ml-2">{t("cabinet.theme")}</span>
              <div className="bg-gray-100 rounded-[25px] p-1 flex dark:bg-[#4D4D4D]">
                <button
                  className={`px-3 py-2 rounded-[20px] flex items-center transition-all ${
                    theme === "light"
                      ? "bg-white text-blue-600 shadow-md"
                      : "text-gray-500"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTheme("light");
                  }}
                >
                  <Sun className="h-4 w-4 mr-1" />
                  <span className="text-sm">{t("cabinet.theme.light")}</span>
                </button>
                <button
                  className={`px-3 py-2 rounded-[20px] flex items-center transition-all ${
                    theme === "dark"
                      ? "bg-white text-blue-600 shadow-md dark:text-white dark:bg-gray-900"
                      : "text-gray-500"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTheme("dark");
                  }}
                >
                  <Moon className="h-4 w-4 mr-1" />
                  <span className="text-sm">{t("cabinet.theme.dark")}</span>
                </button>
              </div>
            </div>
            {/* Shadow effect */}
            <div className="absolute inset-0 rounded-[40px] shadow-md -z-10"></div>
          </div>

          {/* Активные устройства */}
          <div
            className={`${getItemStyle(
              "active-devices"
            )} h-[70px] p-6 mb-4 cursor-pointer dark:bg-[#333333]`}
            onClick={handleButtonClick("active-devices", "active-devices")}
          >
            <div className="flex justify-between items-center">
              <span>{t("cabinet.active.devices")}</span>
              <ChevronRight className="h-6 w-6 text-black dark:text-white" />
            </div>
          </div>

          {/* Удалить аккаунт */}
          <div
            className={`${getItemStyle(
              "delete-account"
            )} h-[70px] p-6 mb-4 cursor-pointer dark:bg-[#333333]`}
            onClick={handleButtonClick("delete-account", "delete-account")}
          >
            <div className="flex justify-between items-center">
              <span className="text-red-500">
                {t("cabinet.delete.account")}
              </span>
              <ChevronRight className="h-6 w-6 text-black dark:text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
