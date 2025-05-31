"use client";

import type React from "react";
import { Star, ChevronUp, ChevronDown, Maximize2 } from "lucide-react";
import { useLanguage } from "@/components/provider/language-provider";


interface ResultsBlockProps {
  title: string;
  rating: number;
  visibility: number;
  keywordsPresence: number;
  missedKeywordsCount: number;
  missedCoverage: number;
  irrelevantCount: number;
  isMobile: boolean;
  isExpanded: boolean;
  onToggle: (section: string) => void;
  section: string;
  fullHeight?: boolean;
  onMaximize?: (title: string) => void;
}

const ResultsBlock: React.FC<ResultsBlockProps> = ({
  title,
  rating,
  visibility,
  keywordsPresence,
  missedKeywordsCount,
  missedCoverage,
  irrelevantCount,
  isMobile,
  isExpanded,
  onToggle,
  section,
  fullHeight = false,
  onMaximize,
}) => {
  const { t } = useLanguage();

  const ratingColor =
    rating >= 4.5
      ? "text-green-500"
      : rating >= 3
      ? "text-yellow-500"
      : "text-red-500";

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div
      className={`bg-[#f9f8f8] dark:bg-[#333333] rounded-[20px] shadow-md  overflow-hidden ${
        fullHeight ? "h-full" : !isExpanded ? "h-auto" : ""
      }`}
    >
      <div className="flex items-center justify-center p-4 border-b dark:border-gray-700 relative">
        <h3 className="font-medium text-center">{t("results.title")}</h3>

        {/* Add maximize icon in top right corner */}
        {!fullHeight && !isMobile && (
          <div className="absolute top-4 right-4">
            <button
              onClick={() =>
                onMaximize ? onMaximize(title) : onToggle(section)
              }
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Maximize"
            >
              <Maximize2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        )}
      </div>

      <div className="p-4 overflow-auto">
        {fullHeight ? (
          <div className="flex items-center justify-center h-full">
            <div className={`text-6xl font-bold ${ratingColor}`}>
              {rating.toFixed(1)}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Рейтинг со звездами - как на мобильном */}
            <div className="flex items-center mb-3 justify-center">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 font-medium text-sm">
                {rating.toFixed(1)}
              </span>
            </div>

            {/* Показываем только первые 3 метрики в нераскрытом состоянии, как на мобильном */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  {t("results.visibility")}
                </span>
                <span className="font-medium text-sm">{visibility} %</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  {t("results.keywords.presence")}
                </span>
                <span className="font-medium text-sm">
                  {keywordsPresence} %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  {t("results.missed.keywords")}
                </span>
                <span className="font-medium text-sm">
                  {missedKeywordsCount}
                </span>
              </div>

              {/* Показываем дополнительные метрики только в раскрытом состоянии */}
              {isExpanded && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {t("results.missed.coverage")}
                    </span>
                    <span className="font-medium text-sm">
                      {formatNumber(missedCoverage)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {t("results.irrelevant.words")}
                    </span>
                    <span className="font-medium text-sm">
                      {irrelevantCount}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Кнопка для раскрытия/сворачивания только для мобильных устройств */}
            {!fullHeight && isMobile && (
              <div className="flex justify-center mt-2">
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => onToggle(section)}
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsBlock;
