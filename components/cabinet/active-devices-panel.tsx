"use client";

import { useState, useEffect } from "react";
import {
  X,
  ArrowLeft,
  Smartphone,
  Laptop,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useLanguage } from "../provider/language-provider";
import { Toaster } from "@/components/ui/toaster";
import { useGetSessionsQuery } from "@/store/services/sessions-api";
import { Button } from "@/components/ui/button";

interface ActiveDevicesPanelProps {
  onClose: () => void;
}

export function ActiveDevicesPanel({ onClose }: ActiveDevicesPanelProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { t, language } = useLanguage();
  const initialLimit = 10;
  const [displayLimit, setDisplayLimit] = useState(initialLimit);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreContent, setHasMoreContent] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch sessions data
  const { data: sessionsData, isLoading, error } = useGetSessionsQuery();

  // Check if there's more content to load
  useEffect(() => {
    if (sessionsData?.sessions) {
      const filteredTotal = sessionsData.sessions.filter(
        (session) => session.current || session.time_entry
      ).length;
      setHasMoreContent(filteredTotal > displayLimit);

      // If we've loaded more than the initial amount, mark as expanded
      setIsExpanded(displayLimit > initialLimit);
    }
  }, [sessionsData, displayLimit, initialLimit]);

  // Фильтруем и сортируем сессии
  const filteredSessions = sessionsData?.sessions
    ? sessionsData.sessions
        .filter((session) => session.current || session.time_entry) // Показываем текущую сессию и сессии с временем входа
        .sort((a, b) => {
          // Сначала текущая сессия
          if (a.current) return -1;
          if (b.current) return 1;

          // Затем сортировка по времени (от новых к старым)
          if (!a.time_entry) return 1;
          if (!b.time_entry) return -1;
          return (
            new Date(b.time_entry).getTime() - new Date(a.time_entry).getTime()
          );
        })
        .slice(0, displayLimit)
    : [];

  // Format date string (YYYY-MM-DD HH:MM:SS) to a more readable format
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";

    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString;
      }

      const day = date.getDate().toString().padStart(2, "0");
      const month = date.toLocaleString("default", { month: "long" });
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return `${day} ${month} ${hours}:${minutes}`;
    } catch (error) {
      return dateString;
    }
  };

  // Get device icon based on device title from API
  const getDeviceIcon = (session: any) => {
    const title = getDeviceTitle(session);
    if (
      title &&
      (title.includes("Web") ||
        title.includes("Веб") ||
        title.includes("қосымшасы"))
    ) {
      return <Laptop className="h-5 w-5 text-gray-500" />;
    } else {
      return <Smartphone className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get device title based on current language from API
  const getDeviceTitle = (session: any) => {
    if (language === "kz" && session.title_kk) return session.title_kk;
    if (language === "en" && session.title_en) return session.title_en;
    if (session.title_ru) return session.title_ru;

    // Fallback to any available title
    return (
      session.title_en ||
      session.title_ru ||
      session.title_kk ||
      "Unknown Device"
    );
  };

  // Загрузить больше устройств
  const handleLoadMore = () => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);
    // Simulate loading delay
    setTimeout(() => {
      setDisplayLimit((prev) => prev + 10);
      setIsLoadingMore(false);
    }, 500);
  };

  // Collapse content back to initial state
  const handleCollapse = () => {
    setIsLoadingMore(true);
    // Smooth transition with a small delay
    setTimeout(() => {
      setDisplayLimit(initialLimit);
      setIsLoadingMore(false);
      // Scroll to top of the panel
      const panel = document.querySelector(".active-devices-panel");
      if (panel) {
        panel.scrollTop = 0;
      }
    }, 300);
  };

  return (
    <div className="h-full flex flex-col justify-start bg-white px-4 md:px-0 dark:bg-[#404040] active-devices-panel">
      {/* Add Toaster component to ensure toasts are displayed */}
      <Toaster />

      {/* Заголовок с кнопкой закрытия */}
      <div className="flex items-center justify-between mb-4 mt-3">
        {isMobile ? (
          <>
            <button
              onClick={onClose}
              className="p-1"
              aria-label={t("common.back")}
            >
              <ArrowLeft className="h-5 w-5 dark:text-blue-600" />
            </button>
            <div className="flex-1 text-center">
              <h2 className="text-xl font-medium text-blue-600">
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
        {/* Заголовок */}
        <div className="w-full border border-white bg-blue-600 dark:border-none py-5 rounded-[25px] text-xl font-medium shadow-md p-4 mb-6 text-white text-center">
          <div className="flex justify-center items-center">
            <span className="text-lg font-medium">
              {t("cabinet.active.devices")}
            </span>
          </div>
        </div>

        {/* Список устройств */}
        <div className="space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center h-40">
              <p>{t("common.loading")}</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <div className="bg-red-500 rounded-full p-3 mb-4">
                <Info className="h-6 w-6 text-white" />
              </div>
              <p className="text-xl font-bold">{t("error.loading.sessions")}</p>
            </div>
          )}

          {!isLoading && !error && filteredSessions.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <div className="bg-gray-500 rounded-full p-3 mb-4">
                <Info className="h-6 w-6 text-white" />
              </div>
              <p className="text-xl font-bold dark:text-white">
                {t("empty.sessions")}
              </p>
            </div>
          )}

          {!isLoading &&
            !error &&
            filteredSessions.map((session, index) => (
              <div
                key={`session-${session.id}-${index}`}
                className="bg-white rounded-3xl p-4 shadow-md border dark:bg-[#2C2B2B]"
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-1">{getDeviceIcon(session)}</div>
                  <div className="flex-1">
                    <p className="font-medium dark:text-white">
                      {getDeviceTitle(session)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {session.device_name || ""}
                    </p>
                    {session.current && (
                      <p className="text-xs text-blue-600 mt-1">
                        {t("cabinet.current.device")}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(session.time_entry)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

          {/* Load more button or collapse button */}
          {!isLoading && !error && filteredSessions.length > 0 && (
            <div className="flex justify-center items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              {isExpanded && !hasMoreContent ? (
                <Button
                  onClick={handleCollapse}
                  disabled={isLoadingMore}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  {isLoadingMore ? (
                    <div className="h-5 w-5 border-2 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
                  ) : (
                    <ChevronUp className="h-6 w-6 text-gray-600" />
                  )}
                </Button>
              ) : hasMoreContent ? (
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  {isLoadingMore ? (
                    <div className="h-5 w-5 border-2 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
                  ) : (
                    <ChevronDown className="h-6 w-6 text-blue-600" />
                  )}
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
