import { useMemo } from "react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export default function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
    const requirements = useMemo(() => {
      return [
        {
          label: "At least 8 characters",
          met: password.length >= 8,
        },
        {
          label: "Contains uppercase letter",
          met: /[A-Z]/.test(password),
        },
        {
          label: "Contains lowercase letter",
          met: /[a-z]/.test(password),
        },
        {
          label: "Contains number",
          met: /[0-9]/.test(password),
        },
        {
          label: "Contains special character",
          met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        },
      ];
    }, [password]);
}