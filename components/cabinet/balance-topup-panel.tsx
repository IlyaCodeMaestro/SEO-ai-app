"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { ArrowLeft, X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useLanguage } from "../provider/language-provider";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useGetPaySystemsQuery, useRefillBalanceMutation } from "@/store/services/main";

interface BalanceTopupPanelProps {
  onClose: () => void;
}

export function BalanceTopupPanel({ onClose }: BalanceTopupPanelProps) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState("");
  const [systemId, setSystemId] = useState<number | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Fetch payment systems
  const {
    data: paySystemsData,
    isLoading: isLoadingPaySystems,
    error: paySystemsError,
  } = useGetPaySystemsQuery();

  // Balance refill mutation
  const [refillBalance, { isLoading: isRefilling }] =
    useRefillBalanceMutation();

  // Set default payment system when data is loaded
  useEffect(() => {
    if (paySystemsData?.pay_systems?.length > 0) {
      setSystemId(paySystemsData.pay_systems[0].id);
    }
  }, [paySystemsData]);

  // Handle amount input change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAmount(value);
  };

  // Show success toast
  const showSuccessToast = (message: string) => {
    toast({
      title: (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span>{t("success")}</span>
        </div>
      ),
      description: message,
      className: "bg-green-50 border-green-200 text-green-800",
      duration: 5000, // Show for 5 seconds
    });
  };

  // Show error toast
  const showErrorToast = (message: string) => {
    toast({
      title: (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>{t("error")}</span>
        </div>
      ),
      description: message,
      className: "bg-red-50 border-red-200 text-red-800",
      duration: 5000, // Show for 5 seconds
    });
  };

  // Handle top-up button click
  const handleTopup = async () => {
    if (!amount || !systemId) {
      showErrorToast(t("balance.topup.error.fields"));
      return;
    }

    const numAmount = Number.parseInt(amount, 10);

    // Get selected payment system
    const selectedPaySystem = paySystemsData?.pay_systems.find(
      (system) => system.id === systemId
    );

    if (!selectedPaySystem) {
      showErrorToast(t("balance.topup.error.payment.system"));
      return;
    }

    // Validate amount against min/max
    if (numAmount < selectedPaySystem.min_amount) {
      showErrorToast(
        `${t("balance.topup.error.min.amount")} ${
          selectedPaySystem.min_amount
        }${paySystemsData?.currency}`
      );
      return;
    }

    if (numAmount > selectedPaySystem.max_amount) {
      showErrorToast(
        `${t("balance.topup.error.max.amount")} ${
          selectedPaySystem.max_amount
        }${paySystemsData?.currency}`
      );
      return;
    }

    try {
      // Updated to use system_id instead of pay_system_id
      const result = await refillBalance({
        system_id: systemId,
        amount: numAmount,
      }).unwrap();

      // Show success message
      showSuccessToast(
        `${t("balance.topup.success")} ${numAmount}${
          paySystemsData?.currency
        }. ${t("balance.topup.redirecting")}`
      );

      // Redirect to payment page after a short delay to allow the user to see the success message
      setTimeout(() => {
        if (result.next_url) {
          window.location.href = result.next_url;
        }
      }, 1500);
    } catch (error) {
      showErrorToast(t("balance.topup.error.general"));
    }
  };

  return (
    <div className="h-full flex flex-col bg-white px-4 py-6 max-w-2xl mx-auto dark:bg-[#333333]">
      {/* Add Toaster component to ensure toasts are displayed */}
      <Toaster />

      {/* Header */}
      <div className="flex items-center">
        {isMobile ? (
          <>
            <button
              onClick={onClose}
              className="p-1"
              aria-label={t("common.back")}
            >
              <ArrowLeft className="h-6 w-6 mb-4" />
            </button>
            <h1 className="text-xl font-medium text-center flex-1 pr-4 mb-4 text-blue-600">
              {t("cabinet.title")}
            </h1>
          </>
        ) : (
          <div className="w-full flex justify-end">
            <button
              onClick={onClose}
              className="p-1"
              aria-label={t("common.close")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-col gap-6 w-full md:max-w-md md:mx-auto">
        {/* Top up balance button */}
        <button className="w-full border border-white bg-blue-600 text-white py-5 rounded-[25px] text-xl font-medium shadow-md">
          {t("balance.topup")}
        </button>

        {/* Payment system section */}
        <div className="space-y-2">
          <label className="text-xl font-medium">{t("payment.system")}</label>
          <div className="relative">
            {isLoadingPaySystems ? (
              <div className="w-full border border-gray-300 rounded-[25px] py-8 px-6 text-gray-500">
                {t("loading")}...
              </div>
            ) : paySystemsError ? (
              <div className="w-full border border-red-300 rounded-[25px] py-8 px-6 text-red-500">
                {t("error.loading.payment.systems")}
              </div>
            ) : (
              <Select
                value={systemId?.toString() || ""}
                onValueChange={(value) =>
                  setSystemId(Number.parseInt(value, 10))
                }
              >
                <SelectTrigger className="w-full border border-gray-300 rounded-[25px] py-8 px-6 text-left flex justify-between items-center">
                  <SelectValue placeholder={t("select.payment.system")} />
                </SelectTrigger>
                <SelectContent>
                  {paySystemsData?.pay_systems.map((system) => (
                    <SelectItem key={system.id} value={system.id.toString()}>
                      {system.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Display payment system note if available */}
          {systemId && paySystemsData?.pay_systems && (
            <div className="text-sm text-gray-500 mt-1 px-2">
              {
                paySystemsData.pay_systems.find(
                  (system) => system.id === systemId
                )?.note
              }
            </div>
          )}
        </div>

        {/* Amount section */}
        <div className="space-y-2">
          <label className="text-xl font-medium">
            {t("balance.topup.amount")}
          </label>
          <div className="relative border border-gray-300 rounded-[25px] py-2 px-6 flex items-center">
            <div className="mr-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="32" height="32" rx="4" fill="#4285F4" />
                <rect
                  x="10"
                  y="10"
                  width="16"
                  height="12"
                  rx="2"
                  fill="white"
                  fillOpacity="0.9"
                />
                <rect
                  x="6"
                  y="8"
                  width="12"
                  height="16"
                  rx="2"
                  fill="#4285F4"
                  stroke="white"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <Input
              placeholder={`1000${paySystemsData?.currency || "₸"}`}
              value={amount}
              onChange={handleAmountChange}
              className="border-0 dark:text-white focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-lg"
              type="text"
              inputMode="numeric"
            />
          </div>

          {/* Display min/max amount info if available */}
          {systemId && paySystemsData?.pay_systems && (
            <div className="text-sm text-gray-500 mt-1 px-2">
              {t("min")}:{" "}
              {
                paySystemsData.pay_systems.find(
                  (system) => system.id === systemId
                )?.min_amount
              }
              {paySystemsData.currency} | {t("max")}:{" "}
              {
                paySystemsData.pay_systems.find(
                  (system) => system.id === systemId
                )?.max_amount
              }
              {paySystemsData.currency}
            </div>
          )}
        </div>

        {/* Top up button */}
        <div className="flex justify-center mt-6">
          <Button
            onClick={handleTopup}
            disabled={isRefilling || !amount || !systemId}
            className="bg-blue-600 hover:bg-blue-700 border border-white text-white rounded-[25px] py-6 px-12 text-lg font-medium w-44 h-12 shadow-custom disabled:opacity-50"
          >
            {isRefilling ? `${t("loading")}...` : t("balance.topup.button")}
          </Button>
        </div>
      </div>
    </div>
  );
}
