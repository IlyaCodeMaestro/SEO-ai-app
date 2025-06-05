"use client";
import type React from "react";
import type { Toast, ToastActionElement } from "@/components/ui/toast";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 3000;

type ToasterToast = Toast & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive" | "success";
};

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

const toasts: ToasterToast[] = [];

type ToastOptions = Partial<
  Pick<
    ToasterToast,
    "id" | "title" | "description" | "action" | "variant" | "className"
  >
>;

const useToast = () => {
  const toast = ({ ...props }: ToastOptions) => {
    const id = props.id || genId();
    const update = (props: ToastOptions) => {
      toasts.forEach((t) => {
        if (t.id === id) {
          t.title = props.title ?? t.title;
          t.description = props.description ?? t.description;
          t.action = props.action ?? t.action;
          t.variant = props.variant ?? t.variant;
          t.className = props.className ?? t.className;
        }
      });
    };
    const dismiss = () => {
      toasts.forEach((t) => {
        if (t.id === id) {
          t.open = false;
        }
      });
    };

    const newToast = {
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss();
      },
      ...props,
    };

    toasts.push(newToast);

    setTimeout(() => {
      dismiss();
    }, TOAST_REMOVE_DELAY);

    return {
      id,
      dismiss,
      update,
    };
  };

  return {
    toast,
    toasts,
    dismiss: (toastId?: string) => {
      if (toastId) {
        toasts.forEach((t) => {
          if (t.id === toastId) {
            t.open = false;
          }
        });
      } else {
        toasts.forEach((t) => {
          t.open = false;
        });
      }
    },
  };
};

export { useToast, type ToasterToast };
