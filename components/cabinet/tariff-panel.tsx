"use client";

import { useState, useEffect } from "react";
import { X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";

import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  useBuyTariffMutation,
  useGetTariffsQuery,
  useReconnectTariffMutation,
} from "@/store/services/main";
import { useTariff, mapApiIdToComponentId } from "../provider/tariff-provider";
import { useLanguage } from "../provider/language-provider";

// API translations for dynamic content
const apiTranslations: Record<string, { en: string; kz: string; ru: string }> =
  {
    "«Селлер»": {
      en: "«Seller»",
      kz: "«Селлер»",
      ru: "«Селлер»",
    },
    "«Менеджер»": {
      en: "«Manager»",
      kz: "«Менеджер»",
      ru: "«Менеджер»",
    },
    "«Премиум»": {
      en: "«Premium»",
      kz: "«Премиум»",
      ru: "«Премиум»",
    },
    'При своевременной оплате абонентской платы или переподключении тарифа 50% бонусов сохраняются, остатки трафика не сохраняются.\n\nПри переходе на тариф "Селлер" бонусы не сохраняются.\n\nПри переходе на тариф "Премиум" 100% бонусов сохраняются.\n\nАбонентская плата бонусами не оплачивается.\n\nПодписку можно активировать или приостановить в личном кабинете на странице тарифы с помощью переключателя «Автосписание».':
      {
        en: "With timely payment of the subscription fee or tariff reconnection, 50% of bonuses are retained, remaining traffic is not preserved.\n\nWhen switching to the 'Seller' tariff, bonuses are not retained.\n\nWhen switching to the 'Premium' tariff, 100% of bonuses are retained.\n\nThe subscription fee cannot be paid with bonuses.\n\nThe subscription can be activated or paused in the personal account on the tariffs page using the 'Auto-renewal' toggle.",
        kz: 'Абоненттік төлемді уақытында төлегенде немесе тарифті қайта қосқанда бонустардың 50%-ы сақталады, қалған трафик сақталмайды.\n\n"Сатушы" тарифіне ауысқанда бонустар сақталмайды.\n\n"Премиум" тарифіне ауысқанда бонустардың 100%-ы сақталады.\n\nАбоненттік төлем бонустармен төленбейді.\n\nЖазылымды жеке кабинетте тарифтер бетінде «Автотізімнен шығару» ауыстырып-қосқышы арқылы белсендіруге немесе тоқтатуға болады.',
        ru: 'При своевременной оплате абонентской платы или переподключении тарифа 50% бонусов сохраняются, остатки трафика не сохраняются.\nПри переходе на тариф "Селлер" бонусы не сохраняются.\nПри переходе на тариф "Премиум" 100% бонусов сохраняются.\nАбонентская плата бонусами не оплачивается.\nПодписку можно активировать или приостановить в личном кабинете на странице тарифы с помощью переключателя «Автосписание».',
      },
    'При своевременной оплате абонентской платы или переподключении 100% бонусов сохраняются, остатки трафика не сохраняются.\n\nПри переходе на тариф "Селлер" или "Менеджер" бонусы не сохраняются.\n\nАбонентская плата бонусами не оплачивается.\n\nПодписку можно активировать или приостановить в личном кабинете на странице тарифы с помощью переключателя «Автосписание».':
      {
        en: "With timely payment of the subscription fee or reconnection, 100% of bonuses are retained, remaining traffic is not preserved.\n\nWhen switching to the 'Seller' or 'Manager' tariff, bonuses are not retained.\n\nThe subscription fee cannot be paid with bonuses.\n\nThe subscription can be activated or paused in the personal account on the tariffs page using the 'Auto-renewal' toggle.",
        kz: 'Абоненттік төлемді уақытында төлегенде немесе қайта қосқанда бонустардың 100%-ы сақталады, қалған трафик сақталмайды.\n\n"Сатушы" немесе "Менеджер" тарифіне ауысқанда бонустар сақталмайды.\n\nАбоненттік төлем бонустармен төленбейді.\n\nЖазылымды жеке кабинетте тарифтер бетінде «Автотізімнен шығару» ауыстырып-қосқышы арқылы белсендіруге немесе тоқтатуға болады.',
        ru: 'При своевременной оплате абонентской платы или переподключении 100% бонусов сохраняются, остатки трафика не сохраняются.\nПри переходе на тариф "Селлер" или "Менеджер" бонусы не сохраняются.\nАбонентская плата бонусами не оплачивается.\nПодписку можно активировать или приостановить в личном кабинете на странице тарифы с помощью переключателя «Автосписание».',
      },
    'При переподключении тарифа остатки трафика и бонусы не сохраняются.\n\nПри переходе на тариф "Менеджер" 50% бонусов сохраняются.\n\nПри переходе на тариф "Премиум" 100% бонусов сохраняются.\n\nАбонентская плата бонусами не оплачивается.\n\nПодписку можно активировать или приостановить в личном кабинете на странице тарифы с помощью переключателя «Автосписание».':
      {
        en: "When reconnecting to the tariff, remaining traffic and bonuses are not preserved.\n\nWhen switching to the 'Manager' tariff, 50% of bonuses are retained.\n\nWhen switching to the 'Premium' tariff, 100% of bonuses are retained.\n\nThe subscription fee cannot be paid with bonuses.\n\nThe subscription can be activated or paused in the personal account on the tariffs page using the 'Auto-renewal' toggle.",
        kz: 'Тарифті қайта қосқанда қалған трафик пен бонустар сақталмайды.\n\n"Менеджер" тарифіне ауысқанда бонустардың 50%-ы сақталады.\n\n"Премиум" тарифіне ауысқанда бонустардың 100%-ы сақталады.\n\nАбоненттік төлем бонустармен төленбейді.\n\nЖазылымды жеке кабинетте тарифтер бетінде «Автотізімнен шығару» ауыстырып-қосқышы арқылы белсендіруге немесе тоқтатуға болады.',
        ru: 'При переподключении тарифа остатки трафика и бонусы не сохраняются.\nПри переходе на тариф "Менеджер" 50% бонусов сохраняются.\nПри переходе на тариф "Премиум" 100% бонусов сохраняются.\nАбонентская плата бонусами не оплачивается.\nПодписку можно активировать или приостановить в личном кабинете на странице тарифы с помощью переключателя «Автосписание».',
      },
  };

