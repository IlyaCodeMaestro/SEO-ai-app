import { createApi } from "@reduxjs/toolkit/query/react"
import type { ISessionsResponse } from "../types"
import { axiosBaseQuery } from "@/axios/axiosBaseQuery"

const BASE_URL = "https://api.stage.seo-ai.kz/b"

export const sessionsApi = createApi({
  reducerPath: "sessionsApi",
  baseQuery: axiosBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["Sessions"],
  endpoints: (builder) => ({
    getSessions: builder.query<ISessionsResponse, void>({
      query: () => ({
        url: "/v1/sessions",
        method: "GET",
      }),
      providesTags: ["Sessions"],
    }),
  }),
})

export const { useGetSessionsQuery } = sessionsApi

