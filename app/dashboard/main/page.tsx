"use client";
import { Header } from "@/components/main/header";
import { Main } from "@/app/dashboard/main/main";

export default function MainPage() {
  return (
    <main className="min-h-screen flex flex-col w-full overflow-x-hidden ">
      <Header activeTab="main" />
      <div className="flex-1 relative w-full ">
        <Main />
      </div>
    </main>
  );
}
