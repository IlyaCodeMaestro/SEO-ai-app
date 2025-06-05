"use client";

import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/utils/authService";

import { useToast } from "@/hooks/use-toast";

export default function NewPasswordPage() {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Получаем данные из sessionStorage
    const savedEmail = sessionStorage.getItem("reset_email");
    const savedCode = sessionStorage.getItem("reset_code");

    if (!savedEmail || !savedCode) {
      // Если нет данных, перенаправляем на страницу сброса пароля
      router.push("/reset-password");
      return;
    }

    setEmail(savedEmail);
    setCode(savedCode);
  }, [router]);

  const handleSubmit = async () => {
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Заполните все поля");
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Пароли не совпадают");
      toast({
        title: "Ошибка",
        description: "Пароли не совпадают",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      setError("Пароль должен содержать минимум 8 символов");
      toast({
        title: "Ошибка",
        description: "Пароль должен содержать минимум 8 символов",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPassword({
        email,
        code,
        new_password: newPassword,
      });

      // Показываем уведомление об успехе
      toast({
        title: "Успешно!",
        description:
          response.message_ru || response.message || "Пароль успешно изменен",
        variant: "default",
      });

      // Очищаем sessionStorage
      sessionStorage.removeItem("reset_email");
      sessionStorage.removeItem("reset_code");

      // Небольшая задержка перед редиректом, чтобы пользователь увидел уведомление
      setTimeout(() => {
        window.location.href =
          "/login?message=" +
          encodeURIComponent(response.message_ru || response.message);
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Произошла ошибка";
      setError(errorMessage);
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!email || !code) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-black bg-gray-50 px-4 sm:px-6">
        <div className="w-full max-w-md bg-gray-100 dark:bg-gray-800 rounded-3xl p-5 mb-12 sm:p-8 shadow-xl">
          <p className="text-center dark:text-white">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-black bg-gray-50 px-4 sm:px-6">
      <div className="w-full max-w-md bg-gray-100 dark:bg-gray-800 rounded-3xl p-5 mb-12 sm:p-8 shadow-xl">
        <h1 className="text-xl sm:text-2xl font-medium text-center mb-8 sm:mb-12 dark:text-white">
          Восстановление пароля
        </h1>

        <div className="space-y-4 sm:space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="Новый пароль"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="block w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-full text-sm sm:text-base text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              disabled={isLoading}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              )}
            </button>
          </div>

          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-2 leading-relaxed">
            Пароль должен содержать не менее 8 символов, включая как минимум
            одну строчную букву, одну заглавную букву, одну цифру и один
            специальный символ (например, !, @, #, $, %, _ и т.п.).
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Повторите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-full text-sm sm:text-base text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              )}
            </button>
          </div>

          {error && (
            <div className="text-red-500 dark:text-red-400 text-xs sm:text-sm text-center px-2">
              {error}
            </div>
          )}

          <div className="pt-2 sm:pt-4">
            <button
              onClick={handleSubmit}
              disabled={
                isLoading ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword
              }
              className="w-full py-2 sm:py-2.5 px-4 bg-black dark:bg-white dark:text-black text-white rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                "Войти"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
