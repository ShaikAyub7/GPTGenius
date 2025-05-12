import Link from "next/link";
import React from "react";

type Link = {
  href: string;
  label: string;
};

export const links: Link[] = [
  {
    href: "/chat",
    label: "Chat",
  },
  {
    href: "/tours",
    label: "Tours",
  },
  {
    href: "/tours/new-tour",
    label: "new tours",
  },
  {
    href: "/profile",
    label: "Profile",
  },
];

const NavLinks = () => {
  return (
    <div className="menu text-base-content">
      {links.map((link) => {
        return <Link href={link.href}>{link.label}</Link>;
      })}
    </div>
  );
};

export default NavLinks;
