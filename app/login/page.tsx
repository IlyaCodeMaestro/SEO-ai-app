"use client";

import type React from "react";

import { useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import Link from "next/link";
import { loginUser } from "@/utils/authService";
import { useRouter } from "next/navigation";

export default function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await loginUser({ login, password, firebase_id: "" });

      // Use replace instead of push for immediate navigation
      // and prevent back button from returning to login page
      router.push("/dashboard/main");
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-black bg-gray-50 px-4 sm:px-6">
      <div className="w-full max-w-md bg-gray-100 dark:bg-gray-800 rounded-3xl p-5 mb-12 sm:p-8  shadow-xl">
        <h1 className="text-xl sm:text-2xl font-medium text-center mb-8 sm:mb-12">
          Вход
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-full text-sm sm:text-base text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
              placeholder="Логин или Электронная почта"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 border border-gray-300 rounded-full text-sm sm:text-base text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
              placeholder="Пароль"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              )}
            </button>
          </div>

          {error && (
            <div className="text-red-500 text-xs sm:text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 sm:py-2.5 px-4 bg-black text-white rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
          >
            {isLoading ? "Вход..." : "Войти"}
          </button>
        </form>

        <div className="mt-3 sm:mt-4 text-center">
          <Link
            href="/reset-password"
            className="text-xs sm:text-sm text-gray-600 hover:underline"
          >
            Забыли пароль?
          </Link>
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <Link
            href="/register"
            className="inline-block py-2 sm:py-2.5 px-4 sm:px-6 bg-black text-white rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-xs sm:text-sm"
          >
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  );
}
