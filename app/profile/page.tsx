import { useProfileStore } from "@/store/profileStore";
import React from "react";

const Page = () => {
  const { profile, isLoading, fetchProfile } = useProfileStore();
  return <div>Page</div>;
};

export default Page;
