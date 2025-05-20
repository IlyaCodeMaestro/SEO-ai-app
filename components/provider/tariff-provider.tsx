"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// Типы тарифов
export type TariffId = "seller" | "manager" | "premium"

// Интерфейс тарифа
export interface Tariff {
  id: TariffId
  name: string
  monthlyFee: number
  analysisCount: number
  descriptionCount: number
  color: string
  bonusInfo: string[]
}

// Данные о тарифах
export const tariffs: Tariff[] = [
  {
    id: "seller",
    name: "Селлер",
    monthlyFee: 8000,
    analysisCount: 6,
    descriptionCount: 6,
    color: "bg-gradient-to-r from-blue-300 to-blue-500",
    bonusInfo: [
      "При переподключении тарифа остатки трафика и бонусы не сохраняются.",
      'При переходе на тариф "Менеджер" 50% бонусов сохраняются.',
      'При переходе на тариф "Премиум" 100% бонусов сохраняются.',
      "Абонентская плата бонусами не оплачивается.",
    ],
  },
  {
    id: "manager",
    name: "Менеджер",
    monthlyFee: 20000,
    analysisCount: 20,
    descriptionCount: 20,
    color: "bg-gradient-to-r from-blue-400 to-blue-600",
    bonusInfo: [
      "При своевременной оплате абонентской платы или переподключении тарифа 50% бонусов сохраняются, остатки трафика не сохраняются.",
      'При переходе на тариф "Селлер" бонусы не сохраняются.',
      'При переходе на тариф "Премиум" 100% бонусов сохраняются.',
      "Абонентская плата бонусами не оплачивается.",
    ],
  },
  {
    id: "premium",
    name: "Премиум",
    monthlyFee: 50000,
    analysisCount: 60,
    descriptionCount: 60,
    color: "bg-gradient-to-r from-blue-500 to-blue-700",
    bonusInfo: [
      "При своевременной оплате абонентской платы или переподключении 100% бонусов сохраняются, остатки трафика не сохраняются.",
      'При переходе на тариф "Селлер" или "Менеджер" бонусы не сохраняются.',
      "Абонентская плата бонусами не оплачивается.",
    ],
  },
]

// Интерфейс контекста тарифа
interface TariffContextType {
  currentTariff: TariffId
  setCurrentTariff: (tariffId: TariffId) => void
  getTariffById: (id: TariffId) => Tariff
  analysisRemaining: number
  descriptionRemaining: number
  nextPaymentDate: string
}

const TariffContext = createContext<TariffContextType | undefined>(undefined)

export function TariffProvider({ children }: { children: ReactNode }) {
  const [currentTariff, setCurrentTariff] = useState<TariffId>("premium")

  // Функция для получения тарифа по ID
  const getTariffById = (id: TariffId): Tariff => {
    return tariffs.find((t) => t.id === id) || tariffs[2] // По умолчанию "premium"
  }

  // Моковые данные для остатков и даты следующего платежа
  const analysisRemaining = 40
  const descriptionRemaining = 25
  const nextPaymentDate = "10 ноября"

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
  )
}

export function useTariff() {
  const context = useContext(TariffContext)
  if (context === undefined) {
    throw new Error("useTariff must be used within a TariffProvider")
  }
  return context
}
