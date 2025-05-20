"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useLanguage } from "../provider/language-provider";

interface BonusTransferCardModalProps {
  onSubmit: () => void;
  onClose: () => void;
}

export function BonusTransferCardModal({
  onSubmit,
  onClose,
}: BonusTransferCardModalProps) {
  const { t } = useLanguage();
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    let formattedValue = "";

    for (let i = 0; i < value.length && i < 16; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += " ";
      }
      formattedValue += value[i];
    }

    setCardNumber(formattedValue);
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    let formattedValue = "";

    if (value.length > 0) {
      formattedValue = value.substring(0, Math.min(2, value.length));
      if (value.length > 2) {
        formattedValue += "/" + value.substring(2, Math.min(4, value.length));
      }
    }

    setExpiryDate(formattedValue);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setCvv(value.substring(0, 3));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-xs mx-auto relative dark:bg-gray-800">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1"
          aria-label={t("common.close")}
        >
          <X className="h-5 w-5" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <label
              htmlFor="cardNumber"
              className="block text-sm font-medium text-gray-700 dark:text-white"
            >
              {t("card.number")}
            </label>
            <Input
              id="cardNumber"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="XXXX XXXX XXXX XXXX"
              className="rounded-full border-gray-300 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="expiryDate"
                className="block text-sm font-medium text-gray-700 dark:text-white"
              >
                {t("card.expiry")}
              </label>
              <Input
                id="expiryDate"
                value={expiryDate}
                onChange={handleExpiryDateChange}
                placeholder="XX/XX"
                className="rounded-full border-gray-300"
                required
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="cvv"
                className="block text-sm font-medium text-gray-700 dark:text-white"
              >
                {t("card.cvv")}
              </label>
              <Input
                id="cvv"
                value={cvv}
                onChange={handleCvvChange}
                placeholder="XXX"
                className="rounded-full border-gray-300"
                required
              />
            </div>
          </div>

          {/* Payment information */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-white">
                {t("payment.amount")}
              </span>
              <span className="font-medium">$50</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-white">
                {t("payment.fee")}
              </span>
              <span className="font-medium">$4</span>
            </div>
            <div className="flex justify-between text-sm font-medium pt-1">
              <span className="text-gray-800 dark:text-white">
                {t("payment.total")}
              </span>
              <span>$54</span>
            </div>
          </div>
          <div className="flex justify-center">
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)] border border-white text-white rounded-full py-3 px-6"
            >
              {t("bonus.add.card")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
