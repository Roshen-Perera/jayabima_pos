import { Bell, User } from "lucide-react";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import ThemeToggle from "./ThemeToggle";
import DynamicTitle from "./DynamicTitle";
import { useAuthStore } from "@/store/useAuthStore";
import { Badge } from "./ui/badge";
import UserMenu from "./UserMenu";

const Header = () => {
  return (
    <>
      <header className="flex h-15 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <DynamicTitle />
          <div className="ml-auto flex items-center gap-2">
            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
              {/* User Menu */}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 pl-3 border-l border-border mr-5">
          <UserMenu />
        </div>
      </header>
    </>
  );
};

export default Header;
