"use client";

import type React from "react";

import { useEffect, useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { getCountries } from "@/utils/authService";
import Image from "next/image";

interface Country {
  code_id: number;
  name_ru: string;
  name_en: string;
  name_kk: string;
  code: string;
  length: number;
  hint: string;
  id: number;
  default: boolean;
  image: string;
}

interface PhoneInputProps {
  value: string;
  onChange: (value: string, dialCode: string, code_id: number) => void;
  required?: boolean;
}

export default function PhoneInput({
  value,
  onChange,
  required = false,
}: PhoneInputProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(value.replace(/^\+\d+\s/, ""));
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCountries()
      .then((data) => {
        setCountries(data);
        // Find default country or use the first one
        const defaultCountry = data.find((c: Country) => c.default) || data[0];
        setSelectedCountry(defaultCountry);
        onChange(phoneNumber, defaultCountry.code, defaultCountry.code_id);
      })
      .catch((err) => setError(err.message));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    onChange(phoneNumber, country.code, country.code_id);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Если пользователь стирает символы, работаем с неформатированным значением
    if (inputValue.length < phoneNumber.length) {
      // Удаляем все нецифровые символы из текущего значения input
      const cleanedInput = inputValue.replace(/[^\d]/g, "");
      setPhoneNumber(cleanedInput);

      if (selectedCountry) {
        onChange(cleanedInput, selectedCountry.code, selectedCountry.code_id);
      }
      return;
    }

    // При добавлении символов применяем обычную логику
    const newPhone = inputValue.replace(/[^\d]/g, "");
    const maxLen = selectedCountry?.length || 10;
    const trimmedPhone = newPhone.slice(0, maxLen);

    setPhoneNumber(trimmedPhone);

    if (selectedCountry) {
      onChange(trimmedPhone, selectedCountry.code, selectedCountry.code_id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Если нажата клавиша Backspace или Delete
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();

      const input = inputRef.current;
      if (!input) return;

      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;

      if (start !== end) {
        // Если выделен текст, удаляем выделенную часть
        const newValue = phoneNumber.slice(0, start) + phoneNumber.slice(end);
        setPhoneNumber(newValue);
        if (selectedCountry) {
          onChange(newValue, selectedCountry.code, selectedCountry.code_id);
        }
      } else if (e.key === "Backspace" && start > 0) {
        // Удаляем символ перед курсором
        const newValue =
          phoneNumber.slice(0, start - 1) + phoneNumber.slice(start);
        setPhoneNumber(newValue);
        if (selectedCountry) {
          onChange(newValue, selectedCountry.code, selectedCountry.code_id);
        }
      } else if (e.key === "Delete" && start < phoneNumber.length) {
        // Удаляем символ после курсора
        const newValue =
          phoneNumber.slice(0, start) + phoneNumber.slice(start + 1);
        setPhoneNumber(newValue);
        if (selectedCountry) {
          onChange(newValue, selectedCountry.code, selectedCountry.code_id);
        }
      }
    }
  };

  // Format phone number according to country hint
  const formatPhoneNumber = (phone: string, hint: string | undefined) => {
    if (!hint || !phone) return phone;

    let formattedPhone = "";
    let phoneIndex = 0;

    for (let i = 0; i < hint.length; i++) {
      if (hint[i] === "0") {
        formattedPhone += phoneIndex < phone.length ? phone[phoneIndex++] : "";
      } else {
        formattedPhone += hint[i];
      }
    }

    return formattedPhone;
  };

  return (
    <div className="relative w-full">
      <div className="flex w-full rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            type="button"
            className="flex items-center h-10 sm:h-12 px-2 sm:px-3 text-gray-700 bg-gray-50 rounded-l-full border-r border-gray-200 focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {selectedCountry && (
              <span className="mr-2 w-6 h-4 relative overflow-hidden">
                {selectedCountry.image && (
                  <Image
                    src={`https://upload.seo-ai.kz/test/photos/${selectedCountry.image}`}
                    alt={selectedCountry.name_ru}
                    width={16}
                    height={16}
                    className="object-cover"
                  />
                )}
              </span>
            )}
            <span className="mr-1 text-sm sm:text-base whitespace-nowrap">
              {selectedCountry?.code}
            </span>
            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
          </button>

          {isOpen && (
            <div className="absolute z-50 left-0 mt-1 w-48 sm:w-60 max-h-48 sm:max-h-60 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg">
              {Array.isArray(countries) &&
                countries.length > 0 &&
                countries.map((country) => (
                  <button
                    key={country.code_id}
                    type="button"
                    className="flex items-center w-full px-3 sm:px-4 py-2 text-left text-sm hover:bg-gray-100"
                    onClick={() => handleCountryChange(country)}
                  >
                    <span className="mr-2 w-6 h-4 relative overflow-hidden">
                      {country.image && (
                        <Image
                          src={`https://upload.seo-ai.kz/test/photos/${country.image}`}
                          alt={country.name_ru}
                          width={16}
                          height={16}
                          className="object-cover"
                        />
                      )}
                    </span>
                    <span className="mr-2">{country.code}</span>
                    <span className="truncate">{country.name_ru}</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="tel"
          value={
            isFocused
              ? phoneNumber
              : selectedCountry
              ? formatPhoneNumber(phoneNumber, selectedCountry.hint)
              : phoneNumber
          }
          onChange={handlePhoneChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={selectedCountry?.hint || "Номер телефона"}
          required={required}
          className="flex-1 min-w-0 h-10 sm:h-12 pl-2 sm:pl-4 pr-2 sm:pr-4 text-sm sm:text-base rounded-r-full focus:outline-none"
          inputMode="numeric"
        />
      </div>
    </div>
  );
}
