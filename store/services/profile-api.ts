import { createApi } from "@reduxjs/toolkit/query/react"
import type { IDeleteAccountInfoResponse, IDeleteAccountResponse } from "../types"
import { axiosBaseQuery } from "@/axios/axiosBaseQuery"

const BASE_URL = "https://api.stage.seo-ai.kz/c"

export const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery: axiosBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["Profile", "DeleteRequest"],
  endpoints: (builder) => ({
    // Получение информации о запросе на удаление аккаунта
    getDeleteAccountInfo: builder.query<IDeleteAccountInfoResponse, void>({
      query: () => ({
        url: "/v1/profile/delete",
        method: "GET",
      }),
      providesTags: ["DeleteRequest"],
    }),

    // Создание запроса на удаление аккаунта
    requestDeleteAccount: builder.mutation<IDeleteAccountResponse, void>({
      query: () => ({
        url: "/v1/profile/delete",
        method: "POST",
      }),
      invalidatesTags: ["DeleteRequest", "Profile"],
    }),

    // Подтверждение удаления аккаунта
    confirmDeleteAccount: builder.mutation<IDeleteAccountResponse, void>({
      query: () => ({
        url: "/v1/profile/delete",
        method: "DELETE",
      }),
      invalidatesTags: ["DeleteRequest", "Profile"],
    }),
  }),
})

export const { useGetDeleteAccountInfoQuery, useRequestDeleteAccountMutation, useConfirmDeleteAccountMutation } =
  profileApi
