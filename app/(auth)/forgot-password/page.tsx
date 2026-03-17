import { alert } from "@/lib/alert";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Page = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      alert.error("Email required", "Please enter your email address");
      return;
    }

    setIsSubmitting(true);
  };

  return <div></div>;
};

export default Page;
