import Cookies from "js-cookie";

export const BASE_URL = "https://api.stage.seo-ai.kz/b";

export async function getCountries() {
  const res = await fetch(`${BASE_URL}/v1/countries`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Platform-Type": "WEB",
      Version: "1",
      "Debug-Mode": "true",
    },
  });

  const json = await res.json();

  if (!json.output?.result) {
    throw new Error(
      json.output?.message_ru ||
        json.output?.message ||
        "Ошибка при получении стран"
    );
  }

  return json.countries;
}

export async function checkRegistration(data: {
  accept: boolean;
  name: string;
  phone: string;
  code_id: number;
  email: string;
}) {
  const res = await fetch(`${BASE_URL}/v1/registration/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Platform-Type": "WEB",
      Version: "1",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!json.output?.result)
    throw new Error(json.output.message_ru || json.output.message);
  return json;
}

export async function registerUser(data: {
  login: string;
  password: string;
  email: string;
  phone: string;
  code_id: number;
  name: string;
  code: string;
  accept: boolean;
  url: string;
}) {
  const res = await fetch(`${BASE_URL}/v1/registration`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Platform-Type": "WEB",
      Version: "1",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!json.output?.result)
    throw new Error(json.output.message_ru || json.output.message);
  return json;
}

export async function loginUser(data: {
  login: string;
  password: string;
  firebase_id?: string;
}) {
  const res = await fetch(`${BASE_URL}/v1/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Platform-Type": "WEB",
      Version: "1",
      "Debug-Mode": "true",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!json.output?.result) {
    throw new Error(
      json.output?.message_ru || json.output?.message || "Неизвестная ошибка"
    );
  }

  const { sessionId, userId } = json.user;
  Cookies.set("sessionId", sessionId)
  Cookies.set("userId", userId.toString())
  localStorage.setItem("sessionId", sessionId)
  localStorage.setItem("userId", userId.toString())

  return json;
}

export function logout() {
  localStorage.removeItem("sessionId")
  localStorage.removeItem("userId")
  Cookies.set("sessionId", sessionId)
  Cookies.set("userId", userId.toString())
}
