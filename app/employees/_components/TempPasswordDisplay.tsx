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

}