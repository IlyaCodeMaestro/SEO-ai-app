"use client"

import type React from "react"

import { useState, forwardRef } from "react"
import { Eye, EyeOff, User, Lock, Mail, Phone } from "lucide-react"

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: "user" | "lock" | "mail" | "phone"
  showPasswordToggle?: boolean
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ icon, showPasswordToggle, type, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    const getIcon = () => {
      switch (icon) {
        case "user":
          return <User className="h-5 w-5 text-blue-500" />
        case "lock":
          return <Lock className="h-5 w-5 text-blue-500" />
        case "mail":
          return <Mail className="h-5 w-5 text-blue-500" />
        case "phone":
          return <Phone className="h-5 w-5 text-blue-500" />
        default:
          return null
      }
    }

    const inputType = showPasswordToggle ? (showPassword ? "text" : "password") : type

    return (
      <div className="relative w-full">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">{getIcon()}</div>
        <input
          ref={ref}
          type={inputType}
          className={`w-full h-12 px-12 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className="absolute right-4 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
          </button>
        )}
      </div>
    )
  },
)

AuthInput.displayName = "AuthInput"

export default AuthInput
