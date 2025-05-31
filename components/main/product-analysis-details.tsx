"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  useGetCardAnalysisQuery,
  useStartAnalysisMutation,
} from "@/store/services/main";
import { useProcessingContext } from "./processing-provider";
import { useLanguage } from "../provider/language-provider";

interface ProductAnalysisDetailsProps {
  onClose: () => void;
  onBack: () => void;
  onContinue: () => void;
  productData: {
    sku: string;
    competitorSku?: string;
    cardId?: number;
  };
}

export function ProductAnalysisDetails({
  onClose,
  onBack,
  onContinue,
  productData,
}: ProductAnalysisDetailsProps) {
  const { t } = useLanguage();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isAnalysisStarted, setIsAnalysisStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { addProcessingItem } = useProcessingContext();

  // Use the cardId from productData
  const cardId = productData.cardId || 0;

  // Fetch card analysis data using the cardId
  const {
    data: analysisData,
    error: apiError,
    isLoading,
    refetch,
  } = useGetCardAnalysisQuery(cardId, {
    // Skip the query if cardId is 0 (invalid)
    skip: cardId === 0,
  });

  // Add the startAnalysis mutation inside the component
  const [startAnalysis, { isLoading: isStartingAnalysis }] =
    useStartAnalysisMutation();

  // Handle continue button click in modal
  const handleContinue = async () => {
    if (analysisData && analysisData.card) {
      console.log("Starting analysis for card ID:", analysisData.card.id);

      try {
        // Start the analysis process
        const result = await startAnalysis({
          card_id: analysisData.card.id,
        }).unwrap();

        if (result.output.result) {
          // Add the item to the processing list with complete card data
          addProcessingItem("analysis", {
            sku: productData.sku,
            competitorSku: productData.competitorSku,
            cardId: analysisData.card.id, // Use the card ID from the API response
            cardData: analysisData.card, // Pass the complete card data
          });

          // Close the modal
          setShowModal(false);

          // Close the current page completely
          onClose();
        } else {
          // Handle error
          console.error(
            "Failed to start analysis:",
            result.output.message_ru || result.output.message
          );
        }
      } catch (error) {
        console.error("Error starting analysis:", error);
      }
    }
  };

  // Отображение загрузки
  if (isLoading) {
    return (
      <div className="h-full relative flex items-center justify-center">
        <div className="text-center">
          <p>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // Отображение ошибки
  if (apiError || !analysisData) {
    return (
      <div className="h-full relative flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{t("details.error")}</p>
          <div className="flex gap-2 mt-4 justify-center">
            <Button onClick={onBack}>{t("details.try.another")}</Button>
            <Button onClick={() => refetch()} variant="outline">
              {t("common.retry")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Extract data from the API response
  const { card, button } = analysisData;
  const buttonText = button?.text || t("product.analysis.start");
  const buttonVisible = button?.visible !== false;

  return (
    <div className="h-full relative dark:bg-[#404040]">
      <div className="max-w-md mx-auto p-6">
        {/* Заголовок с кнопкой назад */}
        <div className="relative mb-6">
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            <button onClick={onBack} aria-label={t("common.back")}>
              <ArrowLeft className="h-6 w-6 text-blue-500 dark:text-blue-600" />
            </button>
          </div>

          {isMobile ? (
            <div className="text-center">
              <span className="text-blue-500 font-medium text-xl">
                {t("common.main")}
              </span>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div className="flex-1"></div>
              <h2 className="text-md font-normal text-center flex-1">
                {t("product.analysis.title")}
              </h2>
              <div className="flex-1 flex justify-end">
                <button
                  onClick={onClose}
                  className="text-gray-500"
                  aria-label={t("common.close")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="dark:text-blue-600"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {isMobile && (
          <h2 className="text-xl font-normal mb-6 text-center">
            {t("product.analysis.title")}
          </h2>
        )}

        <div className="bg-white rounded-[30px] p-6 shadow-custom mb-6 dark:bg-[#333333]">
          {card ? (
            <div className="flex">
              <div className="w-32 h-32 bg-gray-200 rounded-xl mr-4 overflow-hidden">
                <img
                  src={
                    card.images && card.images.length > 0
                      ? `https://upload.seo-ai.kz/test/images/${card.images[0].image}`
                      : "/placeholder.svg?height=128&width=128"
                  }
                  alt={t("details.name")}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="mb-2">
                  <p className="text-md font-medium">SKU: {card.article}</p>
                </div>
                <div className="mb-2">
                  <p className="text-md">{t("details.name")}</p>
                  <p className="text-md">{card.name}</p>
                </div>
                <div>
                  <p className="text-md">
                    {t("details.brand")} {card.brand}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p>{t("details.error")}</p>
            </div>
          )}
        </div>

        {!isAnalysisStarted && card && buttonVisible && (
          <div className="mt-40 pt-6 flex justify-center">
            <Button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-[#64cada] to-[#4169E1] text-white rounded-full h-[55px] w-[200px] border border-white shadow-custom inline-block px-8"
            >
              {buttonText}
            </Button>
          </div>
        )}
      </div>
      {showModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center ">
          {/* Затемнение только вокруг модального окна */}
          <div
            className="absolute inset-0 bg-black/50 rounded-3xl"
            onClick={() => setShowModal(false)}
          ></div>

          {/* Модальное окно */}
          <div className="relative z-10 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg max-w-xs w-full mx-4">
            <div className="text-center space-y-4">
              <p className="text-sm">{t("product.analysis.time")}</p>
              <p className="text-sm">{t("product.analysis.notification")}</p>
              <div className="flex space-x-4 justify-center mt-4">
                <Button
                  onClick={handleContinue}
                  type="submit"
                  className="bg-gradient-to-r from-[#64cada] to-[#4169E1] text-white rounded-full h-[40px] border border-white shadow-custom inline-block px-12"
                >
                  {t("common.next")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
