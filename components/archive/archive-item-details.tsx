"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../provider/language-provider";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ShareMenu } from "../shared/share-menu";
import { useProcessingContext } from "../main/processing-provider";
import { ArchiveHeader } from "./archive-layout/archive-header";
import { ProductInfo } from "./archive-layout/product-info";
import ResultsBlock from "./archive-layout/results-block";
import { KeywordsTable } from "./archive-layout/keywords-table";
import { TopKeywords } from "./archive-layout/top-keywords";
import { DescriptionBlock } from "./archive-layout/description-block";
import { ConfirmationModal } from "./archive-layout/confirmation-modal";
import { IrrelevantKeywordsTable } from "./archive-layout/irrelevant-keywords";
import { MissedKeywordsTable } from "./archive-layout/missed-keywords-table";
import { Copy, Star } from "lucide-react";
import { ArchiveItemDetailsModal } from "./archive-layout/block-modal";
import {
  useGetCardAnalysisQuery,
  useGetCardDescriptionQuery,
  useStartDescriptionMutation,
} from "@/store/services/main";

interface ArchiveItemDetailsProps {
  onClose: () => void;
  item: {
    id: number;
    sku: string;
    competitorSku?: string;
    type: "analysis" | "description" | "both";
    status: "processing" | "completed";
    timestamp: number;
    name: string;
    type_id?: number;
    article?: string;
    images?: Array<{ image: string }>;
  };
}

