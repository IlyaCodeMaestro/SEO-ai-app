"use client";

import { useLanguage } from "@/components/provider/language-provider";
import { ChevronDown, ChevronUp, Copy, Maximize2 } from "lucide-react";
import Image from "next/image";


interface DescriptionBlockProps {
  title: string;
  description: string;
  section: string;
  isExpanded: boolean;
  onToggle: (section: string) => void;
  onCopy: (content: string, section: string) => void;
  onShare: () => void;
  copiedSection: string | null;
  fullWidth?: boolean;
  isMobile: boolean;
  onMaximize?: (title: string) => void;
}

export function DescriptionBlock({
  title,
  description,
  section,
  isExpanded,
  onToggle,
  onCopy,
  onShare,
  copiedSection,
  fullWidth = false,
  isMobile,
  onMaximize,
}: DescriptionBlockProps) {
  const { t } = useLanguage();

  if (isMobile) {
    return (
      <div className="bg-[#f9f8f8] dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="p-4">
          {/* Верхняя строка: копировать — заголовок — поделиться */}
          <div className="relative flex items-center justify-between mb-3">
            {/* Левая иконка */}
            <button
              className="text-blue-600 z-10"
              onClick={() => onCopy(description, section)}
              aria-label={t("common.copy")}
            >
              <Copy
                className={`h-4 w-4 ${
                  copiedSection === section ? "text-green-500" : ""
                }`}
              />
            </button>

            {/* Заголовок — по центру, в одну строку, обрезается если не помещается */}
            <h3
              className="absolute left-1/2 transform -translate-x-1/2 text-sm font-medium z-0 truncate max-w-[70%] text-center"
              title={title} // показываем подсказку при наведении
            >
              {t("description.title")}
            </h3>

            {/* Правая иконка */}
            <button
              className="text-blue-600 z-10"
              onClick={onShare}
              aria-label="Share description"
            >
              <Image
                src="/icons/free-icon-share-8162990.png"
                alt="Share"
                width={16}
                height={16}
                className="h-4 w-4"
              />
            </button>
          </div>

          {/* Основной текст — выравниваем по левому краю */}
          <p
            className={`text-sm leading-relaxed text-left ${
              isExpanded ? "" : "line-clamp-3"
            } whitespace-pre-wrap`}
          >
            {description}
          </p>

          {/* Иконка раскрытия / скрытия */}
          <div className="flex justify-center mt-2">
            <button
              onClick={() => onToggle(section)}
              className="text-gray-500 hover:text-gray-700"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-[#f9f8f8] dark:bg-gray-800 rounded-[20px] shadow-md overflow-hidden ${
        fullWidth ? "col-span-2" : ""
      }`}
    >
      <div className="relative flex flex-col sm:flex-row items-center p-4 border-b dark:border-gray-700">
        {/* Левая иконка копирования */}
        <div className="flex items-center z-10 mb-2 sm:mb-0">
          <button
            onClick={() => onCopy(description, section)}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={t("common.copy")}
          >
            <Copy
              className={`h-5 w-5 ${
                copiedSection === section ? "text-green-500" : "text-blue-500"
              }`}
            />
          </button>
        </div>

        {/* Заголовок по центру */}
        <h3 className="sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2 font-medium z-0 text-center w-full sm:w-auto mb-2 sm:mb-0">
          {t("description.title")}
        </h3>

        {/* Правые иконки */}
        <div className="sm:ml-auto flex items-center space-x-2 z-10">
          {/* Правая иконка */}
          <button
            className="text-blue-600 z-10"
            onClick={onShare}
            aria-label="Share description"
          >
            <Image
              src="/icons/free-icon-share-8162990.png"
              alt="Share"
              width={16}
              height={16}
              className="h-6 w-6"
            />
          </button>
          <button
            onClick={() => onMaximize && onMaximize(title)}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Maximize"
          >
            <Maximize2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <p
          className={`text-sm leading-relaxed ${
            isExpanded ? "" : "line-clamp-6"
          } whitespace-pre-wrap`}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
