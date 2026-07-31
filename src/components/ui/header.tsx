import { Settings, SunIcon, MoonIcon, Layout, Sparkles, SlidersHorizontal, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/hooks/use-theme";
import { Link } from "react-router-dom";
import { SettingsDialog } from "@/components/SettingsDialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";
import { useCollage } from "@/context/CollageContext";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { collageState } = useCollage();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur-md px-3 sm:px-4 py-2 flex items-center justify-between z-30 transition-colors">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="hover:bg-accent rounded-lg" />

        <div className="h-4 w-px bg-border/60 hidden sm:block" />

        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
            <Layout className="h-4 w-4" />
          </div>
          <span className="font-extrabold text-base tracking-tight hidden sm:inline-block">
            Layout<span className="text-primary">Crafter</span>
          </span>
        </Link>

        {collageState.pageSize && (
          <Badge
            variant="outline"
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-normal py-0.5 px-2.5 bg-muted/50 border-border/60 text-muted-foreground"
          >
            <span className="font-semibold text-foreground">{collageState.pageSize.name}</span>
            <span>•</span>
            <span className="font-mono text-[10px] text-primary font-bold">300 DPI</span>
          </Badge>
        )}
      </div>

      {/* Center Status Tag */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-muted/40 border border-border/40 text-xs text-muted-foreground">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-medium text-foreground">Studio Engine Active</span>
        <span className="text-border">|</span>
        <span className="font-mono text-[11px]">{collageState.images?.length || 0} Photos Loaded</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Link to="/">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            title="Return to Landing Page"
          >
            <Home className="h-3.5 w-3.5" />
            Home
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-lg w-8 h-8 hover:bg-accent"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <SunIcon className="h-4 w-4 text-amber-400" />
          ) : (
            <MoonIcon className="h-4 w-4 text-slate-700" />
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(true)}
          className="h-8 gap-1.5 text-xs font-semibold rounded-lg border-border/70 hover:bg-accent"
          title="Canvas Settings"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
          <span>Canvas Config</span>
        </Button>

        <SettingsDialog
          open={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    </header>
  );
}
