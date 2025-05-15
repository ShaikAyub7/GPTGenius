import Link from "next/link";
import React from "react";

const HomePage = () => {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-overlay"></div>
      <div className="hero-content text-neutral-content text-center">
        <div className="max-w-md">
          <h1 className="mb-5 text-5xl font-bold">GPT Genius</h1>
          <p className="mb-5">
            Meet your new AI sidekick — smart, fast, and always ready to help.
            Whether you're brainstorming ideas, solving problems, or just
            curious about something, GPT Genius has your back.
          </p>

          <Link href={"/chat"} className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
