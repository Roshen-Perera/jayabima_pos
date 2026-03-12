import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileStore } from "@/store/profileStore";
import React, { useEffect } from "react";
import ProfileHeader from "./_components/ProfileHeader";
import { Tabs, TabsList } from "@/components/ui/tabs";

const Page = () => {
  const { profile, isLoading, fetchProfile } = useProfileStore();
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Failed to load profile. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <ProfileHeader user={profile} />
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md"></TabsList>
      </Tabs>
    </div>
  );
};

export default Page;
