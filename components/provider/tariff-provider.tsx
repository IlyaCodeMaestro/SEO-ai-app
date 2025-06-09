"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from "react";

// Типы тарифов
export type TariffId = "seller" | "manager" | "premium";

// Интерфейс тарифа
export interface Tariff {
  id: TariffId;
  name: string;
  monthlyFee: number;
  analysisCount: number;
  descriptionCount: number;
  color: string;
  bonusInfo: string[];
}

// API tariff interface
export interface ApiTariff {
  id: number;
  title: string;
  final_price: number;
  analyses: number;
  descriptions: number;
  b_start_color: string;
  b_end_color: string;
  description: string;
}

export interface ApiCurrentTariff {
  id: number;
  title: string;
  analyses: number;
  descriptions: number;
  end_time: string;
  auto_reconnect: boolean;
}

// Данные о тарифах
export const mapApiIdToComponentId = (apiId: number): TariffId => {
  switch (apiId) {
    case 1:
      return "seller";
    case 2:
      return "manager";
    case 3:
      return "premium";
    default:
      return "seller";
  }
};

// Интерфейс контекста тарифа
interface TariffContextType {
  currentTariff: TariffId;
  setCurrentTariff: (tariffId: TariffId) => void;
  getTariffById: (id: TariffId) => Tariff;
  analysisRemaining: number;
  descriptionRemaining: number;
  nextPaymentDate: string;
}

interface TariffProviderProps {
  children: ReactNode;
  apiTariffs?: ApiTariff[];
  currentApiTariff?: ApiCurrentTariff;
}

const TariffContext = createContext<TariffContextType | undefined>(undefined);

export function TariffProvider({
  children,
  apiTariffs,
  currentApiTariff,
}: TariffProviderProps) {
  const [currentTariff, setCurrentTariff] = useState<TariffId>("premium");

  useEffect(() => {
    if (currentApiTariff) {
      setCurrentTariff(mapApiIdToComponentId(currentApiTariff.id));
    }
  }, [currentApiTariff]);

  // Function to get tariff by ID
  const getTariffById = (id: TariffId): Tariff => {
    if (!apiTariffs) {
      // Fallback to default values if API data is not available
      return {
        id,
        name:
          id === "seller"
            ? "Селлер"
            : id === "manager"
            ? "Менеджер"
            : "Премиум",
        monthlyFee: id === "seller" ? 8000 : id === "manager" ? 20000 : 40000,
        analysisCount: id === "seller" ? 5 : id === "manager" ? 15 : 40,
        descriptionCount: id === "seller" ? 5 : id === "manager" ? 15 : 40,
        color:
          id === "seller"
            ? "bg-gradient-to-r from-blue-300 to-blue-500"
            : id === "manager"
            ? "bg-gradient-to-r from-blue-400 to-blue-600"
            : "bg-gradient-to-r from-blue-500 to-blue-700",
        bonusInfo: [],
      };
    }

    const apiId = id === "seller" ? 1 : id === "manager" ? 2 : 3;
    const apiTariff = apiTariffs.find((t) => t.id === apiId);

    if (!apiTariff) {
      return {
        id,
        name:
          id === "seller"
            ? "Селлер"
            : id === "manager"
            ? "Менеджер"
            : "Премиум",
        monthlyFee: id === "seller" ? 8000 : id === "manager" ? 20000 : 40000,
        analysisCount: id === "seller" ? 5 : id === "manager" ? 15 : 40,
        descriptionCount: id === "seller" ? 5 : id === "manager" ? 15 : 40,
        color:
          id === "seller"
            ? "bg-gradient-to-r from-blue-300 to-blue-500"
            : id === "manager"
            ? "bg-gradient-to-r from-blue-400 to-blue-600"
            : "bg-gradient-to-r from-blue-500 to-blue-700",
        bonusInfo: [],
      };
    }

    return {
      id,
      name: apiTariff.title.replace(/[«»""]/g, ""),
      monthlyFee: apiTariff.final_price,
      analysisCount: apiTariff.analyses,
      descriptionCount: apiTariff.descriptions,
      color:
        id === "seller"
          ? "bg-gradient-to-r from-blue-300 to-blue-500"
          : id === "manager"
          ? "bg-gradient-to-r from-blue-400 to-blue-600"
          : "bg-gradient-to-r from-blue-500 to-blue-700",
      bonusInfo: apiTariff.description.split("\n\n").filter(Boolean),
    };
  };

  // Get values from API data
  const analysisRemaining = currentApiTariff?.analyses || 0;
  const descriptionRemaining = currentApiTariff?.descriptions || 0;
  const nextPaymentDate = currentApiTariff?.end_time
    ? new Date(currentApiTariff.end_time).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "long",
      })
    : "";

  return (
    <TariffContext.Provider
      value={{
        currentTariff,
        setCurrentTariff,
        getTariffById,
        analysisRemaining,
        descriptionRemaining,
        nextPaymentDate,
      }}
    >
      {children}
    </TariffContext.Provider>
  );
}

export function useTariff() {
  const context = useContext(TariffContext);
  if (context === undefined) {
    throw new Error("useTariff must be used within a TariffProvider");
  }
  return context;
}