export function ArchiveItemDetails({ onClose, item }: ArchiveItemDetailsProps) {
  const { t } = useLanguage();
  const isMobile = useMediaQuery("(max-width: 1120px)");
  const { addProcessingItem } = useProcessingContext();
  const [showModal, setShowModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState<string | null>(null);
  // Determine which API queries to use based on item type
  const shouldFetchAnalysis = item.type === "analysis" || item.type === "both";
  const shouldFetchDescription =
    item.type === "description" || item.type === "both";

  // Fetch analysis data if needed
  const {
    data: analysisData,
    isLoading: isAnalysisLoading,
    error: analysisError,
  } = useGetCardAnalysisQuery(item.id, {
    skip: !shouldFetchAnalysis,
    onSuccess: (data) => {
      console.log("Complete analysis data:", data);
      console.log("Availability:", data?.analysis?.availability);
      console.log("Visible:", data?.analysis?.visible);
      // Check if miss.words exists
      if (data?.analysis?.miss?.words) {
        console.log("Missed words found:", data.analysis.miss.words);
      } else {
        console.log("No missed words in the response");
      }
    },
  });

  // Fetch description data if needed
  const {
    data: descriptionData,
    isLoading: isDescriptionLoading,
    error: descriptionError,
  } = useGetCardDescriptionQuery(item.id, {
    skip: !shouldFetchDescription,
  });

  // Добавляем хук для запуска процесса создания описания
  const [startDescription, { isLoading: isStartingDescription }] =
    useStartDescriptionMutation();

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    results: false,
    topKeywords: false,
    usedKeywords: false,
    irrelevantKeywords: false,
    missedKeywords: false,
    description: false,
  });
  const [shareContent, setShareContent] = useState<{
    content: string;
    title?: string;
  } | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(
    null
  );
  const [modalTitle, setModalTitle] = useState("");
  const [currentSection, setCurrentSection] = useState<string | null>(null);

  // Prevent scrolling of the archive-item-details when modal is open
  useEffect(() => {
    if (modalOpen && containerRef.current) {
      containerRef.current.style.overflow = "hidden";
    } else if (containerRef.current) {
      containerRef.current.style.overflow = "auto";
    }
  }, [modalOpen]);

  // Log the API responses for debugging
  useEffect(() => {
    if (analysisData) {
      console.log("Analysis data:", analysisData);
    }
    if (descriptionData) {
      console.log("Description data:", descriptionData);
    }
  }, [analysisData, descriptionData]);

  // Prepare data for display
  const isLoading =
    (shouldFetchAnalysis && isAnalysisLoading) ||
    (shouldFetchDescription && isDescriptionLoading);
  const hasError =
    (shouldFetchAnalysis && analysisError) ||
    (shouldFetchDescription && descriptionError);

  // Prepare analysis results data
  const analysisResults = {
    // Извлекаем рейтинг из API
    rating: analysisData?.analysis?.rating
      ? Number.parseFloat(analysisData.analysis.rating)
      : "",
    // Извлекаем видимость из API
    visibility: analysisData?.analysis?.visible || 0,
    // Извлекаем присутствие ключевых слов из API
    keywordsPresence: analysisData?.analysis?.availability || 0,
    // Извлекаем количество упущенных ключевых слов из API
    missedKeywordsCount: analysisData?.analysis?.miss?.count || 0,
    // Извлекаем упущенный охват из API
    missedCoverage: analysisData?.analysis?.miss?.coverage || 0,
    // Извлекаем количество нерелевантных слов из API
    irrelevantCount: analysisData?.analysis?.irrelevant?.count || 0,
    topKeywords:
      descriptionData?.cards?.slice(0, 5).map((card) => ({
        name: card.name,
        sku: card.article,
        image: card.images?.[0]?.image,
      })) || [],
    usedKeywords:
      (
        analysisData?.analysis?.used?.words ||
        descriptionData?.description?.used?.words ||
        []
      )
        .filter((word) => word.frequency > 0)
        .map((words) => ({
          word: words.word,
          frequency: words.frequency,
          type: words.type,
        })) || [],
    // Извлекаем нерелевантные слова из API
    irrelevantKeywords: analysisData?.analysis?.irrelevant?.words
      ? analysisData.analysis.irrelevant.words.map((words) => ({
          word: words.word,
          frequency: words.frequency,
        }))
      : [],
    // Извлекаем упущенные ключевые слова из API - теперь правильно обрабатываем miss.words
    missedKeywords: analysisData?.analysis?.miss?.words
      ? analysisData.analysis.miss.words.map((words) => ({
          word: words.word,
          frequency: words.frequency,
          type: words.type,
        }))
      : [],
    description:
      descriptionData?.description?.text ||
      analysisData?.analysis?.description?.text ||
      "Описание товара отсутствует",
  };

  // Функция для переключения состояния раскрытия секции
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleWriteDescription = async () => {
    try {
      // Get the CUSTOMER_URL from environment variables or use the default
      const CUSTOMER_URL =
        process.env.NEXT_PUBLIC_CUSTOMER_URL || "https://api.stage.seo-ai.kz/c";

      // Send GET request to the analysis endpoint
      const response = await fetch(
        `${CUSTOMER_URL}/v1/card/analysis?card_id=${item.id}`
      );

      // Check if the response is ok
      if (!response.ok) {
        console.error(
          `API responded with status: ${response.status} ${response.statusText}`
        );
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      // Get the response text first to debug
      const responseText = await response.text();
      console.log("Raw API response text:", responseText);

      // Try to parse the JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        console.error("Response text:", responseText);
        throw new Error("Invalid JSON response from API");
      }

      // Log the complete response for debugging
      console.log("Raw card analysis response:", data);

      // Apply transformation logic to ensure miss.words exists
      if (!data.analysis) {
        console.warn("Analysis object is missing from the API response");
        data.analysis = {};
      }

      if (!data.analysis.miss) {
        console.warn("miss object is missing from the API response");
        data.analysis.miss = { count: 0, coverage: 0, words: [] };
      } else if (!data.analysis.miss.words) {
        console.warn("miss.words array is missing from the API response");
        data.analysis.miss.words = [];
      }

      // Log the miss.words array for debugging
      console.log("Missed words array:", data.analysis.miss.words);

      if (data.output && data.output.result) {
        console.log("Analysis with description data:", data);

        // Update the current item type to "both" to show both analysis and description blocks
        item.type = "both";

        // Add the item to processing with type "both" for "анализ и описание"
        addProcessingItem("both", {
          sku: item.sku,
          competitorSku: item.competitorSku || "",
          cardId: item.id,
          cardData: {
            ...data.card,
            type_id: 3, // Set type_id to 3 for "both" (Анализ и описание)
          },
        });

        // Force a re-render to show both analysis and description blocks
        // Expand all relevant sections to show both analysis and description content
        setExpandedSections({
          results: true, // Show analysis results
          topKeywords: true, // Show top keywords
          usedKeywords: true, // Show used keywords
          missedKeywords: true, // Show missed keywords
          irrelevantKeywords: true, // Show irrelevant keywords
          description: true, // Show description
        });
      } else {
        console.error(
          "Failed to get analysis with description:",
          data?.output?.message_ru || data?.output?.message || "Unknown error"
        );
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error fetching analysis with description:", error);
      setShowModal(true);
    }
  };

  const handleContinue = async () => {
    setShowModal(false);

    try {
      // Запускаем процесс создания описания
      const result = await startDescription({
        card_id: item.id,
      }).unwrap();

      if (result.output.result) {
        // Добавляем элемент в обработку с типом "description"
        addProcessingItem("description", {
          sku: item.sku,
          competitorSku: item.competitorSku || "",
          cardId: item.id,
          cardData: descriptionData?.card || item,
        });

        // Закрываем панель деталей и переходим на главную
        onClose();
        // Переключаемся на вкладку "main"
        window.location.hash = "main";
      } else {
        console.error(
          "Failed to start description:",
          result.output.message_ru || result.output.message
        );
      }
    } catch (error) {
      console.error("Error starting description:", error);
    }
  };

  // Функция для копирования контента
  const handleCopy = (content: string, section: string) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        setCopiedSection(section);
        setTimeout(() => setCopiedSection(null), 2000);
      })
      .catch((err) => {
        console.error("Ошибка при копировании текста: ", err);
      });
  };

  // Функция для шеринга ключевых слов
  const handleShareKeywords = (
    keywords: { word: string; frequency: string | number }[],
    title: string
  ) => {
    const keywordsText = keywords
      .map(
        (keyword) =>
          `${keyword.word}: ${
            typeof keyword.frequency === "number"
              ? keyword.frequency.toString()
              : keyword.frequency
          }`
      )
      .join("\n");

    setShareContent({
      title: `${item.name} - ${title}`,
      content: keywordsText,
    });
  };

  // Функция для шеринга описания товара
  const handleShareDescription = () => {
    setShareContent({
      title: `${item.name} - ${t("archive.details.description")}`,
      content: analysisResults.description,
    });
  };

  // Function to get color based on rating
  const getRatingColor = (rating: number) => {
    if (rating < 2.5) return "text-red-500";
    if (rating < 3.5) return "text-yellow-500";
    return "text-green-500";
  };

  const handleMaximize = (section: string, title: string) => {
    setModalTitle(title);
    setCurrentSection(section);

    // Set the content based on the section
    let content;
    switch (section) {
      case "topKeywords":
        content = (
          <div>
            <div className="bg-[#f9f8f8] dark:bg-[#404040] rounded-[20px] shadow-md">
              <div className="p-6">
                <div className="space-y-4">
                  {analysisResults.topKeywords.map((keyword, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-[#333333] rounded-[16px] p-4 flex items-start"
                    >
                      <div className="w-[80px] h-[80px]  bg-gray-200 rounded-lg mr-4 overflow-hidden flex-shrink-0">
                        {keyword.image ? (
                          <img
                            src={`https://upload.seo-ai.kz/test/images/${keyword.image}`}
                            alt={keyword.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={`/placeholder.svg?height=80&width=80&query=product`}
                            alt="Product"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-medium dark:text-white leading-tight mb-3">
                          {keyword.name}
                        </p>
                        <div className="flex items-center">
                          <p className="text-lg text-blue-600">{keyword.sku}</p>
                          <button
                            onClick={() =>
                              handleCopy(keyword.sku, "topKeywords")
                            }
                            className="ml-2"
                            aria-label="Copy SKU"
                          >
                            <Copy
                              size={16}
                              className={
                                copied ? "text-green-500" : "text-blue-600"
                              }
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
        break;
      case "results":
        content = (
          <div className="bg-[#f9f8f8] dark:bg-[#333333] rounded-[20px] shadow-md">
            <div className="p-6 ">
              <div className="flex items-center justify-center mb-6"></div>

              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-8 w-8 ${
                          star <= Math.round(analysisResults.rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-2xl font-bold text-gray-600 dark:text-white">
                    {analysisResults.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white dark:bg-[#2C2B2B] rounded-[16px] p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-white text-lg">
                      Видимость:
                    </span>
                    <span className="font-medium text-lg dark:text-white">
                      {analysisResults.visibility} %
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#2C2B2B] rounded-[16px] p-4">
                  <div className="flex justify-between  items-center">
                    <span className="text-gray-700 dark:text-white text-lg">
                      Присутствие ключевых слов:
                    </span>
                    <span className="font-medium text-lg dark:text-white">
                      {analysisResults.keywordsPresence} %
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#2C2B2B] rounded-[16px] p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-white text-lg">
                      Упущено ключевых слов:
                    </span>
                    <span className="font-medium text-lg dark:text-white">
                      {analysisResults.missedKeywordsCount}
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#2C2B2B] rounded-[16px] p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-white text-lg">
                      Упущенный охват:
                    </span>
                    <span className="font-medium text-lg dark:text-white">
                      {new Intl.NumberFormat().format(
                        analysisResults.missedCoverage
                      )}
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#2C2B2B] rounded-[16px] p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-white text-lg">
                      Наличие нерелевантных слов:
                    </span>
                    <span className="font-medium dark:text-white text-lg">
                      {analysisResults.irrelevantCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        break;
      case "usedKeywords":
        content = (
          <div>
            <div className="bg-[#f9f8f8] dark:bg-[#2C2B2B] rounded-[20px] shadow-md">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="font-medium text-lg dark:text-white">
                    Ключевые слова
                  </div>
                  <div className="font-medium dark:text-white text-lg text-right">
                    Сумм. частотность
                  </div>
                  {analysisResults.usedKeywords.map((keyword, index) => (
                    <React.Fragment key={index}>
                      <div className="bg-white dark:bg-[#333333] rounded-[16px] p-4">
                        <p className="text-lg dark:text-white">
                          {keyword.word}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-[#333333]  rounded-[16px] p-4">
                        <p className="text-lg text-right dark:text-white text-gray-500">
                          {typeof keyword.frequency === "number"
                            ? new Intl.NumberFormat().format(keyword.frequency)
                            : keyword.frequency}
                        </p>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
        break;
      case "irrelevantKeywords":
        content = (
          <div>
            <div className="bg-[#f9f8f8] dark:bg-[#2C2B2B] rounded-[20px] shadow-md">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="font-medium text-lg dark:text-white">
                    Нерелевант. слова
                  </div>
                  <div className="font-medium text-lg text-right dark:text-white">
                    Сумм. частотность
                  </div>
                  {analysisResults.irrelevantKeywords.map((keyword, index) => (
                    <React.Fragment key={index}>
                      <div className="bg-white dark:bg-[#333333] rounded-[16px] p-4">
                        <p className="text-lg text-blue-600">{keyword.word}</p>
                      </div>
                      <div className="bg-white dark:bg-[#333333] rounded-[16px] p-4">
                        <p className="text-lg text-right text-gray-500 dark:text-white">
                          {typeof keyword.frequency === "number"
                            ? new Intl.NumberFormat().format(keyword.frequency)
                            : keyword.frequency}
                        </p>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
        break;
      case "missedKeywords":
        content = (
          <div>
            <div className="bg-[#f9f8f8] dark:bg-[#2C2B2B] rounded-[20px] shadow-md">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="font-medium text-lg dark:text-white">
                    Ключевые слова
                  </div>
                  <div className="font-medium text-lg text-right dark:text-white">
                    Сумм. частотность
                  </div>
                  {analysisResults.missedKeywords.map((keyword, index) => (
                    <React.Fragment key={index}>
                      <div className="bg-white dark:bg-[#333333] rounded-[16px] p-4">
                        <p className="text-lg text-blue-500">{keyword.word}</p>
                      </div>
                      <div className="bg-white dark:bg-[#333333] rounded-[16px] p-4">
                        <p className="text-lg text-right text-gray-500 dark:text-white">
                          {typeof keyword.frequency === "number"
                            ? new Intl.NumberFormat().format(keyword.frequency)
                            : keyword.frequency}
                        </p>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
        break;
      case "description":
        content = (
          <div>
            <div className="bg-[#f9f8f8] dark:bg-[#2C2B2B] rounded-[20px] shadow-md">
              <div className="p-6">
                <div className="bg-white dark:bg-[#2C2B2B] rounded-[16px] p-6">
                  <p className="text-lg dark:text-white leading-relaxed whitespace-pre-wrap">
                    {analysisResults.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
        break;
      default:
        content = null;
    }

    setModalContent(content);
    setModalOpen(true);
  };

  const renderDesktopLayout = () => {
    return (
      <div
        className="h-full overflow-auto bg-white dark:bg-[#404040] flex flex-col"
        ref={containerRef}
      >
        <div className="p-3 sm:p-6 flex-1">
          {/* Заголовок с кнопкой закрытия */}
          <ArchiveHeader
            onClose={onClose}
            isMobile={false}
            itemType={item.type}
          />

          {/* Верхний блок с информацией о товаре */}
          <ProductInfo
            item={{
              ...item,
              name:
                descriptionData?.card?.name ||
                analysisData?.card?.name ||
                item.name,
              sku:
                descriptionData?.card?.article ||
                analysisData?.card?.article ||
                item.sku,
              image:
                descriptionData?.card?.images?.[0]?.image ||
                analysisData?.card?.images?.[0]?.image,
            }}
            isMobile={false}
          />

          {/* Основной контент в зависимости от типа */}
          {item.type === "analysis" && (
            <>
              {/* Двухколоночная сетка для анализа */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Левая колонка */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Результаты анализа */}
                  <ResultsBlock
                    title="Результаты анализа"
                    rating={analysisResults.rating}
                    visibility={analysisResults.visibility}
                    keywordsPresence={analysisResults.keywordsPresence}
                    missedKeywordsCount={analysisResults.missedKeywordsCount}
                    missedCoverage={analysisResults.missedCoverage}
                    irrelevantCount={analysisResults.irrelevantCount}
                    isMobile={false}
                    isExpanded={expandedSections["results"]}
                    onToggle={toggleSection}
                    section="results"
                    onMaximize={(title) => handleMaximize("results", title)}
                  />
                </div>

                {/* Правая колонка */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Использованные нерелевантные слова */}
                  <MissedKeywordsTable
                    title="Упущенные ключевые слова"
                    keywords={analysisResults.missedKeywords}
                    section="missedKeywords"
                    isExpanded={expandedSections["missedKeywords"]}
                    onToggle={toggleSection}
                    onCopy={handleCopy}
                    onShare={handleShareKeywords}
                    copiedSection={copiedSection}
                    textColorClass="text-blue-500"
                    isMobile={false}
                    onMaximize={(title) =>
                      handleMaximize("missedKeywords", title)
                    }
                  />
                  {process.env.NODE_ENV === "development" && (
                    <div className="hidden">
                      {console.log(
                        "Missed keywords:",
                        analysisResults.missedKeywords
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Упущенные ключевые слова (на всю ширину внизу) */}
              <div className="mt-4 sm:mt-6">
                <IrrelevantKeywordsTable
                  title="Использованные нерелевантные слова"
                  keywords={analysisResults.irrelevantKeywords}
                  section="irrelevantKeywords"
                  isExpanded={expandedSections["irrelevantKeywords"]}
                  onToggle={toggleSection}
                  onCopy={handleCopy}
                  onShare={handleShareKeywords}
                  copiedSection={copiedSection}
                  textColorClass="text-red-500"
                  isMobile={false}
                  onMaximize={(title) =>
                    handleMaximize("irrelevantKeywords", title)
                  }
                />
              </div>

              {/* Кнопка "Написать описание" */}
              <div className="flex justify-center mt-4 sm:mt-6">
                <button
                  onClick={handleWriteDescription}
                  className="bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)] text-white rounded-full h-[40px] sm:h-[45px] border border-white shadow-around inline-block px-6 sm:px-8 text-sm sm:text-base"
                  style={{ width: "fit-content" }}
                >
                  {analysisData?.button?.text || t("archive.write.description")}
                </button>
              </div>
            </>
          )}

          {item.type === "description" && (
            <>
              {/* Двухколоночная сетка для описания */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Левая колонка */}
                <div>
                  <TopKeywords
                    keywords={analysisResults.topKeywords}
                    section="topKeywords"
                    isExpanded={expandedSections["topKeywords"]}
                    onToggle={toggleSection}
                    isMobile={false}
                    onMaximize={(section, title) =>
                      handleMaximize(section, title)
                    }
                  />
                </div>

                {/* Правая колонка */}
                <div>
                  <KeywordsTable
                    title="Использованные ключевые слова"
                    keywords={analysisResults.usedKeywords}
                    section="usedKeywords"
                    isExpanded={expandedSections["usedKeywords"]}
                    onToggle={toggleSection}
                    onCopy={handleCopy}
                    onShare={handleShareKeywords}
                    copiedSection={copiedSection}
                    isMobile={false}
                    onMaximize={(title) =>
                      handleMaximize("usedKeywords", title)
                    }
                  />
                </div>
              </div>

              {/* Использованные ключевые слова (под двумя блоками) */}
              <div className="mt-4 sm:mt-6">
                <DescriptionBlock
                  title="Описание карточки товара"
                  description={analysisResults.description}
                  section="description"
                  isExpanded={expandedSections["description"]}
                  onToggle={toggleSection}
                  onCopy={handleCopy}
                  onShare={handleShareDescription}
                  copiedSection={copiedSection}
                  isMobile={false}
                  onMaximize={(title) => handleMaximize("description", title)}
                />
              </div>
            </>
          )}

          {item.type === "both" && (
            <>
              {/* Общая двухколоночная сетка 2x2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Результаты анализа */}
                <div className="space-y-4 sm:space-y-6">
                  <ResultsBlock
                    title="Результаты анализа"
                    rating={analysisResults.rating}
                    visibility={analysisResults.visibility}
                    keywordsPresence={analysisResults.keywordsPresence}
                    missedKeywordsCount={analysisResults.missedKeywordsCount}
                    missedCoverage={analysisResults.missedCoverage}
                    irrelevantCount={analysisResults.irrelevantCount}
                    isMobile={false}
                    isExpanded={expandedSections["results"]}
                    onToggle={toggleSection}
                    section="results"
                    onMaximize={(title) => handleMaximize("results", title)}
                  />
                </div>

                {/* Ключевые слова ТОП позиций */}
                <div className="space-y-4 sm:space-y-6">
                  <TopKeywords
                    keywords={analysisResults.topKeywords}
                    section="topKeywords"
                    isExpanded={expandedSections["topKeywords"]}
                    onToggle={toggleSection}
                    isMobile={false}
                    onMaximize={(title) => handleMaximize("topKeywords", title)}
                  />
                </div>

                {/* Использованные ключевые слова */}
                <div className="space-y-4 sm:space-y-6">
                  <KeywordsTable
                    title="Использованные ключевые слова"
                    keywords={analysisResults.usedKeywords}
                    section="usedKeywords"
                    isExpanded={expandedSections["usedKeywords"]}
                    onToggle={toggleSection}
                    onCopy={handleCopy}
                    onShare={handleShareKeywords}
                    copiedSection={copiedSection}
                    isMobile={false}
                    onMaximize={(title) =>
                      handleMaximize("usedKeywords", title)
                    }
                  />
                </div>

                {/* Описание карточки товара */}
                <div className="space-y-4 sm:space-y-6">
                  <DescriptionBlock
                    title="Описание карточки товара"
                    description={analysisResults.description}
                    section="description"
                    isExpanded={expandedSections["description"]}
                    onToggle={toggleSection}
                    onCopy={handleCopy}
                    onShare={handleShareDescription}
                    copiedSection={copiedSection}
                    fullWidth={false} // убираем fullWidth, чтобы заняло только половину
                    isMobile={false}
                    onMaximize={(title) => handleMaximize("description", title)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Мобильная версия (обновленная)
  const renderMobileLayout = () => {
    return (
      <div
        className="h-full overflow-auto bg-white dark:bg-[#404040] flex flex-col"
        ref={containerRef}
      >
        <div className="p-4 flex-1">
          {/* Заголовок с кнопкой закрытия */}
          <ArchiveHeader
            onClose={onClose}
            isMobile={true}
            itemType={item.type}
          />

          {/* Верхний блок с информацией о товаре */}
          <ProductInfo
            item={{
              ...item,
              name:
                descriptionData?.card?.name ||
                analysisData?.card?.name ||
                item.name,
              sku:
                descriptionData?.card?.article ||
                analysisData?.card?.article ||
                item.sku,
              image:
                descriptionData?.card?.images?.[0]?.image ||
                analysisData?.card?.images?.[0]?.image,
            }}
            isMobile={true}
          />

          {item.type === "description" && (
            <div className="space-y-4">
              {/* Ключевые слова TOP позиций */}
              <TopKeywords
                keywords={analysisResults.topKeywords}
                section="topKeywords"
                isExpanded={expandedSections["topKeywords"]}
                onToggle={toggleSection}
                isMobile={true}
              />

              {/* Использованные ключевые слова */}
              <KeywordsTable
                title="Использованные ключевые слова"
                keywords={analysisResults.usedKeywords}
                section="usedKeywords"
                isExpanded={expandedSections["usedKeywords"]}
                onToggle={toggleSection}
                onCopy={handleCopy}
                onShare={handleShareKeywords}
                copiedSection={copiedSection}
                isMobile={true}
              />

              {/* Описание карточки товара */}
              <DescriptionBlock
                title="Описание карточки товара"
                description={analysisResults.description}
                section="description"
                isExpanded={expandedSections["description"]}
                onToggle={toggleSection}
                onCopy={handleCopy}
                onShare={handleShareDescription}
                copiedSection={copiedSection}
                isMobile={true}
              />
            </div>
          )}

          {item.type === "analysis" && (
            <div className="space-y-4">
              {/* Результаты анализа */}
              <ResultsBlock
                title="Результаты анализа"
                rating={analysisResults.rating}
                visibility={analysisResults.visibility}
                keywordsPresence={analysisResults.keywordsPresence}
                missedKeywordsCount={analysisResults.missedKeywordsCount}
                missedCoverage={analysisResults.missedCoverage}
                irrelevantCount={analysisResults.irrelevantCount}
                isMobile={true}
                isExpanded={expandedSections["results"]}
                onToggle={toggleSection}
                section="results"
              />

              {/* Использованные нерелевантные слова */}

              {/* Упущенные ключевые слова */}
              <MissedKeywordsTable
                title="Упущенные ключевые слова"
                keywords={analysisResults.missedKeywords}
                section="missedKeywords"
                isExpanded={expandedSections["missedKeywords"]}
                onToggle={toggleSection}
                onCopy={handleCopy}
                onShare={handleShareKeywords}
                copiedSection={copiedSection}
                textColorClass="text-blue-500"
                isMobile={true}
              />
              <IrrelevantKeywordsTable
                title="Использованные нерелевантные слова"
                keywords={analysisResults.irrelevantKeywords}
                section="irrelevantKeywords"
                isExpanded={expandedSections["irrelevantKeywords"]}
                onToggle={toggleSection}
                onCopy={handleCopy}
                onShare={handleShareKeywords}
                copiedSection={copiedSection}
                textColorClass="text-red-500"
                isMobile={true}
              />
              {/* Кнопка "Написать описание" */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleWriteDescription}
                  className="bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)] text-white rounded-full h-[45px] border border-white shadow-around inline-block px-8"
                  style={{ width: "fit-content" }}
                >
                  {analysisData?.button?.text || t("archive.write.description")}
                </button>
              </div>
            </div>
          )}

          {item.type === "both" && (
            <div className="space-y-4">
              {/* Результаты анализа */}
              <ResultsBlock
                title="Результаты анализа"
                rating={analysisResults.rating}
                visibility={analysisResults.visibility}
                keywordsPresence={analysisResults.keywordsPresence}
                missedKeywordsCount={analysisResults.missedKeywordsCount}
                missedCoverage={analysisResults.missedCoverage}
                irrelevantCount={analysisResults.irrelevantCount}
                isMobile={true}
                isExpanded={expandedSections["results"]}
                onToggle={toggleSection}
                section="results"
              />

              {/* Ключевые слова TOP позиций */}
              <TopKeywords
                keywords={analysisResults.topKeywords}
                section="topKeywords"
                isExpanded={expandedSections["topKeywords"]}
                onToggle={toggleSection}
                isMobile={true}
              />

              {/* Использованные ключевые слова */}
              <KeywordsTable
                title="Использованные ключевые слова"
                keywords={analysisResults.usedKeywords}
                section="usedKeywords"
                isExpanded={expandedSections["usedKeywords"]}
                onToggle={toggleSection}
                onCopy={handleCopy}
                onShare={handleShareKeywords}
                copiedSection={copiedSection}
                isMobile={true}
              />

              {/* Описание карточки товара */}
              <DescriptionBlock
                title="Описание карточки товара"
                description={analysisResults.description}
                section="description"
                isExpanded={expandedSections["description"]}
                onToggle={toggleSection}
                onCopy={handleCopy}
                onShare={handleShareDescription}
                copiedSection={copiedSection}
                isMobile={true}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Ошибка при загрузке данных</div>
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Основной контент */}
      {isMobile ? renderMobileLayout() : renderDesktopLayout()}

      {/* Pop-up окно с затемнением фона */}
      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleContinue}
      />

      {/* Меню шеринга */}
      {shareContent && (
        <ShareMenu
          content={shareContent.content}
          title={shareContent.title}
          onClose={() => setShareContent(null)}
        />
      )}

      {/* Modal for maximized content */}
      <ArchiveItemDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
      >
        {modalContent}
      </ArchiveItemDetailsModal>
    </div>
  );
}
