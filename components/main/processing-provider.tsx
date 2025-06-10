"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import {
  useGetProcessListQuery,
  useGetArchiveQuery,
} from "@/store/services/main";

// Определяем тип элемента истории обработки
export type ProcessingHistoryItem = {
  id: string;
  sku: string;
  competitorSku?: string;
  type: "analysis" | "description" | "both";
  status: "processing" | "completed";
  timestamp: number;
  name: string;
  cardId?: number;
  cardData?: any; // Store the complete card data
};

type ProcessingContextType = {
  processingItems: ProcessingHistoryItem[];
  hasNewItems: boolean;
  hasNotifications: boolean;
  setHasNotifications: (value: boolean) => void;
  addProcessingItem: (
    type: "analysis" | "description" | "both",
    data: {
      sku: string;
      competitorSku?: string;
      cardId?: number;
      cardData?: any;
    }
  ) => void;
  clearNewItems: () => void;
  processedCardIds: number[];
  clearProcessedCardIds: () => void;
  manuallyAddToProcessed: (cardId: number) => void;
};

const ProcessingContext = createContext<ProcessingContextType | undefined>(
  undefined
);

export function ProcessingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [processingItems, setProcessingItems] = useState<
    ProcessingHistoryItem[]
  >([]);
  const [hasNewItems, setHasNewItems] = useState(false);
  const [processedCardIds, setProcessedCardIds] = useState<number[]>([]);
  const [hasNotifications, setHasNotifications] = useState(false);

  // Use RTK Query hooks for polling
  // const { data: processData, refetch: refetchProcessList } =
  //   useGetProcessListQuery(undefined, {
  //     pollingInterval: 5000, // Poll every 5 seconds
  //   });

  // Store a ref to the current processing items for use in the polling effect
  const processingItemsRef = useRef(processingItems);
  useEffect(() => {
    console.log("f", processingItems);
    processingItemsRef.current = processingItems;
  }, [processingItems]);

  // Load processed card IDs from localStorage on initial load
  useEffect(() => {
    const savedIds = localStorage.getItem("processedCardIds");
    if (savedIds) {
      try {
        const parsedIds = JSON.parse(savedIds);
        if (Array.isArray(parsedIds)) {
          setProcessedCardIds(parsedIds);
        }
      } catch (e) {
        console.error("Error parsing processedCardIds from localStorage:", e);
        localStorage.removeItem("processedCardIds");
      }
    }
  }, []);

  // Add a special function to manually add a card ID to the processed list
  // This can be used for testing or as a fallback
  const manuallyAddToProcessed = (cardId: number) => {
    if (!processedCardIds.includes(cardId)) {
      const newProcessedCardIds = [...processedCardIds, cardId];
      setProcessedCardIds(newProcessedCardIds);
      localStorage.setItem(
        "processedCardIds",
        JSON.stringify(newProcessedCardIds)
      );
      console.log(`Manually added card ID ${cardId} to processed list`);
    }
  };

  const addProcessingItem = async (
    type: "analysis" | "description" | "both",
    data: {
      sku: string;
      competitorSku?: string;
      cardId?: number;
      cardData?: any;
    }
  ) => {
    // Check if an item with the same cardId already exists in the processing list
    // This prevents duplicate items from being added
    if (
      data.cardId &&
      processingItems.some((item) => item.cardId === data.cardId)
    ) {
      console.log(
        `Item with cardId ${data.cardId} already exists in processing list. Skipping.`
      );
      return;
    }

    console.log("123456789", type);

    // For "both" type, we need to handle it specially
    if (type === "both" && data.cardId) {
      // Immediately add to processed list to ensure it shows up in archive
      manuallyAddToProcessed(data.cardId);
    }

    // Generate a unique ID for this processing item
    const uniqueId = `${Date.now()}-${type}-${data.sku}`;

    // Create a new item with data from API
    const newItem: ProcessingHistoryItem = {
      id: uniqueId,
      sku: data.sku,
      competitorSku: data.competitorSku,
      type,
      status: "processing", // Status 2 = "в обработке"
      timestamp: Date.now(),
      name: data.cardData?.name || "",
      cardId: data.cardId,
      cardData: data.cardData,
    };

    // Add the new item to the processing list
    setProcessingItems((prev) => [...prev, newItem]);

    // For description cards, we'll also immediately add them to the processed list
    // This ensures they show up in the archive even if the API doesn't mark them as completed
    if (type === "description" && data.cardId) {
      manuallyAddToProcessed(data.cardId);
    }

    // Immediately trigger a refetch of the process list and archive
    // refetchProcessList();
    // refetchArchive();
  };

  const clearNewItems = () => {
    setHasNewItems(false);
  };

  const clearProcessedCardIds = () => {
    setProcessedCardIds([]);
    localStorage.removeItem("processedCardIds");
  };

  return (
    <ProcessingContext.Provider
      value={{
        processingItems,
        hasNewItems,
        addProcessingItem,
        clearNewItems,
        processedCardIds,
        clearProcessedCardIds,
        manuallyAddToProcessed,
        hasNotifications,
        setHasNotifications,
      }}
    >
      {children}
    </ProcessingContext.Provider>
  );
}

export function useProcessingContext() {
  const context = useContext(ProcessingContext);
  if (context === undefined) {
    throw new Error(
      "useProcessingContext must be used within a ProcessingProvider"
    );
  }
  return context;
}
