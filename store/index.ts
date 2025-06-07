import { configureStore } from "@reduxjs/toolkit";
import { mainApi } from "./services/main";
import { sessionsApi } from "./services/sessions-api";
import { profileApi } from "./services/profile-api";
import { feedbackApi } from "./services/feedback-api";
import { affiliateApi } from "./services/affiliate-api";
import { settingsApi } from "./services/settings-api";

export const makeStore = () =>
  configureStore({
    reducer: {
      [mainApi.reducerPath]: mainApi.reducer,
      [sessionsApi.reducerPath]: sessionsApi.reducer,
      [profileApi.reducerPath]: profileApi.reducer,
      [feedbackApi.reducerPath]: feedbackApi.reducer,
      [affiliateApi.reducerPath]: affiliateApi.reducer,
      [settingsApi.reducerPath]: settingsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        mainApi.middleware,
        sessionsApi.middleware,
        profileApi.middleware,
        feedbackApi.middleware,
        affiliateApi.middleware,
        settingsApi.middleware
      ),
  });

export const store = makeStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
