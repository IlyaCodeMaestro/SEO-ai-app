"use client";

import type React from "react";
import { useState, Suspense } from "react";
import Link from "next/link";
import AuthInput from "@/components/provider/auth-input";
import { registerUser, checkRegistration2 } from "@/utils/authService";
import { useSearchParams } from "next/navigation";

// Create a separate component that uses useSearchParams
function RegisterForm() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailCode, setEmailCode] = useState(false);

  const searchParams = useSearchParams();

  const name = searchParams.get("name") || "";
  const phone = searchParams.get("phone") || "";
  const email = searchParams.get("email") || "";
  const accept = searchParams.get("accept") === "true";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      setIsLoading(true);
      console.log(email, login, password, phone, name, accept);
      const res = await checkRegistration2({
        login,
        password,
        email,
        phone: phone,
        phone_code_id: 1,
        name: name,
        // code: verificationCode,
        accept: accept,
        // url: "73G2V0DA",
      });

      if (res.output.result) {
        setEmailCode(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      setIsLoading(true);
      console.log(email, login, password, phone, name, accept);
      const res = await registerUser({
        login,
        password,
        email,
        phone: phone,
        phone_code_id: 1,
        name: name,
        code: verificationCode,
        accept: accept,
        install_url: "google.com",
      });

      if (res.output.result) {
        window.location.href = "/login";
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!emailCode) {
    return (
      <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
        <AuthInput
          icon="user"
          type="text"
          placeholder="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
        />

        <AuthInput
          icon="lock"
          type="password"
          placeholder="Пароль"
          showPasswordToggle
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <AuthInput
          icon="lock"
          type="password"
          placeholder="Повторить пароль"
          showPasswordToggle
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <p className="text-xs sm:text-sm text-gray-600 text-center">
          Код отправлен Вам на электронную почту
        </p>

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
          {isLoading ? "Загрузка..." : "Зарегистрироваться"}
        </button>
      </form>
    );
  }

  return (
    <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmitFinal}>
      <AuthInput
        icon="user"
        type="text"
        placeholder="Логин"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
        required
      />

      <AuthInput
        icon="lock"
        type="password"
        placeholder="Пароль"
        showPasswordToggle
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <AuthInput
        icon="lock"
        type="password"
        placeholder="Повторить пароль"
        showPasswordToggle
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <p className="text-xs sm:text-sm text-gray-600 text-center">
        Код отправлен Вам на электронную почту
      </p>

      <AuthInput
        icon="lock"
        type="text"
        placeholder="Код"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
        required
      />

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
        {isLoading ? "Загрузка..." : "Зарегистрироваться"}
      </button>
    </form>
  );
}

// Main component that wraps the form in Suspense
export default function RegisterStep2() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black py-4 sm:py-6 lg:py-12 px-3 sm:px-4 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md bg-gray-100 dark:bg-gray-800 rounded-3xl shadow-xl p-4  mb-16 sm:p-6 lg:p-8">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-medium">
            Регистрация
          </h2>
        </div>

        <p className="text-center text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 lg:mb-8">
          Заполните все поля, чтобы создать аккаунт
        </p>

        <Suspense fallback={<div className="text-center">Загрузка...</div>}>
          <RegisterForm />
        </Suspense>

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
