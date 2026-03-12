import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfileStore } from "@/store/profileStore";
import { User } from "@/types/user.types";
import { Pencil } from "lucide-react";
import { useState } from "react";

interface ProfileInfoCardProps {
  user: User;
}

export default function ProfileInfoCard({ user }: ProfileInfoCardProps) {
  const { updateProfile, isSubmitting } = useProfileStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
  });

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
    });
    if (success) {
      setIsEditing(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
