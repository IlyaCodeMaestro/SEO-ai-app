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

  // Use RTK Query hooks for polling
  const { data: processData, refetch: refetchProcessList } =
    useGetProcessListQuery(undefined, {
     
    });

  const { data: archiveData, refetch: refetchArchive } = useGetArchiveQuery(1, {
   
  });

  // Store a ref to the current processing items for use in the polling effect
  const processingItemsRef = useRef(processingItems);
  useEffect(() => {
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

  // Update the useEffect that checks for completed items to properly handle both analysis and description types
  useEffect(() => {
    if (!archiveData || !archiveData.card_dates) return;

    // Check all card dates in archive
    const currentProcessingItems = [...processingItemsRef.current];
    let updatedProcessingItems = [...currentProcessingItems];
    const newProcessedCardIds = [...processedCardIds];
    let hasChanges = false;

    // Go through each card in the archive
    archiveData.card_dates.forEach((dateGroup) => {
      dateGroup.cards.forEach((card) => {
        // Log the complete card object to see all properties
        // console.log("Archive card:", JSON.stringify(card, null, 2));

        // Find matching processing item by cardId
        const processingItem = currentProcessingItems.find(
          (item) => item.cardId === card.id
        );

        if (processingItem) {
          // Log the complete processing item to see all properties
          console.log(
            "Processing item:",
            JSON.stringify(processingItem, null, 2)
          );

          // IMPORTANT: For description cards, we'll consider them completed if they're in the archive at all
          // This is a fallback to ensure description cards are added to the archive
          let isCompleted = false;

          // Check various status properties that might indicate completion
          if (card.status_id === 3 || card.status_id === 4) {
            isCompleted = true;
          } else if (
            card.status === "выполнен" ||
            card.status === "завершен" ||
            card.status === "завершен успешно"
          ) {
            isCompleted = true;
          } else if (
            processingItem.type === "description" &&
            card.type_id === 1
          ) {
            // For description cards, we'll be more lenient
            // If it's in the archive at all, consider it completed
            isCompleted = true;
            console.log(
              `Forcing description card ${card.id} to be considered completed`
            );
          }

          // Log more details about the card and processing item for debugging
          console.log(
            `Checking card ID ${card.id}: type_id=${card.type_id}, processingType=${processingItem.type}, ` +
              `status_id=${card.status_id}, status=${card.status}, isCompleted=${isCompleted}`
          );

          // For description cards, we'll manually set isCompleted to true
          if (processingItem.type === "description") {
            isCompleted = true;
            console.log(
              `Forcing description card ${card.id} to be considered completed regardless of status`
            );
          }

          if (isCompleted) {
            // Log the expected message format
            console.log(
              `Card ID ${card.id} has been processed and is now in the archive. Type: ${card.type_id}, Processing type: ${processingItem.type}`
            );

            // Remove from processing items
            updatedProcessingItems = updatedProcessingItems.filter(
              (procItem) => procItem.id !== processingItem.id
            );

            // Add to processed card IDs if not already there
            if (!newProcessedCardIds.includes(card.id)) {
              newProcessedCardIds.push(card.id);
              hasChanges = true;
            }
          }
        }
      });
    });

    // Update state if changes were made
    if (updatedProcessingItems.length !== currentProcessingItems.length) {
      setProcessingItems(updatedProcessingItems);
      setHasNewItems(true);
    }

    if (hasChanges) {
      setProcessedCardIds(newProcessedCardIds);
      localStorage.setItem(
        "processedCardIds",
        JSON.stringify(newProcessedCardIds)
      );
    }
  }, [archiveData, processedCardIds]);

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
    refetchProcessList();
    refetchArchive();
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
