'use client'
import type React from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/provider/theme-provider";
import { LanguageProvider } from "@/components/provider/language-provider";
import { TariffProvider } from "@/components/provider/tariff-provider";
import { ProcessingProvider } from "@/components/main/processing-provider";
import { Provider } from "react-redux";
import { store } from "@/store";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange
        >
          <LanguageProvider>
            <TariffProvider>
              <Provider store={store}>
                <ProcessingProvider>{children}</ProcessingProvider>
              </Provider>
            </TariffProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
