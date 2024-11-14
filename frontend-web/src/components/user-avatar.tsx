import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface UserAvatarProps {
  user: {
    name: string;
    image?: string;
  };
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarImage src={user.image} alt={user.name} />
      <AvatarFallback>
        {user.image ? (
          <User className="h-4 w-4" />
        ) : (
          user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        )}
      </AvatarFallback>
    </Avatar>
  );
}
