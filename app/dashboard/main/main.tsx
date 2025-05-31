"use client";

import { useState, useEffect } from "react";
import { MainContent } from "@/components/main/main-content";

import {
  usePostCardMutation,
  useStartAnalysisMutation,
  useStartDescriptionMutation,
} from "@/store/services/main";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useProcessingContext } from "@/components/main/processing-provider";
import { ProductAnalysisForm } from "@/components/main/product-analysis-form";
import { ProductAnalysisDetails } from "@/components/main/product-analysis-details";
import { ProductDescriptionForm } from "@/components/main/product-description-form";
import { ProductDescriptionDetails } from "@/components/main/product-description-details";
import { ProcessingView } from "@/components/main/processing-view";

type ActivePanel =
  | null
  | "product-analysis"
  | "product-description"
  | "processing";
type AnalysisStep = "form" | "details" | "modal" | "results";
type DescriptionStep = "form" | "details" | "modal" | "processing";

// Глобальные функции для открытия панелей из других компонентов
declare global {
  interface Window {
    openPartnerPanel?: (panel: string) => void;
    openFeedbackPanel?: (panel: string) => void;
    openShareMenu?: (title: string, content: string) => void;
    openEmptyPanel?: (panel: string) => void;
  }
}

export function Main() {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>("form");
  const [descriptionStep, setDescriptionStep] =
    useState<DescriptionStep>("form");
  const [productData, setProductData] = useState({
    sku: "",
    competitorSku: "",
  });
  const { processingItems, addProcessingItem } = useProcessingContext();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [shareContent, setShareContent] = useState({ title: "", content: "" });
  const [postCard, { isLoading, error, data }] = usePostCardMutation();
  const [startAnalysis] = useStartAnalysisMutation();
  const [startDescription] = useStartDescriptionMutation();
  const [cardId, setCardId] = useState<null | number>(null);

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

  const handleOpenPanel = (panel: ActivePanel, data?: any) => {
    setActivePanel(panel);
    if (panel === "product-analysis") {
      setAnalysisStep("form");
    } else if (panel === "product-description") {
      setDescriptionStep("form");
    }
  };

  const handleClosePanel = () => {
    setActivePanel(null);
    setAnalysisStep("form");
    setDescriptionStep("form");
  };

  const handleAnalysisFormSubmit = async (
    data: {
      sku: string;
      competitorSku?: string;
    },
    cardId: number
  ) => {
    setProductData(data);
    try {
      setCardId(cardId);
      setAnalysisStep("details");
    } catch (e) {
      console.log(e);
    }
  };

  const handleDescriptionFormSubmit = async (
    data: {
      sku: string;
      competitorSku: string;
    },
    cardId: number
  ) => {
    setProductData(data);
    try {
      setCardId(cardId);
      setDescriptionStep("details");
    } catch (e) {
      console.log(e);
    }
  };

  const handleStartAnalysis = () => {
    setAnalysisStep("modal");
  };

  const handleAnalysisModalContinue = async () => {
    // Добавляем элемент в очередь обработки
    // const { addProcessingItem } = useProcessingContext()
    addProcessingItem("analysis", productData);
    try {
      if (cardId) {
        const response = await startAnalysis({ card_id: +cardId }).unwrap();

        // Переходим на страницу обработки

        setActivePanel("processing");
        setCardId(null);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleDescriptionModalContinue = async () => {
    // Добавляем элемент в очередь обработки
    // const { addProcessingItem } = useProcessingContext()
    addProcessingItem("description", productData);
    try {
      if (cardId) {
        const response = await startDescription({ card_id: +cardId }).unwrap();

        // Переходим на страницу обработки

        setCardId(null);
        setActivePanel("processing");
      }
    } catch (e) {
      console.log(e);
    }
  };
  const handleBackToAnalysisForm = () => {
    setAnalysisStep("form");
  };

  const handleBackToDescriptionForm = () => {
    setDescriptionStep("form");
  };

  const handleOpenProcessing = () => {
    setActivePanel("processing");
  };

  // Рендерим содержимое левого блока в зависимости от активной вкладки
  const renderLeftContent = () => {
    return (
      <MainContent
        onOpenPanel={handleOpenPanel}
        onOpenProcessing={handleOpenProcessing}
      />
    );
  };

  // Рендерим содержимое правого блока в зависимости от активной панели
  const renderRightContent = () => {
    if (activePanel === "product-analysis") {
      if (analysisStep === "form") {
        return (
          <ProductAnalysisForm
            onClose={handleClosePanel}
            onSubmit={handleAnalysisFormSubmit}
          />
        );
      } else if (analysisStep === "details") {
        return (
          <ProductAnalysisDetails
            onClose={handleClosePanel}
            onBack={handleBackToAnalysisForm}
            onStartAnalysis={handleStartAnalysis}
            productData={productData}
            onContinue={handleAnalysisModalContinue}
          />
        );
      }
    } else if (activePanel === "product-description") {
      if (descriptionStep === "form") {
        return (
          <ProductDescriptionForm
            onClose={handleClosePanel}
            onSubmit={handleDescriptionFormSubmit}
          />
        );
      } else if (descriptionStep === "details") {
        return (
          <ProductDescriptionDetails
            onClose={handleClosePanel}
            onBack={handleBackToDescriptionForm}
            onContinue={handleDescriptionModalContinue}
            productData={productData}
          />
        );
      }
    } else if (activePanel === "processing") {
      return <ProcessingView onClose={handleClosePanel} />;
    }
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
