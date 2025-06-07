// Добавляем новые интерфейсы для настроек
export interface ISettingsRequest {
  language_id: number // 1 - казахский, 2 - английский, 3 - русский
  theme_id: number // 1 - светлая тема, 2 - темная тема
}

export interface ISettingsResponse {
  output: {
    message_kk: string
    message_en: string
    message_ru: string
    message: string
    result: boolean
  }
  settings?: {
    language_id: number
    theme_id: number
  }
}

export interface IGetSettingsResponse {
  settings: {
    language_id: number
    theme_id: number
  }
  output: {
    message_kk: string
    message_en: string
    message_ru: string
    message: string
    result: boolean
  }
}
