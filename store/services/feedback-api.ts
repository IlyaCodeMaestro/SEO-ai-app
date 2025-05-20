import { createApi } from "@reduxjs/toolkit/query/react"
import type { IFaqResponse } from "../types"
import { axiosBaseQuery } from "@/axios/axiosBaseQuery"

const BASE_URL = "https://api.stage.seo-ai.kz/b"

export const feedbackApi = createApi({
  reducerPath: "feedbackApi",
  baseQuery: axiosBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["Faq"],
  endpoints: (builder) => ({
    getFaqQuestions: builder.query<IFaqResponse, void>({
      query: () => ({
        url: "/v2/feedback/questions",
        method: "GET",
      }),
      providesTags: ["Faq"],
    }),
  }),
})

export const { useGetFaqQuestionsQuery } = feedbackApi
