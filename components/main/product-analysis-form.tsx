"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMediaQuery } from "@/hooks/use-media-query";
// Добавить импорт хука usePostCardMutation и useState для обработки состояния загрузки и ответа
import { useState } from "react";
import { usePostCardMutation } from "@/store/services/main";
import { useLanguage } from "../provider/language-provider";

// Обновить интерфейс ProductAnalysisFormProps, чтобы включить обработку ответа от API
interface ProductAnalysisFormProps {
  onClose: () => void;
  onSubmit: (data: {
    sku: string;
    competitorSku?: string;
    cardId?: number;
  }) => void;
}

export function ProductAnalysisForm({
  onClose,
  onSubmit,
}: ProductAnalysisFormProps) {
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

  // Добавить состояние для обработки ошибок и загрузки
  const [error, setError] = useState("");
  const [postCard, { isLoading }] = usePostCardMutation();

  // Обновить функцию onFormSubmit, чтобы она вызывала метод postCard
  const onFormSubmit = async (data) => {
    data.competitorSku = data.competitorSku || null;
    console.log("s", data);
    try {
      // Vызываем API метод postCard с нужными параметрами
      // For analysis, we use type_id: 2
      const response = await postCard({
        top_article: Number.parseInt(data.competitorSku) || null,
        article: Number.parseInt(data.sku) || 0,
        type_id: 2, // This is for analysis
      }).unwrap();

      console.log(response);
      // Если запрос успешен, передаем данные формы и ID карточки в родительский компонент
      if (response.output.result) {
        console.log(200);
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
            <h2 className="text-black font-medium text-xl dark:text-white">
              {t("product.analysis.title")}
            </h2>
          </div>

          {/* Форма */}
          <div className="px-4">
            <form className="space-y-8" onSubmit={handleSubmit(onFormSubmit)}>
              <div className="space-y-3">
                <p className="text-sm text-gray-500 text-center">
                  {t("product.analysis.enter.sku")}
                </p>
                <div>
                  <Input
                    id="sku"
                    className={`mt-1 bg-gray-100 rounded-full h-[45px] text-center  max-w-[320px]  mx-auto ${
                      errors.sku ? "border-red-500" : ""
                    }`}
                    placeholder={t("product.analysis.sku")}
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

              <div className=" space-y-2">
                <p className="text-sm text-gray-500 text-center">
                  {t("product.analysis.enter.competitor")}
                </p>
                <div>
                  <Input
                    id="competitorSku"
                    className={`mt-1 bg-gray-100 rounded-full h-[45px] text-center max-w-[320px] mx-auto ${
                      errors.competitorSku ? "border-red-500" : ""
                    }`}
                    placeholder={t("product.analysis.competitor")}
                    {...register("competitorSku", { required: false })}
                  />
                  {errors.competitorSku && (
                    <p className="text-red-500 text-xs mt-1 text-center">
                      {t("validation.required")}
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-500  text-center px-4">
                  {t("product.analysis.note")}
                </p>
              </div>

              <div className="flex justify-center">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[#64cada] to-[#4169E1] text-white rounded-full h-[45px] border border-white shadow-custom inline-block px-8"
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
              {t("product.analysis.title")}
            </h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onFormSubmit)}>
            <div className="space-y-3">
              <p className="text-sm text-gray-500 text-center">
                {t("product.analysis.enter.sku")}
              </p>
              <div>
                <Input
                  id="sku"
                  className={`mt-1 bg-gray-100 rounded-full h-[45px] text-center max-w-[320px] mx-auto ${
                    errors.sku ? "border-red-500" : ""
                  }`}
                  placeholder={t("product.analysis.sku")}
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
                {t("product.analysis.enter.competitor")}
              </p>
              <div>
                <Input
                  id="competitorSku"
                  className={`mt-1 bg-gray-100 rounded-full h-[45px] text-center max-w-[320px] mx-auto ${
                    errors.competitorSku ? "border-red-500" : ""
                  }`}
                  placeholder={t("product.analysis.competitor")}
                  {...register("competitorSku", { required: false })}
                />
                {errors.competitorSku && (
                  <p className="text-red-500 text-xs mt-1 text-center">
                    {t("validation.required")}
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-500   text-center px-4">
                {t("product.analysis.note")}
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#64cada] to-[#4169E1] text-white rounded-full h-[45px] border border-white shadow-custom inline-block px-8"
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
