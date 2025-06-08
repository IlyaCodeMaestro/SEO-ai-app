import { createApi } from "@reduxjs/toolkit/query/react";
import type { IFaqResponse, IFeedbackTypesResponse } from "../types";
import { axiosBaseQuery } from "@/axios/axiosBaseQuery";

const BASE_URL = "https://api.stage.seo-ai.kz/b";

export const feedbackApi = createApi({
  reducerPath: "feedbackApi",
  baseQuery: axiosBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["Faq", "FeedbackTypes"],
  endpoints: (builder) => ({
    getFaqQuestions: builder.query<IFaqResponse, void>({
      query: () => ({
        url: "/v2/feedback/questions",
        method: "GET",
      }),
      providesTags: ["Faq"],
    }),
    getFeedbackTypes: builder.query<IFeedbackTypesResponse, void>({
      query: () => ({
        url: "/v2/feedback",
        method: "GET",
      }),
      providesTags: ["FeedbackTypes"],
    }),
  }),
});

export const { useGetFaqQuestionsQuery, useGetFeedbackTypesQuery } =
  feedbackApi;
