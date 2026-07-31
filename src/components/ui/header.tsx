import { Settings, SunIcon, MoonIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { SettingsDialog } from "@/components/SettingsDialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur-md px-3 sm:px-4 h-12 flex items-center justify-between z-30 select-none">
      {/* Left Section: Sidebar Toggle */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="h-8 w-8 rounded-lg hover:bg-accent" />
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-1">

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <SunIcon className="h-4 w-4 text-amber-400" />
          ) : (
            <MoonIcon className="h-4 w-4 text-slate-600" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(true)}
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
          title="Canvas Settings & Presets"
        >
          <Settings className="h-4 w-4" />
        </Button>

        <SettingsDialog
          open={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    </header>
  );
}

