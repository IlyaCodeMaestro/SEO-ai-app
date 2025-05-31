"use client";
import { Feedback } from "@/app/dashboard/feedback/feedback";
import { Header } from "@/components/main/header";

export default function PartnerPage() {
  return (
    <main className="min-h-screen flex flex-col w-full overflow-x-hidden ">
      <Header activeTab="feedback" />
      <div className="flex-1 relative w-full ">
        <Feedback />
      </div>
    </main>
  );
}
