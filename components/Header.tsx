"use client";

import { Search, Sun, Moon, Bell, Badge, User } from "lucide-react";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Separator } from "./ui/separator";

const Header = () => {
  const { theme, setTheme } = useTheme();
  return (
    <>
      <header className="flex h-15 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">Documents</h1>
          <div className="ml-auto flex items-center gap-2">
            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-muted-foreground hover:text-foreground"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>

              {/* User Menu */}
              <div className="flex items-center gap-3 pl-3 border-l border-border">
                {/* <div className="text-right hidden sm:block">
        <p className="text-sm font-medium">{user?.name}</p>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
          {user?.role}
        </Badge>
      </div> */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-primary/10"
                >
                  <User className="w-5 h-5 text-primary" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
