"use client";

import type React from "react";

import { X } from "lucide-react";
import { useEffect } from "react";

interface ArchiveItemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  contentClassName?: string;
}

export function ArchiveItemDetailsModal({
  isOpen,
  onClose,
  children,
  title,
  contentClassName,
}: ArchiveItemDetailsModalProps) {
  // Handle escape key press to close modal
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-y-auto rounded-3xl overflow-x-hidden">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div
        className="bg-white dark:bg-[#2C2B2B] rounded-3xl w-[90%] max-w-3xl h-[70%] flex flex-col z-50 text-black dark:text-white p-4 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 dark:scrollbar-track-gray-800 dark:scrollbar-thumb-gray-600 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgb(75 85 99) rgb(31 41 55)",
        }}
      >
        {/* Заголовок с кнопкой закрытия */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-black dark:text-white flex-1 text-center"></h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white flex-shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5 dark:text-blue-600" />
          </button>
        </div>

        {/* Контент */}
        <div className={`flex-1 ${contentClassName}`}>{children}</div>
      </div>
    </div>
  );
}
