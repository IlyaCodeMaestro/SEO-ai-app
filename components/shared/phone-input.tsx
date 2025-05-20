"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getCountries } from "@/utils/authService";

interface Country {
  code_id: number;
  name_ru: string;
  code: string;
  flag?: string;
  length?: number
}

interface PhoneInputProps {
  value: string;
  onChange: (value: string, dialCode: string, code_id: number) => void;
  required?: boolean;
}

export default function PhoneInput({ value, onChange, required = false }: PhoneInputProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(value.replace(/^\+\d+\s/, ""));
  const [error, setError] = useState("");

  useEffect(() => {
    getCountries()
      .then((data) => {
        setCountries(data);
        setSelectedCountry(data[0]); 
        onChange(phoneNumber, data[0].code, data[0].code_id);
      })
      .catch((err) => setError(err.message));
  }, []);


  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    onChange(phoneNumber, country.code, country.code_id);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhone = e.target.value.replace(/[^\d]/g, "");

    const maxLen = selectedCountry?.length || 10;
    const trimmedPhone = newPhone.slice(0, maxLen);

    setPhoneNumber(trimmedPhone);

    if (selectedCountry) {
      onChange(trimmedPhone, selectedCountry.code, selectedCountry.code_id);
    }
  };

  return (
    <div className="relative flex w-full rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
      <div className="relative">
        <button
          type="button"
          className="flex items-center h-12 px-3 text-gray-700 bg-gray-50 rounded-l-full border-r border-gray-200 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="mr-1">{selectedCountry?.flag || "🌐"}</span>
          <span className="mr-1">{selectedCountry?.code}</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-60 max-h-60 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg">
            {Array.isArray(countries) && countries.length > 0 && countries?.map((country) => (
              <button
                key={country.code_id}
                type="button"
                className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => handleCountryChange(country)}
              >
                <span className="mr-2">{country.flag || "🌐"}</span>
                <span className="mr-2">{country.code}</span>
                <span>{country.name_ru}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneChange}
        placeholder="Номер телефона"
        required={required}
        className="flex-1 h-12 pl-4 pr-12 rounded-r-full focus:outline-none"
      />
    </div>
  );
}
