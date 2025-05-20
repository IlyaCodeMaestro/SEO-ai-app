import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import type { AxiosRequestConfig, AxiosError } from 'axios'
import axios from 'axios'

export const axiosBaseQuery =
    (
        { baseUrl }: { baseUrl: string } = { baseUrl: '' }
    ): BaseQueryFn<
        {
            url: string
            method: AxiosRequestConfig['method']
            data?: AxiosRequestConfig['data']
            params?: AxiosRequestConfig['params']
        },
        unknown,
        unknown
    > =>
        async ({ url, method, data, params }) => {
            try {
                const sessionId = localStorage.getItem('sessionId')
                const userId = localStorage.getItem('userId')

                const result = await axios({
                    url: baseUrl + url,
                    method,
                    data,
                    params,
                    withCredentials: true,
                    headers: {
                        ...(sessionId && { 'Session-id': sessionId }),
                        ...(userId && { 'User-id': userId }),
                        ...({'Platform-Type': 'WEB'}),
                        ...({'Version': 1}),
                        ...({'Debug-Mode': true})
                    },
                })
                return { data: result.data }
            } catch (axiosError) {
                const err = axiosError as AxiosError
                return {
                    error: {
                        status: err.response?.status,
                        data: err.response?.data || err.message,
                    },
                }
            }
        }