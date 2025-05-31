"use client";
import { Cabinet } from "@/app/dashboard/cabinet/cabinet";
import { Header } from "@/components/main/header";

export default function CabinetPage() {
  return (
    <main className="min-h-screen flex flex-col w-full overflow-x-hidden ">
      <Header activeTab="cabinet" />
      <div className="flex-1 relative w-full ">
        <Cabinet />
      </div>
    </main>
  );
}
