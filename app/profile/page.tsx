import { Skeleton } from "@/components/ui/skeleton";
import { useProfileStore } from "@/store/profileStore";
import React, { useEffect } from "react";

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
  return <div>Page</div>;
};

export default Page;
