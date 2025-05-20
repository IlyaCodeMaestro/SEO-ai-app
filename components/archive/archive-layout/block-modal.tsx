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
  contentClassName
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
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div
        className="bg-white dark:bg-[#1e1e1e] rounded-3xl w-[90%] max-w-3xl h-[80%] flex flex-col z-50 text-black dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="top-0 bg-white dark:bg-[#1e1e1e] z-10 border-b dark:border-gray-700 p-4 relative flex items-center justify-center rounded-t-3xl">
          <h2 className="text-lg font-medium absolute left-1/2 transform -translate-x-1/2 text-black dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="ml-auto p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className={`flex-1 overflow-y-auto p-4 bg-white dark:bg-[#1e1e1e] dark:text-black`}
        >
          <div className={contentClassName}>{children}</div>
        </div>
      </div>
    </div>
  );
}
