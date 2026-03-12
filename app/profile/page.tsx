import { useProfileStore } from "@/store/profileStore";
import React, { useEffect } from "react";

const Page = () => {
  const { profile, isLoading, fetchProfile } = useProfileStore();
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  return <div>Page</div>;
};

export default Page;
