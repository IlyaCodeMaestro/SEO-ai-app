"use client";
import { ArrowLeft } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useEffect, useState } from "react";
import { ShareMenuWithoutCopy } from "../shared/share-menu-without-copy";

interface EmptyPanelProps {
  onClose: () => void;
}

export default function EmptyPartnerPanel({ onClose }: EmptyPanelProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [shareContent, setShareContent] = useState<{
    content: string;
    title: string;
  } | null>(null);

  // Set share content on component mount to display modal by default
  useEffect(() => {
    setShareContent({
      content: "Присоединяйтесь к реферальной программе и получайте бонусы!",
      title: "Реферальная программа",
    });
  }, []);

  const handleCloseShareMenu = () => {
    setShareContent(null);
  };

  return (
    <div
      onClick={onClose}
      className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto dark:bg-[#404040]  flex flex-col"
    >
      {/* Header with close button */}
      <div className="flex items-center p-4 bg-white relative  dark:bg-[#404040]">
        {isMobile ? (
          <button onClick={onClose} className="absolute left-4">
            <ArrowLeft size={24} className="dark:text-blue-600" />
          </button>
        ) : (
          <button onClick={onClose} className="text-gray-600 absolute right-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-x dark:text-blue-600"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </div>
      {shareContent && (
        <div className="absolute  inset-0 z-50 flex items-center justify-center overflow-y-auto rounded-3xl overflow-x-hidden">
          <div
            onClick={onClose}
            className="absolute mt-7 mb-6 inset-0 bg-opacity-50"
          >
            <ShareMenuWithoutCopy
              content={shareContent.content}
              title={shareContent.title}
              onClose={handleCloseShareMenu}
            />
          </div>
        </div>
      )}
    </div>
  );
}
