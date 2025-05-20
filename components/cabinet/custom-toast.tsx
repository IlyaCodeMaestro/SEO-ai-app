"use client"

import { CheckCircle, AlertCircle, X } from "lucide-react"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport className="fixed top-4 right-4 flex flex-col gap-2 w-96 max-w-[90vw] z-50" />
    </ToastProvider>
  )
}

export function SuccessToast({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg shadow-md">
      <CheckCircle className="h-5 w-5 text-green-600" />
      <div className="flex-1">
        <h3 className="font-medium text-green-800">Успешно</h3>
        <p className="text-green-700">{message}</p>
      </div>
      <button className="text-green-500 hover:text-green-700">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ErrorToast({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg shadow-md">
      <AlertCircle className="h-5 w-5 text-red-600" />
      <div className="flex-1">
        <h3 className="font-medium text-red-800">Ошибка</h3>
        <p className="text-red-700">{message}</p>
      </div>
      <button className="text-red-500 hover:text-red-700">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
