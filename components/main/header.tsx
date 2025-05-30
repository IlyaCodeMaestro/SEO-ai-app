"use client";

import { useState, useEffect } from "react";
import { useTheme } from "../provider/theme-provider";
import { useLanguage } from "../provider/language-provider";
import { Sun, Moon, Menu } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useProcessingContext } from "./processing-provider";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState("main");
  const { hasNewItems, clearNewItems } = useProcessingContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Слушаем изменения в URL для определения активной вкладки
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (
        hash &&
        [
          "main",
          "archive",
          "notifications",
          "cabinet",
          "partner",
          "feedback",
        ].includes(hash)
      ) {
        setActiveTab(hash);
        if (hash === "archive") {
          clearNewItems();
        }
      }
    };

    // Инициализация при загрузке
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [clearNewItems]);

  // Обновляем URL при изменении вкладки
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value;
    if (value === "archive") {
      clearNewItems();
    }
    // Закрываем меню на мобильных устройствах после выбора вкладки
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
  };

  return (
    <div
      className={`w-full ${
        isMobile
          ? "bg-gray-200 dark:bg-[#2C2B2B] h-[65px] shadow-md"
          : "bg-[#F6F6F6] dark:bg-[#2C2B2B] h-[110px] shadow-md"
      } relative z-20 border-b border-gray-200 dark:border-gray-700`}
    >
      <div className="container mx-auto px-2 md:px-4 lg:px-6 xl:px-8 h-full relative ">
        {/* Логотип - разные размеры для мобильной и десктопной версий */}
        <div
          className={`${
            isMobile ? "h-[40px] w-[40px]" : "h-[70px] w-[70px]"
          } absolute ${
            isMobile ? "top-3" : "top-4"
          } left-4 md:left-6 lg:left-8 xl:left-12`}
        >
          <img
            src="/seo-ai-logo.png"
            alt="SEO-AI Logo"
            className="w-full h-full object-cover rounded-md"
          />
        </div>

        {/* Мобильное меню */}
        {isMobile ? (
          <div className="absolute top-3 right-4">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <div className="w-[40px] h-[40px] flex items-center justify-center relative">
                  <Menu className="w-[35px] h-[35px] stroke-[1.5px]" />
                  {hasNewItems && activeTab !== "archive" && (
                    <span className="absolute top-0 right-0 bg-blue-600 w-4 h-4 rounded-full"></span>
                  )}
                </div>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] p-0 mt-0 rounded-none"
              >
                <div className="flex flex-col h-full">
                  <div className="flex justify-end items-center p-4 border-b">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMenuOpen(false)}
                    ></Button>
                  </div>

                  <div className="flex flex-col p-4 space-y-2">
                    <button
                      className={`text-left py-3 px-4 rounded-md ${
                        activeTab === "main"
                          ? "text-blue-600 bg-blue-50 dark:bg-[#3D3D3D]"
                          : ""
                      }`}
                      onClick={() => handleTabChange("main")}
                    >
                      {t("common.main")}
                    </button>
                    <button
                      className={`text-left py-3 px-4 rounded-md relative ${
                        activeTab === "archive"
                          ? "text-blue-600 bg-blue-50 dark:bg-[#3D3D3D]"
                          : ""
                      }`}
                      onClick={() => handleTabChange("archive")}
                    >
                      <span>{t("common.archive")}</span>
                      {hasNewItems && activeTab !== "archive" && (
                        <span className="absolute top-1 right-48 bg-blue-600 w-4 h-4 rounded-full"></span>
                      )}
                    </button>
                    <button
                      className={`text-left py-3 px-4 rounded-md ${
                        activeTab === "notifications"
                          ? "text-blue-600 bg-blue-50 dark:bg-[#3D3D3D]"
                          : ""
                      }`}
                      onClick={() => handleTabChange("notifications")}
                    >
                      {t("common.notifications")}
                    </button>
                    <button
                      className={`text-left py-3 px-4 rounded-md ${
                        activeTab === "cabinet"
                          ? "text-blue-600 bg-blue-50 dark:bg-[#3D3D3D]"
                          : ""
                      }`}
                      onClick={() => handleTabChange("cabinet")}
                    >
                      {t("common.cabinet")}
                    </button>
                    <button
                      className={`text-left py-3 px-4 rounded-md ${
                        activeTab === "partner"
                          ? "text-blue-600 bg-blue-50 dark:bg-[#3D3D3D]"
                          : ""
                      }`}
                      onClick={() => handleTabChange("partner")}
                    >
                      {t("common.partner")}
                    </button>
                    <button
                      className={`text-left py-3 px-4 rounded-md ${
                        activeTab === "feedback"
                          ? "text-blue-600 bg-blue-50 dark:bg-[#3D3D3D]"
                          : ""
                      }`}
                      onClick={() => handleTabChange("feedback")}
                    >
                      {t("common.feedback")}
                    </button>
                  </div>

                  <div className="mt-auto p-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {t("cabinet.language")}:
                      </span>
                      <div className="flex items-center border rounded-full p-0.5 bg-gray-200 dark:bg-[#4D4D4D]">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setLanguage("kz")}
                          className={`rounded-full h-6 w-8 text-xs ${
                            language === "kz"
                              ? "bg-white dark:bg-black"
                              : "opacity-70"
                          }`}
                        >
                          Каз
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setLanguage("ru")}
                          className={`rounded-full h-6 w-8 text-xs ${
                            language === "ru"
                              ? "bg-white dark:bg-black"
                              : "opacity-70"
                          }`}
                        >
                          Рус
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setLanguage("en")}
                          className={`rounded-full h-6 w-8 text-xs ${
                            language === "en"
                              ? "bg-white dark:bg-black"
                              : "opacity-70"
                          }`}
                        >
                          Eng
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm text-gray-500">
                        {t("cabinet.theme")}:
                      </span>
                      <div className="flex items-center border rounded-full p-0.5 bg-gray-200 dark:bg-[#4D4D4D]">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleThemeChange("light")}
                          className={`rounded-full h-6 w-6 ${
                            theme === "dark" ? "opacity-50" : "bg-white"
                          }`}
                        >
                          <Sun className="h-4 w-4 text-black stroke-black fill-white" />
                          <span className="sr-only">
                            {t("cabinet.theme.light")}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleThemeChange("dark")}
                          className={`rounded-full h-6 w-6 ${
                            theme === "light" ? "opacity-50" : "bg-gray-800"
                          }`}
                        >
                          <Moon className="  h-4 w-4 text-black stroke-black fill-white" />
                          <span className="sr-only">
                            {t("cabinet.theme.dark")}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <>
            {/* Desktop code remains unchanged */}
            <div className="absolute top-2 right-4 md:right-6 lg:right-8 xl:right-12 flex items-center gap-6 z-30">
              <ToggleGroup
                type="single"
                value={language}
                onValueChange={(value) =>
                  value && setLanguage(value as "kz" | "ru" | "en")
                }
                className="border rounded-full p-0.5 bg-gray-200 dark:bg-[#4D4D4D]"
              >
                {" "}
                <ToggleGroupItem
                  value="kz"
                  aria-label="Казахский"
                  className="text-xs px-1.5 py-0.5 rounded-full data-[state=on]:bg-white h-6 w-8  dark:data-[state=on]:bg-black"
                >
                  Каз
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="ru"
                  aria-label="Русский"
                  className="text-xs px-1.5 py-0.5 rounded-full data-[state=on]:bg-white h-6 w-8 dark:bg-[#4D4D4D] dark:data-[state=on]:bg-black"
                >
                  Рус
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="en"
                  aria-label="Английский"
                  className="text-xs px-1.5 py-0.5 rounded-full data-[state=on]:bg-white h-6 w-8 dark:bg-[#4D4D4D] dark:data-[state=on]:bg-black"
                >
                  Eng
                </ToggleGroupItem>
              </ToggleGroup>

              <div className="flex items-center border rounded-full p-0.5 bg-gray-200 dark:bg-[#4D4D4D] ml-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleThemeChange("light")}
                  className={`rounded-full h-6 w-6 ${
                    theme === "dark" ? "opacity-50" : "bg-white"
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  <span className="sr-only">{t("cabinet.theme.light")}</span>
                </Button>
                <div className="w-px h-4  mx-2" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleThemeChange("dark")}
                  className={`rounded-full h-6 w-6 ${
                    theme === "light" ? "opacity-50" : "bg-black"
                  }`}
                >
                  <Moon className="  h-4 w-4 text-black stroke-black fill-white" />
                  <span className="sr-only">{t("cabinet.theme.dark")}</span>
                </Button>
              </div>
            </div>

            <div className="hidden md:flex justify-center items-end h-full pl-32 md:pl-[140px] lg:pl-36 xl:pl-[200px] translate-y-4">
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="h-full overflow-x-auto flex items-center"
              >
                <TabsList className="bg-transparent h-auto flex gap-2 md:gap-3 lg:gap-4 mb-0 pb-0">
                  <TabsTrigger
                    value="main"
                    className="text-lg   font-medium data-[state=active]:text-blue-600 data-[state=active]:bg-transparent border-none shadow-none whitespace-nowrap h-10 mb-0"
                  >
                    {t("common.main")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="archive"
                    className="text-lg font-medium data-[state=active]:text-blue-600 data-[state=active]:bg-transparent border-none shadow-none relative whitespace-nowrap h-10 mb-0"
                  >
                    {t("common.archive")}
                    {hasNewItems && activeTab !== "archive" && (
                      <span className="absolute -top-1 right-1 bg-blue-600 w-4 h-4 rounded-full"></span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="notifications"
                    className="text-lg font-medium data-[state=active]:text-blue-600 data-[state=active]:bg-transparent border-none shadow-none whitespace-nowrap h-10 mb-0"
                  >
                    {t("common.notifications")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="cabinet"
                    className="text-lg font-medium data-[state=active]:text-blue-600 data-[state=active]:bg-transparent border-none shadow-none whitespace-nowrap h-10 mb-0"
                  >
                    {t("common.cabinet")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="partner"
                    className="text-lg font-medium data-[state=active]:text-blue-600 data-[state=active]:bg-transparent border-none shadow-none whitespace-nowrap h-10 mb-0"
                  >
                    {t("common.partner")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="feedback"
                    className="text-lg font-medium data-[state=active]:text-blue-600 data-[state=active]:bg-transparent border-none shadow-none whitespace-nowrap h-10 mb-0"
                  >
                    {t("common.feedback")}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
