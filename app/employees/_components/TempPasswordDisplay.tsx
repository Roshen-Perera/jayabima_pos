import { Card } from "@/components/ui/card";
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

    </Card>
  )
}
