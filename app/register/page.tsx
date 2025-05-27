"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import AuthInput from "@/components/provider/auth-input";
import PhoneInput from "@/components/shared/phone-input";
import { checkRegistration } from "@/utils/authService";
import { useRouter } from "next/navigation";

export default function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [codeId, setCodeId] = useState<number>(2);
  const [email, setEmail] = useState("");
  const [accept, setAccept] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handlePhoneChange = (value: string, dial: string, code_id: number) => {
    setPhone(value);
    setCodeId(code_id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!accept) {
      setError("Вы должны принять пользовательское соглашение.");
      return;
    }

    setIsLoading(true);
    try {
      await checkRegistration({
        accept,
        name,
        phone: phone,
        code_id: codeId,
        email,
      });

      const query = new URLSearchParams({
        name,
        phone,
        code_id: codeId.toString(),
        accept: "true",
      }).toString();

      router.push(`/register/step2?${query}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black py-4 sm:py-6 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xs sm:max-w-md bg-gray-100 dark:bg-gray-800 rounded-3xl shadow-xl p-5 mb-16 sm:p-6 lg:p-8">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-medium">
            Регистрация
          </h2>
        </div>

        <p className="text-center text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 lg:mb-8">
          Заполните все поля, чтобы создать аккаунт
        </p>

        <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
          <AuthInput
            icon="user"
            type="text"
            placeholder="Имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {/* Удалил класс overflow-hidden, который мешал отображению выпадающего списка */}
          <div className="w-full">
            <PhoneInput value={phone} onChange={handlePhoneChange} required />
          </div>

          <AuthInput
            icon="mail"
            type="email"
            placeholder="Электронная почта"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="flex items-start">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="h-4 w-4 mt-0.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={accept}
              onChange={(e) => setAccept(e.target.checked)}
            />
            <label
              htmlFor="terms"
              className="ml-2 block text-xs sm:text-sm text-gray-600"
            >
              Я принимаю{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Пользовательское соглашение
              </a>
            </label>
          </div>

          <div className="h-5">
            {error && (
              <div className="text-red-500 text-xs sm:text-sm text-center">
                {error}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent rounded-full shadow-sm text-xs sm:text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
          >
            {isLoading ? "Загрузка..." : "Продолжить"}
          </button>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            У Вас уже есть аккаунт?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Войдите
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
