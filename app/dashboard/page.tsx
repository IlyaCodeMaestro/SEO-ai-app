"use client";
import { Header } from "@/components/main/header";
import { Dashboard } from "@/app/dashboard/dashboard";

export default function DashboardPage() {
  return (
    <main className="min-h-screen flex flex-col w-full overflow-x-hidden">
      <Header />
      <div className="flex-1 relative w-full">
        <Dashboard />
      </div>
    </main>
  );
}
