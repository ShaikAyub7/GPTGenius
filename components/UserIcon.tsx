import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import React from "react";

const UserIcon = async () => {
  const user = await currentUser();

  return (
    <div className="px-4 flex items-center gap-4">
      <UserButton afterSwitchSessionUrl="/" />
      <p>{user?.emailAddresses[0].emailAddress}</p>
    </div>
  );
};

export default UserIcon;