const mapComponentIdToApiId = (componentId: string): number => {
  switch (componentId) {
    case "seller":
      return 1;
    case "manager":
      return 2;
    case "premium":
      return 3;
    default:
      return 1;
  }
};

interface TariffPanelProps {
  onClose: () => void;
}

// Функция для получения локали в зависимости от языка
const getLocaleByLanguage = (lang: string): string => {
  switch (lang) {
    case "en":
      return "en-US";
    case "kz":
      return "kk"; // Используем просто "kk" для лучшей поддержки
    case "ru":
    default:
      return "ru-RU";
  }
};

// Функция для форматирования даты с учетом языка
const formatDateByLanguage = (dateString: string, language: string): string => {
  const date = new Date(dateString);

  // Если язык казахский, используем собственное форматирование
  if (language === "kz") {
    const day = date.getDate().toString().padStart(2, "0");

    // Массив месяцев на казахском
    const kazMonths = [
      "қаңтар",
      "ақпан",
      "наурыз",
      "сәуір",
      "мамыр",
      "маусым",
      "шілде",
      "тамыз",
      "қыркүйек",
      "қазан",
      "қараша",
      "желтоқсан",
    ];

    const month = kazMonths[date.getMonth()];
    return `${day} ${month}`;
  }

  // Для других языков используем стандартное форматирование
  return date.toLocaleDateString(getLocaleByLanguage(language), {
    day: "2-digit",
    month: "long",
  });
};

