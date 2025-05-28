"use client"

import { useGetTariffsQuery } from "@/store/services/main"
import { TariffProvider } from "./tariff-provider"
import type { ReactNode } from "react"

interface TariffProviderWrapperProps {
  children: ReactNode
}

export function TariffProviderWrapper({ children }: TariffProviderWrapperProps) {
  const { data: tariffsData } = useGetTariffsQuery()

  return (
    <TariffProvider apiTariffs={tariffsData?.tariffs} currentApiTariff={tariffsData?.tariff}>
      {children}
    </TariffProvider>
  )
}
