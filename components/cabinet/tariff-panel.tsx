"use client";

import { useState, useEffect } from "react";
import {
  X,
  ArrowLeft,
  CheckCircle,
  CircleIcon as ExclamationCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { notification } from "antd";
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
    // Keep other translations that might be needed, but remove the tariff titles and descriptions
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
      return "kk";
    case "ru":
    default:
      return "ru-RU";
  }
};

// Функция для форматирования даты с учетом языка
const formatDateByLanguage = (dateString: string, language: string): string => {
  const date = new Date(dateString);

  if (language === "kz") {
    const day = date.getDate().toString().padStart(2, "0");
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

  return date.toLocaleDateString(getLocaleByLanguage(language), {
    day: "2-digit",
    month: "long",
  });
};
// Функция для удаления всех типов кавычек из текста
const removeQuotes = (text: string): string => {
  return text.replace(/[«»""'']/g, "");
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

  // Initialize notification API
  const [api, contextHolder] = notification.useNotification();

  // Функция для показа уведомлений с Ant Design
  const showNotification = (
    type: "success" | "error" | "info" | "warning",
    title: string,
    description: string
  ) => {
    const config = {
      message: title,
      description: description,
      placement: "topRight" as const,
      duration: 4.5,
      style: {
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      },
    };

    switch (type) {
      case "success":
        api.success({
          ...config,
          icon: <CheckCircle className="text-green-500" />,
          style: {
            ...config.style,
            borderLeft: "4px solid #52c41a",
          },
        });
        break;
      case "error":
        api.error({
          ...config,
          icon: <ExclamationCircle className="text-red-500" />,
          style: {
            ...config.style,
            borderLeft: "4px solid #ff4d4f",
          },
        });
        break;
      case "info":
        api.info({
          ...config,
          style: {
            ...config.style,
            borderLeft: "4px solid #1890ff",
          },
        });
        break;
      case "warning":
        api.warning({
          ...config,
          icon: <ExclamationCircle className="text-yellow-500" />,
          style: {
            ...config.style,
            borderLeft: "4px solid #faad14",
          },
        });
        break;
    }
  };

  // Функция для перевода динамического контента из API
  const translateApiContent = (text: string): string => {
    if (!text) return text;

    // For tariff titles and descriptions, just return the text directly
    // as we'll use what comes from the API
    return text;
  };

  useEffect(() => {
    if (tariffsData?.tariff) {
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

      // Автоматически включаем автосписание при подключении нового тарифа
      try {
        await reconnectTariff({
          auto_reconnect: true,
        }).unwrap();

        setAutoRenewal(true);
      } catch (autoRenewalError) {
        console.warn(
          "Не удалось автоматически включить автосписание:",
          autoRenewalError
        );
      }

      // Показываем уведомление об успехе с Ant Design
      showNotification("success", t("success"), t("tariff.buy.success"));
    } catch (error) {
      // Показываем уведомление об ошибке с Ant Design
      showNotification("error", t("common.error"), t("tariff.switch.error"));
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
      setAutoRenewalAction("enable");
      setShowAutoRenewalModal(true);
    } else {
      setAutoRenewalAction("disable");
      setShowAutoRenewalModal(true);
    }
  };

  const handleAutoRenewalChange = async (enabled: boolean) => {
    try {
      await reconnectTariff({
        auto_reconnect: enabled,
      }).unwrap();

      setAutoRenewal(enabled);

      // Показываем уведомление об изменении автопродления с Ant Design
      showNotification(
        "success",
        t("success"),
        enabled
          ? t("tariff.auto.renewal.enabled")
          : t("tariff.auto.renewal.disabled")
      );
    } catch (error) {
      // Показываем уведомление об ошибке с Ant Design
      showNotification(
        "error",
        t("common.error"),
        t("tariff.auto.renewal.error")
      );
    }
  };

  const confirmAutoRenewal = () => {
    setShowAutoRenewalModal(false);
    handleAutoRenewalChange(autoRenewalAction === "enable");
  };

  const cancelAutoRenewal = () => {
    setShowAutoRenewalModal(false);
  };
  const getTariffGradientStyle = (tariff: {
    b_start_color: string;
    b_end_color: string;
  }) => ({
    background: `linear-gradient(90deg, ${tariff.b_start_color}, ${tariff.b_end_color})`,
  });

  // Get gradient class based on tariff ID

  // Mobile view
  if (isMobile) {
    return (
      <div className="h-full flex flex-col justify-start bg-white dark:bg-[#404040]">
        {/* Ant Design notification context */}
        {contextHolder}

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
          <div className="w-5"></div>
        </div>

        <div className="flex-1 p-4 pt-0 max-w-md mx-auto w-full">
          {/* Current tariff */}
          {isLoadingTariffs ? (
            <div className="mb-6 bg-gray-100 p-4 border rounded-3xl dark:bg-[#2C2B2B] dark:border-none">
              <p>{t("common.loading")}</p>
            </div>
          ) : tariffsData?.tariff ? (
            <div className="mb-6 bg-gray-100 p-4 border rounded-3xl dark:bg-[#2C2B2B] dark:border-none">
              <div className="mb-3">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-gray-600 dark:text-white text-sm">
                    {t("tariff.my")}
                  </span>
                  <span className="font-bold text-lg">
                    «{removeQuotes(tariffsData.tariff.title)}»
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-white space-y-1">
                  <p>
                    {t("tariff.analysis.remaining")}{" "}
                    {tariffsData.tariff.analyses} {t("tariff.pieces")}.
                  </p>
                  <p>
                    {t("tariff.description.remaining")}{" "}
                    {tariffsData.tariff.descriptions} {t("tariff.pieces")}.
                  </p>
                  <p>
                    {t("tariff.next.payment")}{" "}
                    {formatDateByLanguage(
                      tariffsData.tariff.end_time,
                      language
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-gray-100 p-4 border rounded-3xl dark:bg-[#2C2B2B] dark:border-none">
              <p>{t("error.loading.tariffs")}</p>
            </div>
          )}

          {/* Auto-renewal toggle */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-white font-medium">
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
                const isCurrent = tariffsData?.tariff?.id === apiTariff.id;

                return (
                  <div
                    key={apiTariff.id}
                    className={`rounded-3xl overflow-hidden ${
                      expandedTariff === tariffId ? "shadow-lg" : "shadow-sm"
                    }`}
                    style={getTariffGradientStyle(apiTariff)}
                    onClick={() => handleTariffClick(tariffId)}
                  >
                    {expandedTariff === tariffId ? (
                      // Expanded view
                      <div className="text-white p-6">
                        <h3 className="text-2xl font-bold mb-2">
                          {apiTariff.title}
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
                          {apiTariff.description
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
                          «{removeQuotes(apiTariff.title)}»
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
                  {getTariffById(tariffToSwitch).name}?
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
      {/* Ant Design notification context */}
      {contextHolder}

      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
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
                <div className="flex-1">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-gray-600 dark:text-white text-sm">
                      {t("tariff.my")}
                    </span>
                    <span className="font-bold text-lg">
                      «{removeQuotes(tariffsData.tariff.title)}»
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-white space-y-1">
                    <p>
                      {t("tariff.analysis.remaining")}{" "}
                      {tariffsData.tariff.analyses} {t("tariff.pieces")}.
                    </p>
                    <p>
                      {t("tariff.description.remaining")}{" "}
                      {tariffsData.tariff.descriptions} {t("tariff.pieces")}.
                    </p>
                    <p>
                      {t("tariff.next.payment")}{" "}
                      {formatDateByLanguage(
                        tariffsData.tariff.end_time,
                        language
                      )}
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
                const isCurrent = tariffsData?.tariff?.id === apiTariff.id;

                return (
                  <div
                    key={apiTariff.id}
                    className="rounded-3xl overflow-hidden shadow-sm"
                    style={getTariffGradientStyle(apiTariff)}
                  >
                    <div className="p-4 text-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">
                            «{removeQuotes(apiTariff.title)}»
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
                          {apiTariff.description
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
                  {getTariffById(tariffToSwitch).name}?
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
