import { Search, Sun, Moon, Bell, Badge, User } from "lucide-react";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";

const Header = () => {
  return (
    <>
      <header className="h-16 w-full bg-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-40">
        {/* Search */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative flex-1">
            <SidebarTrigger />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleTheme())}
            className="text-muted-foreground hover:text-foreground"
            >
            {theme === "dark" ? (
                <Sun className="w-5 h-5" />
            ) : (
                <Moon className="w-5 h-5" />
            )}
            </Button> */}
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
      </header>
    </>
  );
};

export default Header;
