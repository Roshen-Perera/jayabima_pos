import { Card, CardHeader } from "@/components/ui/card";
import { usePermissions } from "@/hooks/usePermissions";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const Page = () => {
  const router = useRouter();
  const { role, user } = usePermissions();
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default Page;
