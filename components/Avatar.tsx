import React from "react";
import { SiOpenaigym } from "react-icons/si";

interface AvatarProps {
  role: "user" | "assistant";
  user?: {
    imageUrl?: string;
  };
  className?: string;
}

const Avatar = ({ role, user, className }: AvatarProps) => {
  const avatar =
    role === "user" ? (
      <span className="text-xl">
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            className={`w-6 h-6 rounded-full mt-2  ${className} `}
            alt="User avatar"
          />
        ) : (
          "👤"
        )}
      </span>
    ) : (
      <SiOpenaigym className="w-6 h-6 text-primary mt-2" />
    );

  return <span className="mr-4">{avatar}</span>;
};

export default Avatar;
