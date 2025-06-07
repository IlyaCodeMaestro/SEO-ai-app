import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/axios/axiosBaseQuery";

export interface IAffiliateItemResponse {
  link_share: string;
  output: {
    message_kk: string;
    message_en: string;
    message_ru: string;
    message: string;
    result: boolean;
  };
}

export interface IAffiliateShare {
  b_start_color: string;
  b_end_color: string;
  title: string;
  id: number;
}

export interface IAffiliateResponse {
  link_share: string;
  shares: IAffiliateShare[];
  output: {
    message_kk: string;
    message_en: string;
    message_ru: string;
    message: string;
    result: boolean;
  };
}

const BASE_URL = "https://api.stage.seo-ai.kz/c";

export const affiliateApi = createApi({
  reducerPath: "affiliateApi",
  baseQuery: axiosBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["Affiliate"],
  endpoints: (builder) => ({
    getAffiliateItem: builder.query<IAffiliateItemResponse, number>({
      query: (affiliateId = 1) => ({
        url: `/v2/affiliate/item?affiliate_id=${affiliateId}`,
        method: "GET",
      }),
      providesTags: ["Affiliate"],
    }),
    getAffiliate: builder.query<IAffiliateResponse, void>({
      query: () => ({
        url: "/v2/affiliate",
        method: "GET",
      }),
      providesTags: ["Affiliate"],
    }),
  }),
});

export const { useGetAffiliateItemQuery, useGetAffiliateQuery } = affiliateApi;
