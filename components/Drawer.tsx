import React from "react";
import DrawerHeader from "./DrawerHeader";
import NavLinks from "./NavLinks";
import MemberProfile from "./MemberProfile";

const Drawer = () => {
  return (
    <div className="menu bg-base-300 px-4 py-12 min-h-full w-80 grid grid-rows-[1fr,1fr,1fr] shadow-xl/30">
      <DrawerHeader />

      <NavLinks />

      <MemberProfile />
    </div>
  );
};

export default Drawer;
