import { Card, CardHeader } from "@/components/ui/card";
import { usePermissions } from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";
import React from "react";

const Page = () => {
  const router = useRouter();
  const { role, user } = usePermissions();
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
            
        </CardHeader>
      </Card>
    </div>
  );
};

export default Page;
