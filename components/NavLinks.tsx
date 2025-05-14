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
    href: "/image-generator",
    label: "Ai image",
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
    <div className="menu  text-base-content min-h-full w-80 p-5  ">
      {links.map((link) => {
        return (
          <Link
            key={link.href}
            href={link.href}
            className="p-3 hover:bg-base-100 hover:shadow rounded-lg text-[16px] capitalize leading-loose"
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
};

export default NavLinks;
