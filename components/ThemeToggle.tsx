"use client";

import { Sun, Moon, Bell } from "lucide-react";
import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="text-muted-foreground hover:text-foreground"
        suppressHydrationWarning={true}
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>
    </>
  );
};

export default ThemeToggle;
