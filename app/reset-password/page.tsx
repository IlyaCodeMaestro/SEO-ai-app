"use client";

import { useState } from "react";
import { Mail, Lock, Loader2 } from "lucide-react";

import {
  requestPasswordResetCode,
  verifyPasswordResetCode,
} from "@/utils/authService";

export default function PasswordResetPage() {
  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleContinue = async () => {
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      if (step === 1 && email) {
        // Запрос кода подтверждения
        const response = await requestPasswordResetCode({ email });
        setSuccessMessage(response.message_ru || response.message);
        setStep(2);
      } else if (step === 2 && email && code) {
        // Проверка кода
        await verifyPasswordResetCode({ email, code });

        // Сохраняем данные для следующей страницы
        sessionStorage.setItem("reset_email", email);
        sessionStorage.setItem("reset_code", code);

        // Переходим на страницу создания нового пароля
        window.location.href = "/reset-password/new-password";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-black bg-gray-50 px-4 sm:px-6">
      <div className="w-full max-w-md bg-gray-100 dark:bg-gray-800 rounded-3xl p-5 mb-12 sm:p-8 shadow-xl">
        <h1 className="text-xl sm:text-2xl font-medium text-center mb-8 sm:mb-12 dark:text-white">
          Восстановление пароля
        </h1>

        <div className="space-y-4 sm:space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <input
              type="email"
              placeholder="Электронная почта"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-full text-sm sm:text-base text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled={step > 1 || isLoading}
            />
          </div>

          {step >= 2 && (
            <>
              {successMessage && (
                <p className="text-center text-xs sm:text-sm text-green-600 dark:text-green-400 px-2">
                  {successMessage}
                </p>
              )}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <input
                  type="text"
                  placeholder="Код"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-full text-sm sm:text-base text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          {error && (
            <div className="text-red-500 dark:text-red-400 text-xs sm:text-sm text-center px-2">
              {error}
            </div>
          )}

          <div className="pt-2 sm:pt-4">
            <button
              onClick={handleContinue}
              disabled={
                isLoading ||
                (step === 1 && !email) ||
                (step === 2 && (!email || !code))
              }
              className="w-full py-2 sm:py-2.5 px-4 bg-black dark:bg-white dark:text-black text-white rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  Загрузка...
                </>
              ) : (
                "Продолжить"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
