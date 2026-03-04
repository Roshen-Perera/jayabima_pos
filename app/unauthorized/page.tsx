import { usePermissions } from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";
import React from "react";

const Page = () => {
  const router = useRouter();
  const { role, user } = usePermissions();
  return <div>Page</div>;
};

export default Page;
