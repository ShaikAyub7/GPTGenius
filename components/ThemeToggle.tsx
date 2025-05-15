"use client";

import React, { useEffect, useState } from "react";

const themes = {
  winter: "winter",
  dracula: "dracula",
} as const;

type Theme = keyof typeof themes;

const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>(themes.winter);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    const initialTheme =
      storedTheme && themes[storedTheme] ? storedTheme : "winter";
    document.documentElement.setAttribute("data-theme", initialTheme);
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "winter" ? "dracula" : "winter";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  };

  return (
    <label
      className="toggle text-base-content mr-4"
      title="Toggle theme"
      aria-label="Toggle between dark and light mode"
    >
      <input
        type="checkbox"
        checked={theme === "dracula"}
        className="theme-controller"
        onClick={toggleTheme}
        readOnly
      />
      {theme === "dracula" ? (
        <svg
          aria-label="sun"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <g
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="2"
            fill="none"
            color="#000"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2"></path>
            <path d="M12 20v2"></path>
            <path d="m4.93 4.93 1.41 1.41"></path>
            <path d="m17.66 17.66 1.41 1.41"></path>
            <path d="M2 12h2"></path>
            <path d="M20 12h2"></path>
            <path d="m6.34 17.66-1.41 1.41"></path>
            <path d="m19.07 4.93-1.41 1.41"></path>
          </g>
        </svg>
      ) : (
        <svg
          aria-label="moon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <g
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="2"
            fill="none"
            stroke="currentColor"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
          </g>
        </svg>
      )}
    </label>
  );
};

export default ThemeToggle;
