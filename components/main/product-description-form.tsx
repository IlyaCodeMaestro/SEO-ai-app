"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useState } from "react";
import { usePostCardMutation } from "@/store/services/main";
import { useLanguage } from "../provider/language-provider";

interface ProductDescriptionFormProps {
  onClose: () => void;
  onSubmit: (data: {
    sku: string;
    competitorSku?: string;
    cardId?: number;
  }) => void;
}

export function ProductDescriptionForm({
  onClose,
  onSubmit,
}: ProductDescriptionFormProps) {
  const { t } = useLanguage();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      sku: "",
      competitorSku: "",
    },
  });

  // Добавляем состояние для обработки ошибок и загрузки
  const [error, setError] = useState("");
  const [postCard, { isLoading }] = usePostCardMutation();

  // Update the onFormSubmit function to use the correct type_id for description
  const onFormSubmit = async (data) => {
    try {
      data.competitorSku = data.competitorSku || null;
      // Вызываем API метод postCard с нужными параметрами
      // For description, we use type_id: 1
      const response = await postCard({
        top_article: Number.parseInt(data.competitorSku) || null,
        article: Number.parseInt(data.sku) || 0,
        type_id: 1, // This is for description
      }).unwrap();

      // Если запрос успешен, передаем данные формы и ID карточки в родительский компонент
      if (response.output.result) {
        onSubmit({
          ...data,
          cardId: response.card.id,
        });
      } else {
        // Если запрос не успешен, показываем сообщение об ошибке
        setError(response.output.message_ru || response.output.message);
      }
    } catch (error) {
      console.error("Error calling postCard:", error);
      setError(t("common.error"));
    }
  };

  return (
    <div className="h-full relative dark:bg-[#404040]">
      {/* Кнопка закрытия (X) в правом верхнем углу - только для десктопа */}
      {!isMobile && (
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5 dark:text-blue-600" />
          </button>
        </div>
      )}

      {/* Мобильная версия */}
      {isMobile && (
        <div className="flex flex-col">
          {/* Верхняя панель с кнопкой назад и заголовком */}
          <div className="flex items-center p-4">
            <button
              onClick={onClose}
              className="p-1"
              aria-label={t("common.back")}
            >
              <ArrowLeft className="h-5 w-5 dark:text-blue-600" />
            </button>
            <div className="flex-1 text-center mr-5">
              <h1 className="text-blue-500 font-medium text-xl">
                {t("common.main")}
              </h1>
            </div>
          </div>

          {/* Подзаголовок с отступом */}
          <div className="text-center mb-8 mt-6">
            <h2 className="text-black text-xl font-medium dark:text-white">
              {t("product.description.title")}
            </h2>
          </div>

          {/* Форма */}
          <div className="px-4">
            <form className="space-y-8" onSubmit={handleSubmit(onFormSubmit)}>
              <div className="space-y-3">
                <p className="text-sm text-gray-500 text-center">
                  {t("product.description.enter.sku")}
                </p>
                <p className="text-xs text-gray-500 text-center">
                  {t("product.description.no.card")}
                </p>
                <div>
                  <Input
                    inputMode="numeric"
                    id="sku"
                    className={`mt-1 bg-gray-100 rounded-full  h-[45px] text-center max-w-[320px] mx-auto ${
                      errors.sku ? "border-red-500" : ""
                    }`}
                    placeholder={t("product.description.sku")}
                    autoFocus
                    {...register("sku", { required: true })}
                  />
                  {errors.sku && (
                    <p className="text-red-500 text-xs mt-1 text-center">
                      {t("validation.required")}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-500 text-center">
                  {t("product.description.enter.competitor")}
                </p>
                <div>
                  <Input
                    inputMode="numeric"
                    id="competitorSku"
                    className={`mt-1 bg-gray-100 rounded-full  h-[45px] text-center max-w-[320px] mx-auto ${
                      errors.competitorSku ? "border-red-500" : ""
                    }`}
                    placeholder={t("product.description.competitor")}
                    {...register("competitorSku", { required: false })}
                  />
                  {errors.competitorSku && (
                    <p className="text-red-500 text-xs mt-1 text-center">
                      {t("validation.required")}
                    </p>
                  )}
                </div>
                <div className="text-xs text-gray-500  text-center px-4">
                  {t("product.description.note")}
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[#2865ff] to-[rgba(11,60,187,1)] text-white rounded-full  h-[45px] border border-white shadow-custom inline-block px-8"
                  disabled={isLoading}
                >
                  {isLoading ? t("common.loading") : t("common.continue")}
                </Button>
              </div>
              {error && (
                <p className="text-red-500 text-sm text-center mt-2">{error}</p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Десктопная версия */}
      {!isMobile && (
        <div className="max-w-md mx-auto pt-4 p-6">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <h2 className="text-black font-medium text-xl dark:text-white">
              {t("product.description.title")}
            </h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onFormSubmit)}>
            <div className="space-y-3">
              <p className="text-sm text-gray-500 text-center">
                {t("product.description.enter.sku")}
              </p>
              <p className="text-xs text-gray-500 text-center">
                {t("product.description.no.card")}
              </p>
              <div>
                <Input
                  id="sku"
                  inputMode="numeric"
                  className={`mt-1 bg-gray-100 rounded-full  h-[45px] text-center max-w-[320px] mx-auto ${
                    errors.sku ? "border-red-500" : ""
                  }`}
                  placeholder={t("product.description.sku")}
                  autoFocus
                  {...register("sku", { required: true })}
                />
                {errors.sku && (
                  <p className="text-red-500 text-xs mt-1 text-center">
                    {t("validation.required")}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-500 text-center">
                {t("product.description.enter.competitor")}
              </p>
              <div>
                <Input
                  inputMode="numeric"
                  id="competitorSku"
                  className={`mt-1 bg-gray-100 rounded-full  h-[45px] text-center max-w-[320px] mx-auto ${
                    errors.competitorSku ? "border-red-500" : ""
                  }`}
                  placeholder={t("product.description.competitor")}
                  {...register("competitorSku", { required: false })}
                />
                {errors.competitorSku && (
                  <p className="text-red-500 text-xs mt-1 text-center">
                    {t("validation.required")}
                  </p>
                )}
              </div>
              <div className="text-xs text-gray-500  text-center px-4">
                {t("product.description.note")}
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#0d52ff] to-[rgba(11,60,187,1)] text-white rounded-full h-[45px] border border-white shadow-custom inline-block px-8"
                disabled={isLoading}
              >
                {isLoading ? t("common.loading") : t("common.continue")}
              </Button>
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