export function TariffPanel({ onClose }: TariffPanelProps) {
  const { language, t } = useLanguage();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const {
    currentTariff,
    getTariffById,
    analysisRemaining,
    descriptionRemaining,
    nextPaymentDate,
  } = useTariff();
  const [expandedTariff, setExpandedTariff] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [tariffToSwitch, setTariffToSwitch] = useState<string | null>(null);
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [showAutoRenewalModal, setShowAutoRenewalModal] = useState(false);
  const [autoRenewalAction, setAutoRenewalAction] = useState<
    "enable" | "disable"
  >("enable");

  const {
    data: tariffsData,
    isLoading: isLoadingTariffs,
    error: tariffsError,
  } = useGetTariffsQuery();

  // Mutations
  const [reconnectTariff, { isLoading: isReconnecting }] =
    useReconnectTariffMutation();
  const [buyTariff, { isLoading: isBuying }] = useBuyTariffMutation();

  // Функция для перевода динамического контента из API
  const translateApiContent = (text: string): string => {
    if (!text) return text;

    // Проверяем, есть ли точное совпадение для этого текста
    if (apiTranslations[text]) {
      return apiTranslations[text][language] || text;
    }

    // Если точного совпадения нет, ищем частичное совпадение
    // Это может помочь, если текст с API немного отличается (например, разные пробелы или переносы строк)
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

  useEffect(() => {
    if (tariffsData?.tariff) {
      // Устанавливаем состояние переключателя на основе данных с сервера
      setAutoRenewal(tariffsData.tariff.auto_reconnect);
    }
  }, [tariffsData]);

  // Handle tariff click (mobile only)
  const handleTariffClick = (tariffId: string) => {
    if (isMobile) {
      if (expandedTariff === tariffId) {
        setExpandedTariff(null);
      } else {
        setExpandedTariff(tariffId);
      }
    }
  };

  // Handle switch button click
  const handleSwitchClick = (tariffId: string) => {
    setTariffToSwitch(tariffId);
    setShowConfirmModal(true);
  };

  // Handle confirm switch
  const handleConfirmSwitch = async () => {
    if (!tariffToSwitch) {
      setShowConfirmModal(false);
      return;
    }

    setShowConfirmModal(false);

    try {
      const apiId = mapComponentIdToApiId(tariffToSwitch);
      const selectedTariff = tariffsData?.tariffs.find((t) => t.id === apiId);

      if (!selectedTariff) {
        throw new Error("Тариф не найден");
      }

      // Отправляем запрос на покупку тарифа
      await buyTariff({
        price: selectedTariff.final_price,
        id: apiId,
      }).unwrap();

      toast({
        title: t("success"),
        description: t("tariff.buy.success"),
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("tariff.switch.error"),
        variant: "destructive",
      });
    }

    setTariffToSwitch(null);
  };

  // Handle cancel switch
  const handleCancelSwitch = () => {
    setShowConfirmModal(false);
    setTariffToSwitch(null);
  };

  const handleAutoRenewalToggle = () => {
    if (!autoRenewal) {
      // Если автопродление выключено, показываем модальное окно для включения
      setAutoRenewalAction("enable");
      setShowAutoRenewalModal(true);
    } else {
      // Если автопродление включено, показываем модальное окно для выключения
      setAutoRenewalAction("disable");
      setShowAutoRenewalModal(true);
    }
  };

  const handleAutoRenewalChange = async (enabled: boolean) => {
    try {
      // Отправляем запрос на изменение статуса автосписания
      await reconnectTariff({
        auto_reconnect: enabled,
      }).unwrap();

      setAutoRenewal(enabled);

      toast({
        title: t("success"),
        description: enabled
          ? t("tariff.auto.renewal.enabled")
          : t("tariff.auto.renewal.disabled"),
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("tariff.auto.renewal.error"),
        variant: "destructive",
      });
    }
  };

  const confirmAutoRenewal = () => {
    setShowAutoRenewalModal(false);
    handleAutoRenewalChange(autoRenewalAction === "enable");
  };

  const cancelAutoRenewal = () => {
    setShowAutoRenewalModal(false);
  };

  // Get gradient class based on tariff ID
  const getTariffGradient = (tariffId: string) => {
    switch (tariffId) {
      case "seller":
        return "bg-gradient-to-r from-[#26CBFF] to-[#0083AC]   ";
      case "manager":
        return "bg-gradient-to-r from-[rgba(0,131,172,0.71)] to-[#3460D1]  ";
      case "premium":
        return "bg-gradient-to-r from-[#2663FF] to-[#0B3CBB]  ";
      default:
        return "bg-gradient-to-r from-[#26CBFF] to-[#0083AC] ";
    }
  };

  // Mobile view
  if (isMobile) {
    return (
      <div className="h-full flex flex-col justify-start bg-white dark:bg-[#404040]">
        {/* Add Toaster component to ensure toasts are displayed */}
        <Toaster />

        {/* Header with back button and centered "Личный кабинет" text */}
        <div className="flex items-center justify-between p-4 relative">
          <button
            onClick={onClose}
            className="p-1 absolute left-4"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 dark:text-blue-600" />
          </button>
          <div className="flex-1 text-center pl-4">
            <div className="text-[#4361EE] font-medium text-xl">
              {t("common.cabinet")}
            </div>
          </div>
          <div className="w-5"></div> {/* Empty div for balanced spacing */}
        </div>

        <div className="flex-1 p-4 pt-0 max-w-md mx-auto w-full">
          {/* Current tariff */}
          {isLoadingTariffs ? (
            <div className="mb-6 bg-gray-100 p-4 border rounded-3xl dark:bg-[#2C2B2B] dark:border-none">
              <p>{t("common.loading")}</p>
            </div>
          ) : tariffsData?.tariff ? (
            <div className="mb-6 bg-gray-100 p-4 border rounded-3xl dark:bg-[#2C2B2B] dark:border-none">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <div className="mb-1">
                    <span className="text-gray-600 dark:text-white">
                      {t("tariff.my")}
                    </span>
                    <span className="font-bold text-lg ml-2">
                      {translateApiContent(tariffsData.tariff.title)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-white">
                    <p>
                      {t("tariff.next.payment")}{" "}
                      {formatDateByLanguage(
                        tariffsData.tariff.end_time,
                        language
                      )}
                    </p>
                    <p>
                      {t("tariff.analysis.remaining")}{" "}
                      {tariffsData.tariff.analyses} {t("tariff.pieces")}.
                    </p>
                    <p>
                      {t("tariff.description.remaining")}{" "}
                      {tariffsData.tariff.descriptions} {t("tariff.pieces")}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-gray-100 p-4 border rounded-3xl dark:bg-[#2C2B2B] dark:border-none">
              <p>{t("error.loading.tariffs")}</p>
            </div>
          )}

          {/* Auto-renewal toggle */}
          <div className="flex items-center justify-between mt-8 mb-6">
            <span className="text-gray-600 dark:text-white">
              {t("tariff.auto.renewal")}
            </span>
            <div
              className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                autoRenewal ? "bg-[#4361EE]" : "bg-gray-300"
              }`}
              onClick={handleAutoRenewalToggle}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  autoRenewal ? "translate-x-6" : ""
                }`}
              />
            </div>
          </div>

          {/* Tariff list */}
          {isLoadingTariffs ? (
            <div className="flex justify-center py-8">
              <p>{t("common.loading")}</p>
            </div>
          ) : tariffsError ? (
            <div className="flex justify-center py-8">
              <p>{t("error.loading.tariffs")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tariffsData?.tariffs.map((apiTariff) => {
                const tariffId = mapApiIdToComponentId(apiTariff.id);
                // Проверяем, является ли этот тариф текущим
                const isCurrent = tariffsData?.tariff?.id === apiTariff.id;

                return (
                  <div
                    key={apiTariff.id}
                    className={`rounded-3xl overflow-hidden ${getTariffGradient(
                      tariffId
                    )} ${
                      expandedTariff === tariffId ? "shadow-lg" : "shadow-sm"
                    }`}
                    onClick={() => handleTariffClick(tariffId)}
                  >
                    {expandedTariff === tariffId ? (
                      // Expanded view
                      <div className="text-white p-6">
                        <h3 className="text-2xl font-bold mb-2">
                          {translateApiContent(apiTariff.title)}
                        </h3>
                        <div className="mb-4">
                          <p className="mb-1">
                            {t("tariff.monthly.fee")}{" "}
                            <span className="font-bold">
                              {apiTariff.final_price} {apiTariff.currency}
                            </span>
                          </p>
                          <p className="mb-1">
                            {t("tariff.analysis.count")}{" "}
                            <span className="font-bold">
                              {apiTariff.analyses} {t("tariff.pieces")}.
                            </span>
                          </p>
                          <p className="mb-1">
                            {t("tariff.description.count")}{" "}
                            <span className="font-bold">
                              {apiTariff.descriptions} {t("tariff.pieces")}.
                            </span>
                          </p>
                        </div>

                        <div className="text-sm mb-6">
                          {translateApiContent(apiTariff.description)
                            .split("\n\n")
                            .map((detail, index) => (
                              <p key={index} className="mb-1">
                                {detail}
                              </p>
                            ))}
                        </div>

                        <Button
                          className="bg-gradient-to-t from-[#0d52ff] to-[rgba(11,60,187,1)] text-white rounded-full px-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSwitchClick(tariffId);
                          }}
                          disabled={isBuying || isReconnecting}
                        >
                          {isCurrent
                            ? t("tariff.reconnect")
                            : t("tariff.switch")}
                        </Button>
                      </div>
                    ) : (
                      // Collapsed view
                      <div className="text-white p-5">
                        <h3 className="text-2xl font-bold mb-2">
                          {translateApiContent(apiTariff.title)}
                        </h3>
                        <p className="text-sm">
                          {t("tariff.monthly.fee")} {apiTariff.final_price}{" "}
                          {apiTariff.currency}
                        </p>
                        <p className="text-sm">
                          {t("tariff.analysis.count")} {apiTariff.analyses}{" "}
                          {t("tariff.pieces")}.
                        </p>
                        <p className="text-sm">
                          {t("tariff.description.count")}{" "}
                          {apiTariff.descriptions} {t("tariff.pieces")}.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Confirmation modal */}
        {showConfirmModal && tariffToSwitch && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-3xl">
            <div className="bg-white p-6 rounded-xl max-w-xs w-full mx-4 dark:bg-gray-800">
              <div className="text-center mb-6">
                <p className="text-lg">
                  {t("tariff.confirm.switch")}{" "}
                  {translateApiContent(getTariffById(tariffToSwitch).name)}?
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  className="bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)] border border-white text-white rounded-full py-3"
                  onClick={handleConfirmSwitch}
                >
                  {tariffsData?.tariff &&
                  mapApiIdToComponentId(tariffsData.tariff.id) ===
                    tariffToSwitch
                    ? t("tariff.reconnect")
                    : t("tariff.connect")}
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 rounded-full py-3 dark:bg-gray-400 dark:text-white"
                  onClick={handleCancelSwitch}
                >
                  {t("tariff.cancel")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {showAutoRenewalModal && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-3xl">
            <div className="bg-white p-6 rounded-xl max-w-xs w-full mx-4 dark:bg-gray-800">
              <div className="text-center mb-6">
                <p className="text-lg">
                  {t(
                    autoRenewalAction === "enable"
                      ? "tariff.auto.renewal.confirm.enable"
                      : "tariff.auto.renewal.confirm.disable"
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  className="bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)] border border-white text-white rounded-full py-3"
                  onClick={confirmAutoRenewal}
                >
                  {t("tariff.confirm")}
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 rounded-full py-3 dark:text-white dark:bg-gray-400"
                  onClick={cancelAutoRenewal}
                >
                  {t("tariff.cancel")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <div className="bg-white w-full dark:bg-[#404040]">
      {/* Add Toaster component to ensure toasts are displayed */}
      <Toaster />

      <div className="max-w-3xl mx-auto p-6">
        {/* Header - now with black text and no blue background */}
        <div className="flex items-center justify-center relative mb-6">
          <h2 className="text-lg font-medium text-black dark:text-white">
            {t("cabinet.title")}
          </h2>
          <button
            onClick={onClose}
            className="absolute right-0 top-0 p-1"
            aria-label="Close"
          >
            <X className="h-5 w-5 dark:text-blue-600" />
          </button>
        </div>

        <div className="w-full">
          {/* Current tariff */}
          {isLoadingTariffs ? (
            <div className="mb-6 bg-gray-100 p-4 border rounded-3xl dark:bg-[#2C2B2B] dark:border-none">
              <p>{t("common.loading")}</p>
            </div>
          ) : tariffsData?.tariff ? (
            <div className="mb-6 bg-gray-100 p-4 border rounded-3xl dark:bg-[#2C2B2B] dark:border-none">
              <div className="flex justify-between items-start">
                <div>
                  <div className="mb-1">
                    <span className="text-gray-600 dark:text-white">
                      {t("tariff.my")}
                    </span>
                    <span className="font-bold text-lg ml-2">
                      {translateApiContent(tariffsData.tariff.title)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-white">
                    <p>
                      {t("tariff.next.payment")}{" "}
                      {formatDateByLanguage(
                        tariffsData.tariff.end_time,
                        language
                      )}
                    </p>
                    <p>
                      {t("tariff.analysis.remaining")}{" "}
                      {tariffsData.tariff.analyses} {t("tariff.pieces")}.
                    </p>
                    <p>
                      {t("tariff.description.remaining")}{" "}
                      {tariffsData.tariff.descriptions} {t("tariff.pieces")}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-gray-100 p-4 border rounded-3xl dark:bg-[#2C2B2B] dark:border-none">
              <p>{t("error.loading.tariffs")}</p>
            </div>
          )}

          {/* Auto-renewal toggle */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600 dark:text-white">
              {t("tariff.auto.renewal")}
            </span>
            <div
              className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                autoRenewal ? "bg-[#4361EE]" : "bg-gray-300"
              }`}
              onClick={handleAutoRenewalToggle}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  autoRenewal ? "translate-x-6" : ""
                }`}
              />
            </div>
          </div>

          {/* Tariff list */}
          {isLoadingTariffs ? (
            <div className="flex justify-center py-8">
              <p>{t("common.loading")}</p>
            </div>
          ) : tariffsError ? (
            <div className="flex justify-center py-8">
              <p>{t("error.loading.tariffs")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tariffsData?.tariffs.map((apiTariff) => {
                const tariffId = mapApiIdToComponentId(apiTariff.id);
                // Проверяем, является ли этот тариф текущим
                const isCurrent = tariffsData?.tariff?.id === apiTariff.id;

                return (
                  <div
                    key={apiTariff.id}
                    className={`rounded-3xl overflow-hidden ${getTariffGradient(
                      tariffId
                    )} shadow-sm`}
                  >
                    <div className="p-4 text-white ">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">
                            {translateApiContent(apiTariff.title)}
                          </h3>
                          <p className="text-sm">
                            {t("tariff.monthly.fee")} {apiTariff.final_price}{" "}
                            {apiTariff.currency}
                          </p>
                          <p className="text-sm">
                            {t("tariff.analysis.count")} {apiTariff.analyses}{" "}
                            {t("tariff.pieces")}.
                          </p>
                          <p className="text-sm">
                            {t("tariff.description.count")}{" "}
                            {apiTariff.descriptions} {t("tariff.pieces")}.
                          </p>
                        </div>
                        <div className="text-sm max-w-[50%]">
                          {translateApiContent(apiTariff.description)
                            .split("\n")
                            .map((detail, index) => (
                              <p key={index} className="mb-1">
                                {detail}
                              </p>
                            ))}
                        </div>
                      </div>
                      <div className="mt-2 text-right">
                        <button
                          className="bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)] text-white px-6 py-2 border border-white rounded-full text-sm"
                          onClick={() => handleSwitchClick(tariffId)}
                          disabled={isBuying || isReconnecting}
                        >
                          {isCurrent
                            ? t("tariff.reconnect")
                            : t("tariff.switch")}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirmation modal */}
        {showConfirmModal && tariffToSwitch && (
          <div className="absolute pb-32 inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-3xl mt-7">
            <div className="bg-white p-6 rounded-xl max-w-xs w-full mx-4 dark:bg-gray-800">
              <div className="text-center mb-6">
                <p className="text-lg">
                  {t("tariff.confirm.switch")}{" "}
                  {translateApiContent(getTariffById(tariffToSwitch).name)}?
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  className="bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)] border border-white text-white rounded-full py-3"
                  onClick={handleConfirmSwitch}
                >
                  {tariffsData?.tariff &&
                  mapApiIdToComponentId(tariffsData.tariff.id) ===
                    tariffToSwitch
                    ? t("tariff.reconnect")
                    : t("tariff.connect")}
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 rounded-full py-3 dark:text-white dark:bg-gray-400"
                  onClick={handleCancelSwitch}
                >
                  {t("tariff.cancel")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {showAutoRenewalModal && (
          <div className="absolute pb-32 mt-7 inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-3xl">
            <div className="bg-white p-6 rounded-xl max-w-xs w-full mx-4 dark:bg-gray-800">
              <div className="text-center mb-6">
                <p className="text-lg">
                  {t(
                    autoRenewalAction === "enable"
                      ? "tariff.auto.renewal.confirm.enable"
                      : "tariff.auto.renewal.confirm.disable"
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  className="bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)] border border-white text-white rounded-full py-3"
                  onClick={confirmAutoRenewal}
                >
                  {t("tariff.confirm")}
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 rounded-full py-3 dark:text-white dark:bg-gray-400"
                  onClick={cancelAutoRenewal}
                >
                  {t("tariff.cancel")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
