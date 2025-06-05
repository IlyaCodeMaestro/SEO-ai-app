import Cookies from "js-cookie";

export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://api.stage.seo-ai.kz/b";

const getHeaders = () => ({
  "Content-Type": "application/json",
  "Platform-Type": "WEB",
  Version: "1",
  "Debug-Mode": "true",
});

export async function getCountries() {
  const res = await fetch(`${BASE_URL}/v1/countries`, {
    method: "GET",
    headers: getHeaders(),
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
  phone_code_id: number;
  email: string;
}) {
  const res = await fetch(`${BASE_URL}/v1/registration/check`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  const json = await res.json();
  console.log(json);
  if (!json.output?.result)
    throw new Error(json.output.message_ru || json.output.message);
  return json;
}

export async function checkRegistration2(data: {
  login: string;
  password: string;
  email: string;
  phone: string;
  phone_code_id: number;
  name: string;
  accept: boolean;
}) {
  const res = await fetch(`${BASE_URL}/v1/registration/check`, {
    method: "POST",
    headers: getHeaders(),
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
  phone_code_id: number;
  name: string;
  code: string;
  accept: boolean;
  install_url: string;
}) {
  const res = await fetch(`${BASE_URL}/v1/registration`, {
    method: "POST",
    headers: getHeaders(),
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
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!json.output?.result) {
    throw new Error(
      json.output?.message_ru || json.output?.message || "Неизвестная ошибка"
    );
  }

  const { sessionId, userId } = json.user;

  // Set cookies and localStorage synchronously
  Cookies.set("sessionId", sessionId);
  Cookies.set("userId", userId.toString());
  localStorage.setItem("sessionId", sessionId);
  localStorage.setItem("userId", userId.toString());

  return json;
}

// Функции для сброса пароля
export async function requestPasswordResetCode(data: {
  email: string;
  name?: string;
}) {
  const res = await fetch(`${BASE_URL}/v1/code`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      type_id: 2,
      email: data.email,
      name: data.name || "",
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const responseText = await res.text();

  if (!responseText) {
    throw new Error("Сервер вернул пустой ответ");
  }

  let json;
  try {
    json = JSON.parse(responseText);
  } catch (parseError) {
    console.error("Ошибка парсинга JSON:", responseText);
    throw new Error("Сервер вернул некорректный JSON");
  }

  if (!json.output?.result) {
    throw new Error(
      json.output?.message_ru ||
        json.output?.message ||
        "Ошибка при отправке кода"
    );
  }

  return json.output;
}

export async function verifyPasswordResetCode(data: {
  email: string;
  code: string;
}) {
  const res = await fetch(`${BASE_URL}/v1/code`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({
      type_id: 2,
      email: data.email,
      code: data.code,
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const responseText = await res.text();

  if (!responseText) {
    throw new Error("Сервер вернул пустой ответ");
  }

  let json;
  try {
    json = JSON.parse(responseText);
  } catch (parseError) {
    console.error("Ошибка парсинга JSON:", responseText);
    throw new Error("Сервер вернул некорректный JSON");
  }

  if (!json.output?.result) {
    throw new Error(
      json.output?.message_ru ||
        json.output?.message ||
        "Неверный код подтверждения"
    );
  }

  return json.output;
}

export async function resetPassword(data: {
  email: string;
  code: string;
  new_password: string;
}) {
  const res = await fetch(`${BASE_URL}/v1/password/reset`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      email: data.email,
      code: data.code,
      new_password: data.new_password,
    }),
  });

  // Проверяем статус ответа
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  // Получаем текст ответа
  const responseText = await res.text();

  // Проверяем, что ответ не пустой
  if (!responseText) {
    throw new Error("Сервер вернул пустой ответ");
  }

  let json;
  try {
    json = JSON.parse(responseText);
  } catch (parseError) {
    console.error("Ошибка парсинга JSON:", responseText);
    throw new Error("Сервер вернул некорректный JSON");
  }

  if (!json.output?.result) {
    throw new Error(
      json.output?.message_ru ||
        json.output?.message ||
        "Ошибка при сбросе пароля"
    );
  }

  return json.output;
}
export function logout() {
  localStorage.removeItem("sessionId");
  localStorage.removeItem("userId");
  Cookies.remove("sessionId");
  Cookies.remove("userId");
}
