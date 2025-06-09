import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/axios/axiosBaseQuery";
import type {
  IGetSettingsResponse,
  ISettingsRequest,
  ISettingsResponse,
} from "../settings";

const BASE_URL = "https://api.stage.seo-ai.kz/b";

export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: axiosBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["Settings"],
  endpoints: (builder) => ({
    getSettings: builder.query<IGetSettingsResponse, void>({
      query: () => ({
        url: "/v2/settings",
        method: "GET",
      }),
      providesTags: ["Settings"],
    }),
    updateSettings: builder.mutation<ISettingsResponse, ISettingsRequest>({
      query: (body) => ({
        url: "/v2/settings",
        method: "PUT",
        data: body,
      }),
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
