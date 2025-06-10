export interface IOutput {
  message_kk: string;
  message_en: string;
  message_ru: string;
  message: string;
  result: boolean;
}

export interface IMainResponse {
  name: string;
  tariff: {
    descriptions: number;
    analyses: number;
  };
  in_process: boolean;
  output: IOutput;
}

export interface IImage {
  image: string;
}

export interface ICard {
  article: string;
  name: string;
  images: Array<IImage>;
  type: string;
  status: string;
  status_color: string;
  type_id: number;
  id: number;
}

export interface IProcessResponse {
  card_dates:
    | {
        cards: ICard[];
        date: string;
        id: number;
      }[]
    | null;
  output: {
    message_kk: string;
    message_en: string;
    message_ru: string;
    message: string;
    result: boolean;
  };
}

export interface IRequestPostCard {
  top_article?: number;
  article: number;
  type_id: number;
}

export interface IResponseCard {
  card: {
    type_id: number;
    id: number;
  };
  output: {
    message_en: string;
    message_kk: string;
    message_ru: string;
    result: boolean;
  };
}

export interface IRequestStartAnalysis {
  card_id: number;
}

export interface IResponseStartAnalysis {
  output: {
    message_en: string;
    message_kk: string;
    message_ru: string;
    message: string;
    result: boolean;
  };
}

export interface IRequestStartDescription {
  card_id: number;
}

export interface IResponseStartDescription {
  output: {
    message_en: string;
    message_kk: string;
    message_ru: string;
    message: string;
    result: boolean;
  };
}

export interface IGetBadge {
  badge: {
    notification_count: number;
    card_count: number;
  };
  output: {
    message_en: string;
    message_kk: string;
    message_ru: string;
    message: string;
    result: boolean;
  };
}

// Add this new interface for the card analysis response
export interface ICardAnalysisResponse {
  notification_read: boolean;
  analysis: {
    availability: number;
    visible: number;
    rating: string;
    irrelevant: {
      count: number;
      words?: Array<{
        word: string;
        frequency: number;
      }>;
    };
    description?: {
      text: string;
      length: number;
    };
    miss: {
      count: number;
      coverage: number;
      words: Array<{
        word: string;
        frequency: number;
        type: number;
      }>;
    };
    used: {
      words: Array<{
        word: string;
        frequency: number;
        type: number;
      }>;
    };
  };
  button: {
    visible: boolean;
    text?: string;
  };
  cards?: Array<{
    article: string;
    brand: string;
    name: string;
    id: number;
    is_user: boolean;
    images: Array<{
      image: string;
    }>;
  }>;
  card: {
    article: string;
    name: string;
    images: Array<{
      image: string;
    }>;
    type: string;
    status: string;
    status_color: string;
    status_id: number;
    type_id: number;
    id: number;
  };
  output: {
    message_kk: string;
    message_en: string;
    message_ru: string;
    message: string;
    result: boolean;
  };
}

// Add this new interface for the card description response
export interface ICardDescriptionResponse {
  card: {
    article: string;
    brand: string;
    name: string;
    images: Array<{
      image: string;
    }>;
    status_id: number;
    type_id: number;
    id: number;
  };
  button: {
    text: string;
    visible: boolean;
  };
  output: {
    message_kk: string;
    message_en: string;
    message_ru: string;
    message: string;
    result: boolean;
  };
}

// Placeholder declaration for ICardDate
type ICardDate = {};

// Add this new interface for the archive response
export interface IArchiveResponse {
  card_dates: IArchiveCardDate[];
  output: {
    message_kk: string;
    message_en: string;
    message_ru: string;
    message: string;
    result: boolean;
  };
}

export interface IArchiveCardDate {
  cards: IArchiveCard[];
  date: string;
  id: number;
}

export interface IArchiveCard {
  article: string;
  name: string;
  images: Array<{
    image: string;
  }>;
  type: string;
  status: string;
  status_color: string;
  badge_visible: boolean;
  type_id: number;
  id: number;
}

// Add this interface to your types.ts file or wherever you define your types

export interface MissedWord {
  word: string;
  frequency: number;
  type: number;
}

// Add this new interface for the profile response
export interface IProfileResponse {
  output: {
    message_kk: string;
    message_en: string;
    message_ru: string;
    message: string;
    result: boolean;
  };
  user: {
    name: string;
    phone: string;
    email: string;
    balance: string;
    bonuses: string;
    tariff: string;
    refill_visible: boolean;
    visible_kk: boolean;
  };
}

// Add these new interfaces for payment systems and balance refill
export interface IPaySystem {
  max_amount: number;
  min_amount: number;
  note: string;
  title: string;
  id: number;
}

export interface IPaySystemsResponse {
  pay_systems: IPaySystem[];
  currency: string;
  output: IOutput;
}

