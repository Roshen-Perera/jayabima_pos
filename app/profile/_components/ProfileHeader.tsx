import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@/types/user.types";

interface ProfileHeaderProps {
  user: User;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive";
      case "MANAGER":
        return "default";
      case "CASHIER":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatar || undefined} alt={user.name} />
            <AvatarFallback className="text-2xl">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            {/* Name and Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {user.role}
              </Badge>
              {!user.isActive && (
                <Badge variant="outline" className="bg-muted">
                  Inactive
                </Badge>
              )}
            </div>
            <div className="text-muted-foreground space-y-1">
              <p className="text-sm">@{user.username}</p>
              <p className="text-sm">{user.email}</p>
              {user.phone && <p className="text-sm">{user.phone}</p>}
            </div>
            {/* <div className="flex gap-4 text-xs text-muted-foreground pt-2">
              <div>
                <span className="font-medium">Joined: </span>
                {format(new Date(user.createdAt), "MMM d, yyyy")}
              </div>
              {user.lastLogin && (
                <div>
                  <span className="font-medium">Last Login: </span>
                  {format(new Date(user.lastLogin), "MMM d, yyyy h:mm a")}
                </div>
              )}
            </div> */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
