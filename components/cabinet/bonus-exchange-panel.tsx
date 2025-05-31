"use client";

import { useState, useEffect } from "react";
import { X, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BonusExchangeConfirmModal } from "./bonus-exchange-confirm-modal";
import { BonusTransferConfirmModal } from "./bonus-transfer-confirm-modal";

import { useMediaQuery } from "@/hooks/use-media-query";
import { useLanguage } from "../provider/language-provider";
import {
  useGetBonusExchangeQuery,
  useExchangeBonusesMutation,
  useGetProfileQuery,
} from "../../store/services/main";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface BonusExchangePanelProps {
  onClose: () => void;
}

export function BonusExchangePanel({ onClose }: BonusExchangePanelProps) {
  const { t, language } = useLanguage();
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [showExchangeConfirm, setShowExchangeConfirm] = useState(false);
  const [showTransferCard, setShowTransferCard] = useState(false);
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);
  const [cardAdded, setCardAdded] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Fetch profile data
  const { data: profileData } = useGetProfileQuery();

  // Fetch bonus exchange data
  const {
    data: bonusExchangeData,
    isLoading,
    error,
  } = useGetBonusExchangeQuery();

  // Exchange bonuses mutation
  const [exchangeBonuses, { isLoading: isExchanging }] =
    useExchangeBonusesMutation();

  // Set default option when data is loaded
  useEffect(() => {
    if (bonusExchangeData?.bonuses_exchange?.length > 0) {
      setSelectedOptionId(bonusExchangeData.bonuses_exchange[0].id);
    }
  }, [bonusExchangeData]);

  const handleOptionChange = (optionId: number) => {
    setSelectedOptionId(optionId);
  };

  const handleExchangeClick = () => {
    if (!selectedOptionId) {
      toast({
        title: t("bonus.error"),
        description: t("bonus.exchange.error.option"),
        variant: "destructive",
      });
      return;
    }
    setShowExchangeConfirm(true);
  };

  const handleExchangeConfirm = async () => {
    setShowExchangeConfirm(false);

    if (!selectedOptionId) {
      toast({
        title: t("bonus.error"),
        description: t("bonus.exchange.error.option"),
        variant: "destructive",
      });
      return;
    }

    try {
      await exchangeBonuses({
        exchange_id: selectedOptionId,
      }).unwrap();

      toast({
        title: t("success"),
        description: t("bonus.exchange.success"),
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      toast({
        title: t("bonus.error"),
        description: t("bonus.exchange.error"),
        variant: "destructive",
      });
    }
  };

  const handleExchangeCancel = () => {
    setShowExchangeConfirm(false);
  };

  const handleAddCard = () => {
    setShowTransferCard(true);
  };

  const handleCardSubmit = () => {
    setShowTransferCard(false);
    setCardAdded(true);
    toast({
      title: t("success"),
      description: t("bonus.card.added.success"),
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-800",
    });
  };

  const handleTransferClick = () => {
    if (!bonusExchangeData?.transfer_enable) {
      toast({
        title: t("bonus.error"),
        description: t("bonus.transfer.disabled"),
        variant: "destructive",
      });
      return;
    }

    if (!cardAdded && !bonusExchangeData?.have_card) {
      toast({
        title: t("bonus.error"),
        description: t("bonus.card.required"),
        variant: "destructive",
      });
      return;
    }

    setShowTransferConfirm(true);
  };

  const handleTransferConfirm = () => {
    setShowTransferConfirm(false);
    // Here would be the logic to transfer bonuses
    toast({
      title: t("success"),
      description: t("bonus.transfer.success"),
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-800",
    });
    onClose();
  };

  const handleTransferCancel = () => {
    setShowTransferConfirm(false);
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

  return (
    <div className="h-full flex flex-col justify-start bg-white dark:bg-[#404040] px-4 md:px-0 relative">
      {/* Add Toaster component to ensure toasts are displayed */}
      <Toaster />

      {/* Header */}
      <div className="flex items-center justify-between">
        {isMobile ? (
          <>
            <button
              onClick={onClose}
              className="p-1 mt-3 mb-4"
              aria-label={t("common.back")}
            >
              <ArrowLeft className="h-5 w-5 dark:text-blue-600" />
            </button>
            <div className="flex-1 text-center">
              <h2 className="text-xl font-medium text-blue-600 mt-3 mb-4">
                {t("cabinet.title")}
              </h2>
            </div>
            <div className="w-5"></div> {/* Empty div for balanced spacing */}
          </>
        ) : (
          <>
            <div className="flex-1"></div>
            <button
              onClick={onClose}
              className="p-1"
              aria-label={t("common.close")}
            >
              <X className="h-5 w-5 dark:text-blue-600" />
            </button>
          </>
        )}
      </div>

      <div className="flex-1 pt-0 max-w-md mx-auto w-full px-2 md:px-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <p>{t("bonus.loading")}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-red-500">{t("bonus.error.loading")}</p>
          </div>
        ) : (
          <>
            {/* Bonus balance */}
            <div className="w-full border border-white dark:border-none bg-blue-600 py-5 rounded-[25px] text-base font-medium shadow-md p-4 mb-6 text-white text-center">
              <div className="flex justify-between items-center">
                <span className="text-sm">{t("bonus.balance")}</span>
                <span className="text-base font-bold">
                  {formatBonusPoints(profileData?.user.bonuses)}
                </span>
              </div>
            </div>

            {/* Bonus exchange options */}
            <div className="bg-gray-50 rounded-3xl p-6 shadow-md mb-4 border dark:bg-[#333333] dark:border-none">
              <div className="space-y-3">
                {bonusExchangeData?.bonuses_exchange.map((option) => (
                  <div key={option.id} className="flex items-start">
                    <div
                      className={`min-w-[16px] w-4 h-4 mt-0.5 mr-2 rounded-sm cursor-pointer flex-shrink-0 ${
                        selectedOptionId === option.id
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      }`}
                      onClick={() => handleOptionChange(option.id)}
                    ></div>
                    <span className="text-xs sm:text-sm">
                      {option.id === 1
                        ? t("bonus.exchange.all.analysis")
                        : option.id === 2
                        ? t("bonus.exchange.all.description")
                        : option.id === 3
                        ? t("bonus.exchange.all.both")
                        : option.title}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center text-xs text-gray-600 dark:text-white">
                {bonusExchangeData?.prices.map((price) => (
                  <p key={price.id}>
                    {price.id === 1
                      ? t("bonus.analysis.value")
                      : price.id === 2
                      ? t("bonus.description.value")
                      : `${price.title}: ${price.value} ${price.currency}`}
                  </p>
                ))}
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={handleExchangeClick}
                  disabled={isExchanging || !selectedOptionId}
                  className="w-32 bg-gradient-to-r shadow-md from-[#0d52ff] to-[rgba(11,60,187,1)] border border-white text-white rounded-full mt-4 text-sm"
                >
                  {isExchanging
                    ? `${t("bonus.loading")}...`
                    : t("bonus.exchange")}
                </Button>
              </div>
            </div>

            {/* Bonus transfer section - only show if transfer_visible is true */}
            {bonusExchangeData?.transfer_visible && (
              <div className="bg-gray-50 rounded-3xl p-6 shadow-md border dark:bg-[#333333] dark:border-none flex flex-col items-center justify-center">
                <p className="text-gray-500 text-xs sm:text-sm mb-3 text-center w-full">
                  {t("bonus.insufficient.friends")}
                </p>

                <div
                  className="text-black dark:text-gray-50 cursor-pointer flex items-center mb-3"
                  onClick={handleAddCard}
                >
                  <Plus
                    className="h-6 w-6 mr-2 text-blue-600"
                    strokeWidth={2}
                  />
                  <span className="font-medium">{t("bonus.card.add")}</span>
                </div>

                <p className="text-gray-500 text-xs mb-1">
                  {t("bonus.card.not.added")}
                </p>
                <p className="text-gray-500 text-xs">
                  {t("bonus.point.value.200")}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal windows */}
      {showExchangeConfirm && (
        <BonusExchangeConfirmModal
          onConfirm={handleExchangeConfirm}
          onCancel={handleExchangeCancel}
        />
      )}

      {showTransferConfirm && (
        <BonusTransferConfirmModal
          onConfirm={handleTransferConfirm}
          onCancel={handleTransferCancel}
        />
      )}
    </div>
  );
}
