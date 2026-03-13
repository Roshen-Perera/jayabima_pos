import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { alert } from "@/lib/alert";
import { useState } from "react";

interface TempPasswordDisplayProps {
  password: string;
  username: string;
  email: string;
}

export default function TempPasswordDisplay({
  password,
  username,
  email,
}: TempPasswordDisplayProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      alert.success("Copied!", "Password copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      alert.error("Failed to copy", "Could not copy password");
    }
  };

  return (
    <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
      <CardHeader>
        <CardTitle className="text-yellow-900 dark:text-yellow-100">
          ⚠️ Temporary Password Generated
        </CardTitle>
        <CardDescription className="text-yellow-800 dark:text-yellow-200">
          This password has been sent to <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
            Temporary Password:
          </p>
          <div className="flex gap-2">
            <div className="flex-1 bg-white dark:bg-gray-900 rounded-md p-3 border border-yellow-300 font-mono text-lg">
              {showPassword ? password : "••••••••••••"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
