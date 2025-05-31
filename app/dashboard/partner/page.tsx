"use client";
import { Partner } from "@/app/dashboard/partner/partner";
import { Header } from "@/components/main/header";

export default function PartnerPage() {
  return (
    <main className="min-h-screen flex flex-col w-full overflow-x-hidden ">
      <Header activeTab="partner" />
      <div className="flex-1 relative w-full ">
        <Partner />
      </div>
    </main>
  );
}
