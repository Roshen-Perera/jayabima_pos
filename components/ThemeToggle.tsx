"use client";

import { Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render after hydration is complete
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering theme-dependent content on server
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="text-muted-foreground">
        <div className="h-5 w-5" /> {/* Placeholder with same dimensions */}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="text-muted-foreground"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
};

export default ThemeToggle;
