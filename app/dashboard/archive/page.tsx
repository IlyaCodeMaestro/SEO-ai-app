"use client";
import { Archive } from "@/app/dashboard/archive/archive";
import { Header } from "@/components/main/header";

export default function ArchivePage() {
  return (
    <main className="min-h-screen flex flex-col w-full overflow-x-hidden ">
      <Header activeTab="archive" />
      <div className="flex-1 relative w-full ">
        <Archive />
      </div>
    </main>
  );
}
