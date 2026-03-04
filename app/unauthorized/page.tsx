import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          <CardDescription className="text-base">
            You don&apos;t have permission to access this page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              This page is restricted to users with specific permissions.
            </p>
            {user && (
              <div className="text-center pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Current role:
                  <span className="font-semibold capitalize">
                    {role?.toLowerCase()}
                  </span>
                </p>
              </div>
            )}
             <p className="text-xs text-muted-foreground text-center pt-2">
              Please contact your administrator if you believe this is an error.
            </p>
          </div>
          <div className="flex gap-2">
            
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
