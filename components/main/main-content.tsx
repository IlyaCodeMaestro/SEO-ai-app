"use client";

import { Button } from "@/components/ui/button";
import { useProcessingContext } from "./processing-provider";
import { useState } from "react";
import {
  useGetMainInfoQuery,
  useGetProcessListQuery,
  useGetProfileQuery,
} from "@/store/services/main";
import { useLanguage } from "../provider/language-provider";

interface MainContentProps {
  onOpenPanel: (panel: "product-analysis" | "product-description") => void;
  onOpenProcessing: () => void;
}

export function MainContent({
  onOpenPanel,
  onOpenProcessing,
}: MainContentProps) {
  const { processingItems } = useProcessingContext();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const { data: profileData} = useGetProfileQuery();
  const { data: mainData, isLoading: mainLoading } = useGetMainInfoQuery(
    undefined,
    {
      pollingInterval: 5000, // Refresh every 5 seconds
    }
  );
  const { data: processData, isLoading: processLoading } =
    useGetProcessListQuery(undefined, {
      pollingInterval: 5000, // Refresh every 5 seconds
    });
  const { t } = useLanguage();

  // Check if there are any items in processing
  const hasContextItems = processingItems && processingItems.length > 0;
  const hasApiItems =
    processData &&
    processData.card_dates !== null &&
    processData.card_dates.length > 0;
  const showProcessingButton = hasContextItems || hasApiItems;

  // Function to handle card click and set the selected item
  const handleCardClick = (itemId: string, callback: () => void) => {
    setSelectedItem(itemId);
    callback();
  };

  // Function to get card style based on selection state with BOLDER border
  const getCardStyle = (itemId: string, gradient: string) => {
    const baseClasses = `rounded-[24px] p-4 mb-5 bg-gradient-to-r ${gradient} text-white shadow-bottom-only`;

    if (selectedItem === itemId) {
      // Using border-4 for a bolder/thicker border
      return `${baseClasses} border-4 border-blue-600`;
    } else {
      return `${baseClasses} border`;
    }
  };

  // Function to get processing button style
  const getProcessingButtonStyle = () => {
    const baseClasses =
      "bg-gradient-to-r h-[60px] w-80 rounded-[25px] shadow-custom from-[#0d52ff] to-[rgba(11,60,187,1)] text-white text-2xl md:text-xl";

    if (selectedItem === "processing") {
      // Using border-4 for a bolder/thicker border
      return `${baseClasses} border-4 border-blue-600`;
    } else {
      return `${baseClasses} border border-white`;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="pt-4 pb-0 px-6">
        <h2 className="text-[#1950DF] font-medium mb-4 text-center text-xl md:text-md">
          {t("common.main")}
        </h2>
        <h1 className="text-[25px] md:text-xl font-normal mb-4">
          {t("common.greeting")} {profileData?.user.name || "Загрузка..."}
        </h1>

        {/* First card */}
        <div
          className={getCardStyle(
            "product-analysis",
            "from-[#64cada] to-[#4169E1]"
          )}
          onClick={() =>
            handleCardClick("product-analysis", () =>
              onOpenPanel("product-analysis")
            )
          }
        >
          <h2 className="text-[22px] font-medium mb-3 ml-2">
            {t("product.analysis.title")}
          </h2>
          <p className="text-base md:text-sm mb-1 ml-2 font-normal">
            {t("product.analysis.desc")}
          </p>
          <p className="text-base text-[15px] md:text-sm mb-5 ml-2 font-thin">
            {t("tariff.analysis.remaining")}{" "}
            {mainData && mainData?.tariff?.analyses}
          </p>
          <div className="ml-2">
            <Button
              variant="secondary"
              className="bg-white text-black hover:bg-gray-100 font-light rounded-full text-base md:text-sm px-8 py-1 h-[32px] w-[120px]"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering parent onClick
                handleCardClick("product-analysis", () =>
                  onOpenPanel("product-analysis")
                );
              }}
            >
              {t("common.go")}
            </Button>
          </div>
        </div>

        {/* Second card */}
        <div
          className={getCardStyle(
            "product-description",
            "from-[#0d52ff] to-[rgba(11,60,187,1)]"
          )}
          onClick={() =>
            handleCardClick("product-description", () =>
              onOpenPanel("product-description")
            )
          }
        >
          <h2 className="text-[20px] font-medium mb-3 ml-2">
            {t("product.description.title")}
          </h2>
          <p className="text-base mb-1 ml-2 text-[14px] md:text-sm font-normal">
            {t("product.description.desc")}
          </p>
          <p className="text-base mb-5 ml-2 text-[16px] md:text-sm font-thin">
            {t("tariff.description.remaining")}{" "}
            {mainData && mainData?.tariff?.descriptions}
          </p>
          <div className="ml-2">
            <Button
              variant="secondary"
              className="bg-white font-light text-black hover:bg-gray-100 rounded-full text-base md:text-sm px-8 py-1 h-[32px] w-[120px]"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering parent onClick
                handleCardClick("product-description", () =>
                  onOpenPanel("product-description")
                );
              }}
            >
              {t("common.go")}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center px-4 mt-6 mb-5 w-full">
        {showProcessingButton && (
          <Button
            className={getProcessingButtonStyle()}
            onClick={() => {
              setSelectedItem("processing");
              onOpenProcessing();
            }}
          >
            {t("common.processing")}
          </Button>
        )}
      </div>
    </div>
  );
}