export interface IBalanceRefillRequest {
  system_id: number;
  amount: number;
}

export interface IBalanceRefillResponse {
  next_url: string;
  output: IOutput;
}

// Add these new interfaces for balance history
export interface IBalanceEvent {
  title: string;
  text_color: string;
  value: string;
  time: string;
  id: number;
}

export interface IBalanceDateEvent {
  events: IBalanceEvent[];
  id: number;
  date: string;
}

export interface IBalanceHistoryResponse {
  date_events: IBalanceDateEvent[];
  output: IOutput;
}

// Add these new interfaces for bonus exchange
export interface IBonusExchangeOption {
  title: string;
  id: number;
}

export interface IBonusPrice {
  title: string;
  value: number;
  currency: string;
  id: number;
}

export interface IBonusBalance {
  exchange_bonuses: number;
  exchange_value: number;
  point_price: number;
  currency: string;
  bonuses: number;
}

export interface IBonusExchangeResponse {
  bonuses_exchange: IBonusExchangeOption[];
  transfer_visible: boolean;
  transfer_enable: boolean;
  have_card: boolean;
  balance: IBonusBalance;
  prices: IBonusPrice[];
  output: IOutput;
}

export interface IBonusExchangeRequest {
  exchange_id: number;
}

export interface IBonusExchangeResult {
  output: IOutput;
}

// Добавляем интерфейсы для выписки по бонусам
export interface IBonusEvent {
  from_name: string | null;
  type_id: number;
  value: string;
  time: string;
  id: number;
  title: string;
}

export interface IBonusDateEvent {
  events: IBonusEvent[];
  id: number;
  date: string;
}

export interface IBonusHistoryResponse {
  date_events: IBonusDateEvent[];
  output: IOutput;
}

// Добавляем интерфейсы для выписки по рефералам
export interface IReferral {
  type_id: number;
  name: string;
  id: number;
  phone: string;
}

export interface IReferralDateGroup {
  referrals: IReferral[];
  id: number;
  date: string;
}

export interface IReferralHistoryResponse {
  date_referrals: IReferralDateGroup[];
  output: IOutput;
}

// Добавляем интерфейсы для тарифов
export interface ITariff {
  connect_chance: boolean;
  description: string;
  title: string;
  descriptions: number;
  analyses: number;
  price: number;
  final_price: number;
  discount: number;
  currency: string;
  id: number;
}

export interface ICurrentTariff {
  connect_chance: boolean;
  auto_reconnect: boolean;
  descriptions: number;
  connected: boolean;
  analyses: number;
  end_time: string;
  title: string;
  id: number;
}

export interface ITariffsResponse {
  tariffs: ITariff[];
  tariff: ICurrentTariff;
  output: IOutput;
}

export interface ITariffReconnectResponse {
  output: IOutput;
}

// Обновим интерфейс для запроса на покупку тарифа
export interface ITariffBuyRequest {
  price: number;
  id: number;
}

// Обновим интерфейс для запроса на автосписание
export interface ITariffReconnectRequest {
  auto_reconnect: boolean;
}

export interface ITariffBuyResponse {
  output: IOutput;
}

// Добавляем интерфейсы для активных устройств
export interface ISession {
  device_name: string | null;
  time_entry: string | null;
  title_kk: string;
  title_en: string;
  title_ru: string;
  current: boolean;
  id: number;
}

export interface ISessionsResponse {
  sessions: ISession[];
  output: IOutput;
}

// Добавляем эти интерфейсы в конец файла types.ts

// Интерфейс для запроса на удаление аккаунта
export interface IDeleteRequestInfo {
  request_send: boolean;
  id: number;
}

// Интерфейс для ответа на GET запрос информации об удалении
export interface IDeleteAccountInfoResponse {
  delete_request: IDeleteRequestInfo;
  output: IOutput;
}

// Интерфейс для ответа на POST и DELETE запросы удаления аккаунта
export interface IDeleteAccountResponse {
  output: IOutput;
}

export interface IFaqQuestion {
  message: string;
  title: string;
  id: number;
}

export interface IFaqResponse {
  questions: IFaqQuestion[];
  output: IOutput;
}

// Интерфейс для типа обратной связи
export interface IFeedbackType {
  id: number;
  title: string;
  note: string;
  title_kk?: string;
  title_en?: string;
  title_ru?: string;
  note_kk?: string;
  note_en?: string;
  note_ru?: string;
}

// Интерфейс для ответа API с типами обратной связи
export interface IFeedbackTypesResponse {
  feedback_type: IFeedbackType[];
  output: {
    message_kk: string;
    message_en: string;
    message_ru: string;
    message: string;
    result: boolean;
  };
}
