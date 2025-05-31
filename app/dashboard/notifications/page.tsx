"use client";
import { Notifications } from "@/app/dashboard/notifications/notifications";
import { Header } from "@/components/main/header";

export default function NotificationsPage() {
  return (
    <main className="min-h-screen flex flex-col w-full overflow-x-hidden ">
      <Header activeTab="notifications" />
      <div className="flex-1 relative w-full ">
        <Notifications />
      </div>
    </main>
  );
}
