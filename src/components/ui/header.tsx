import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Settings, SunIcon, MoonIcon, Library, CheckCircle2, Loader2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/use-theme";
import { SettingsDialog } from "@/components/SettingsDialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCollage } from "@/context/CollageContext";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export function Header() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const { projectTitle, setProjectTitle, isSaving, currentProjectId, closeCurrentProject } = useCollage();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(projectTitle);

  const handleTitleSubmit = () => {
    if (tempTitle.trim()) {
      setProjectTitle(tempTitle.trim());
    } else {
      setTempTitle(projectTitle);
    }
    setIsEditingTitle(false);
  };

  const handleConfirmBack = async () => {
    await closeCurrentProject();
    navigate("/library");
  };

  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur-md px-3 sm:px-4 h-12 flex items-center justify-between z-30 select-none">
      {/* Left Section: Sidebar Toggle & Back to Library */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-8 w-8 rounded-lg hover:bg-accent" />

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowBackConfirm(true)}
          className="h-8 text-xs font-semibold gap-1.5 px-2.5 rounded-lg border-border"
        >
          <Library className="h-3.5 w-3.5 text-primary" />
          <span className="hidden sm:inline">Library</span>
        </Button>

        <ConfirmDialog
          open={showBackConfirm}
          onOpenChange={setShowBackConfirm}
          title="Return to Project Library?"
          description="Your changes are automatically saved. Are you sure you want to exit the editor and go back to the project library?"
          confirmText="Go to Library"
          cancelText="Stay in Editor"
          onConfirm={handleConfirmBack}
        />
      </div>

      {/* Center Section: Editable Project Title & Auto-Save Status */}
      <div className="flex items-center gap-3">
        {isEditingTitle ? (
          <Input
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") handleTitleSubmit();
            }}
            autoFocus
            className="h-7 text-xs font-bold w-48 bg-card border-primary text-foreground py-0"
          />
        ) : (
          <button
            onClick={() => {
              setTempTitle(projectTitle);
              setIsEditingTitle(true);
            }}
            className="flex items-center gap-1.5 hover:bg-accent/60 px-2 py-1 rounded-md transition-colors text-xs font-bold text-foreground group"
            title="Click to rename project"
          >
            <span className="truncate max-w-[140px] sm:max-w-[220px]">{projectTitle}</span>
            <Edit2 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}

        {currentProjectId && (
          <div className="hidden md:flex items-center gap-1.5">
            {isSaving ? (
              <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground border-border bg-muted/30 px-2 py-0.5 gap-1">
                <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
                Saving...
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                Saved
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Right Section: Theme & Settings Actions */}
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
