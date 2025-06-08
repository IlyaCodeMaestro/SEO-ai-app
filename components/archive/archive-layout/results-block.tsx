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
    return new Intl.NumberFormat("ru-RU").format(num);
  };

  return (
    <div
      className={`bg-[#f9f8f8] dark:bg-[#2C2B2B] dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-3xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)]  overflow-hidden ${
        fullHeight ? "h-full" : !isExpanded ? "h-auto" : ""
      }`}
    >
      <div
        className={`flex items-center justify-center ${
          isMobile ? "p-2 pb-1" : "p-4"
        } dark:border-gray-700 relative`}
      >
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

      <div className={`${isMobile ? "px-4 pt-1 pb-4" : "p-4"} overflow-auto`}>
        {fullHeight ? (
          <div className="flex items-center justify-center h-full">
            <div className={`text-6xl font-bold ${ratingColor}`}>
              {rating.toFixed(1)}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Рейтинг со звездами - звезды слева, рейтинг справа */}
            <div className="flex items-center justify-between mb-1">
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
              <span className="font-sm text-md -mt-1">
                {rating}
              </span>
            </div>

            {/* Показываем только первые 3 метрики в нераскрытом состоянии, как на мобильном */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-700  dark:text-gray-300 text-md">
                  {t("results.visibility")}
                </span>
                <span className="font-sm text-md">{visibility} %</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300 text-md">
                  {t("results.keywords.presence")}
                </span>
                <span className="font-sm text-md">
                  {keywordsPresence} %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300 text-md">
                  {t("results.missed.keywords")}
                </span>
                <span className="font-sm text-md">
                  {missedKeywordsCount}
                </span>
              </div>

              {/* Показываем дополнительные метрики только в раскрытом состоянии */}
              {isExpanded && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 text-md">
                      {t("results.missed.coverage")}
                    </span>
                    <span className="font-sm text-md">
                      {formatNumber(missedCoverage)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 text-md">
                      {t("results.irrelevant.words")}
                    </span>
                    <span className="font-sm text-md">
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
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
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
