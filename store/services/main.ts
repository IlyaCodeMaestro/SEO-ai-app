import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  IMainResponse,
  IProcessResponse,
  IResponseCard,
  IResponseStartAnalysis,
  IResponseStartDescription,
  ICardAnalysisResponse,
  ICardDescriptionResponse,
  IArchiveResponse,
  IProfileResponse,
  IPaySystemsResponse,
  IBalanceRefillRequest,
  IBalanceRefillResponse,
  IBalanceHistoryResponse,
  IBonusExchangeResponse,
  IBonusExchangeRequest,
  IBonusExchangeResult,
  IBonusHistoryResponse,
  IReferralHistoryResponse,
  ITariffsResponse,
  ITariffReconnectResponse,
  ITariffBuyRequest,
  ITariffBuyResponse,
  ITariffReconnectRequest,
  IDeleteAccountInfoResponse,
  IDeleteAccountResponse,
  IGetBadge,
} from "../types";
import { axiosBaseQuery } from "@/axios/axiosBaseQuery";

const BASE_URL = "https://api.stage.seo-ai.kz/c";

// New interface for cursor-based pagination
interface IBonusHistoryRequest {
  cursor?: string | null;
  limit?: number;
}

export const mainApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: [
    "Archive",
    "Process",
    "Profile",
    "PaySystems",
    "BalanceHistory",
    "BonusExchange",
    "BonusHistory",
    "ReferralHistory",
    "Tariffs",
    "DeleteRequest",
  ],
  endpoints: (builder) => ({
    getMainInfo: builder.query<IMainResponse, void>({
      query: () => ({
        url: "/v2/main",
        method: "GET",
      }),
    }),
    getProfile: builder.query<IProfileResponse, void>({
      query: () => ({
        url: "/v2/profile",
        method: "GET",
      }),
      providesTags: ["Profile"],
    }),
    getPaySystems: builder.query<IPaySystemsResponse, void>({
      query: () => ({
        url: "/v2/pay/systems",
        method: "GET",
      }),
      providesTags: ["PaySystems"],
    }),
    refillBalance: builder.mutation<
      IBalanceRefillResponse,
      IBalanceRefillRequest
    >({
      query: (body) => ({
        url: "/v1/balance/refill",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Profile", "BalanceHistory"],
    }),
    getBalanceHistory: builder.query<IBalanceHistoryResponse, number>({
      query: (page = 1) => ({
        url: `/v1/balance/extract?page=${page}`,
        method: "GET",
      }),
      providesTags: ["BalanceHistory"],
    }),
    getBonusExchange: builder.query<IBonusExchangeResponse, void>({
      query: () => ({
        url: "/v2/bonuses/exchange",
        method: "GET",
      }),
      providesTags: ["BonusExchange"],
    }),
    exchangeBonuses: builder.mutation<
      IBonusExchangeResult,
      IBonusExchangeRequest
    >({
      query: (body) => ({
        url: "/v2/bonuses/exchange",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Profile", "BonusExchange", "BonusHistory"],
    }),
    // Updated getBonusHistory to use cursor-based pagination
    getBonusHistory: builder.query<IBonusHistoryResponse, IBonusHistoryRequest>(
      {
        query: ({ cursor = null, limit = 10 }) => {
          let url = `/v2/bonuses/extract?limit=${limit}`;
          if (cursor) {
            url += `&cursor=${encodeURIComponent(cursor)}`;
          }
          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["BonusHistory"],
        // Merge results for infinite scroll behavior
        serializeQueryArgs: ({ endpointName }) => {
          return endpointName;
        },
        merge: (currentCache, newItems, { arg }) => {
          // If no cursor, replace cache (first load)
          if (!arg.cursor) {
            return newItems;
          }
          // Otherwise, merge with existing cache
          return {
            ...newItems,
            date_events: [
              ...(currentCache?.date_events || []),
              ...(newItems.date_events || []),
            ],
          };
        },
        forceRefetch({ currentArg, previousArg }) {
          return currentArg?.cursor !== previousArg?.cursor;
        },
      }
    ),
    // Оставляем старый API для рефералов пока не обновим бэкенд
    getReferralHistory: builder.query<IReferralHistoryResponse, number>({
      query: (page = 1) => ({
        url: `/v1/referrals/extract?page=${page}`,
        method: "GET",
      }),
      providesTags: ["ReferralHistory"],
    }),
    getTariffs: builder.query<ITariffsResponse, void>({
      query: () => ({
        url: "/v2/tariffs",
        method: "GET",
      }),
      providesTags: ["Tariffs"],
    }),
    reconnectTariff: builder.mutation<
      ITariffReconnectResponse,
      ITariffReconnectRequest
    >({
      query: (body) => ({
        url: "/v2/tariff/reconnect",
        method: "PUT",
        data: body,
      }),
      invalidatesTags: ["Tariffs", "Profile"],
    }),
    buyTariff: builder.mutation<ITariffBuyResponse, ITariffBuyRequest>({
      query: (body) => ({
        url: "/v2/tariff/buy",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Tariffs", "Profile", "BalanceHistory"],
    }),
    postCard: builder.mutation<IResponseCard, any>({
      query: (body) => ({
        url: "/v1/static/card",
        method: "POST",
        data: body,
      }),
    }),
    startAnalysis: builder.mutation<IResponseStartAnalysis, any>({
      query: (body) => ({
        url: "/v2/static/card/analyse",
        method: "PUT",
        data: body,
      }),
      invalidatesTags: ["Process", "Archive"],
    }),
    startDescription: builder.mutation<IResponseStartDescription, any>({
      query: (body) => ({
        url: "/v2/static/card/description",
        method: "PUT",
        data: body,
      }),
      invalidatesTags: ["Process", "Archive"],
    }),
    startAnalysisDescription: builder.mutation<IResponseStartDescription, any>({
      query: (body) => ({
        url: "/v1/static/card/analysis",
        method: "PUT",
        data: body,
      }),
      invalidatesTags: ["Process", "Archive"],
    }),
    getProcessList: builder.query<IProcessResponse, void>({
      query: () => ({
        url: "/v2/process",
        method: "GET",
      }),
      providesTags: ["Process"],
    }),
    getCardAnalysis: builder.query<ICardAnalysisResponse, number>({
      query: (cardId) => ({
        url: `/v1/card/analysis?card_id=${cardId}`,
        method: "GET",
      }),
    }),
    getBadge: builder.query<IGetBadge, void>({
      query: () => ({
        url: `/v1/badge`,
        method: "GET",
      }),
    }),
    getCardDescription: builder.query<ICardDescriptionResponse, number>({
      query: (cardId) => ({
        url: `/v1/card/description?card_id=${cardId}`,
        method: "GET",
      }),
    }),
    getArchive: builder.query<IArchiveResponse, number>({
      query: (page = 1) => ({
        url: `/v1/archive?page=${page}`,
        method: "GET",
      }),
      providesTags: ["Archive"],
    }),
    getDeleteAccountInfo: builder.query<IDeleteAccountInfoResponse, void>({
      query: () => ({
        url: "/v1/profile/delete",
        method: "GET",
      }),
      providesTags: ["DeleteRequest"],
    }),
    requestDeleteAccount: builder.mutation<IDeleteAccountResponse, void>({
      query: () => ({
        url: "/v1/profile/delete",
        method: "POST",
      }),
      invalidatesTags: ["DeleteRequest", "Profile"],
    }),
    confirmDeleteAccount: builder.mutation<IDeleteAccountResponse, void>({
      query: () => ({
        url: "/v1/profile/delete",
        method: "DELETE",
      }),
      invalidatesTags: ["DeleteRequest", "Profile"],
    }),
  }),
});

export const {
  useGetMainInfoQuery,
  useGetProfileQuery,
  useGetPaySystemsQuery,
  useRefillBalanceMutation,
  useGetBalanceHistoryQuery,
  useGetBonusExchangeQuery,
  useExchangeBonusesMutation,
  useGetBonusHistoryQuery,
  useGetReferralHistoryQuery,
  useGetTariffsQuery,
  useReconnectTariffMutation,
  useBuyTariffMutation,
  usePostCardMutation,
  useStartAnalysisMutation,
  useStartDescriptionMutation,
  useStartAnalysisDescriptionMutation,
  useGetProcessListQuery,
  useGetCardAnalysisQuery,
  useGetBadgeQuery,
  useGetCardDescriptionQuery,
  useGetArchiveQuery,
  useGetDeleteAccountInfoQuery,
  useRequestDeleteAccountMutation,
  useConfirmDeleteAccountMutation,
} = mainApi;
