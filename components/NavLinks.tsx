import Link from "next/link";
import React from "react";
import { BsChat } from "react-icons/bs";
import { IoImageOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";

type Link = {
  href: string;
  label: string;
  icon: React.JSX.Element;
};

export const links: Link[] = [
  {
    href: "/chat",
    label: "Chat",
    icon: <BsChat />,
  },
  {
    href: "/image-generator",
    label: "Ai image",
    icon: <IoImageOutline />,
  },

  {
    href: "/profile",
    label: "Profile",
    icon: <CgProfile />,
  },
];

const NavLinks = () => {
  return (
    <div className="menu text-base-content min-h-full w-80 p-5">
      {links.map((link) => {
        return (
          <Link
            key={link.href}
            href={link.href}
            title={link.label}
            className="p-3 hover:bg-base-100 hover:shadow rounded-lg text-[16px] capitalize leading-loose flex items-center gap-2"
          >
            {link.icon}
            {link.label}
          </Link>
        );
      })}
    </div>
  );
};

export default NavLinks;
