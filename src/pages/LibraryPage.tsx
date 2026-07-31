import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/hooks/use-theme";
import {
  Layout,
  Plus,
  Upload,
  Search,
  FolderOpen,
  Image as ImageIcon,
  Sun,
  Moon,
  ArrowRight,
  Sparkles,
  Trash2,
  FileCode,
  HardDrive,
} from "lucide-react";
import {
  getAllProjects,
  deleteProject,
  duplicateProject,
  exportProjectJson,
  saveProject,
  getAllMedia,
  saveMedia,
  deleteMedia,
} from "@/lib/db";
import { SavedProject, MediaItem, SortOption } from "@/types/library";
import { ProjectCard } from "@/components/library/ProjectCard";
import { InitialSetupModal } from "@/components/InitialSetupModal";
import { ImportProjectModal } from "@/components/library/ImportProjectModal";
import { useCollage } from "@/context/CollageContext";
import { toast } from "@/hooks/use-toast";
import { Settings } from "@/types/settings";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function LibraryPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { createNewProject } = useCollage();

  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updatedAt-desc");

  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  // Deletion confirmation state
  const [projectToDelete, setProjectToDelete] = useState<SavedProject | null>(null);
  const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);

  const handleApplyInitialSetup = async (settings: Settings) => {
    setNewProjectOpen(false);
    try {
      const projectId = await createNewProject(
        settings.pageSize,
        settings.layout,
        "New Studio Project"
      );
      navigate(`/editor?project=${projectId}`);
    } catch (err) {
      console.error("Failed to create project from initial setup modal:", err);
    }
  };

  // Load projects and media from IndexedDB
  const refreshLibrary = useCallback(async () => {
    setLoading(true);
    try {
      const [loadedProjects, loadedMedia] = await Promise.all([
        getAllProjects(),
        getAllMedia(),
      ]);
      setProjects(loadedProjects);
      setMediaList(loadedMedia);
    } catch (err) {
      console.error("Failed to load library:", err);
      toast({
        title: "Library Load Error",
        description: "Could not load saved projects from local storage.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  // Project Actions
  const handleDuplicate = async (id: string) => {
    const duplicated = await duplicateProject(id);
    if (duplicated) {
      toast({
        title: "Project Duplicated",
        description: `Created "${duplicated.title}".`,
      });
      refreshLibrary();
    }
  };

  const onRequestDeleteProject = (id: string) => {
    const proj = projects.find((p) => p.id === id);
    if (proj) setProjectToDelete(proj);
  };

  const handleConfirmDeleteProject = async () => {
    if (!projectToDelete) return;
    const success = await deleteProject(projectToDelete.id);
    if (success) {
      toast({
        title: "Project Deleted",
        description: "The project has been permanently removed.",
      });
      refreshLibrary();
    }
    setProjectToDelete(null);
  };

  const handleRename = async (id: string, newTitle: string) => {
    const target = projects.find((p) => p.id === id);
    if (target) {
      const updated: SavedProject = {
        ...target,
        title: newTitle,
        updatedAt: Date.now(),
      };
      await saveProject(updated);
      toast({ title: "Title Updated" });
      refreshLibrary();
    }
  };

  const handleExport = (project: SavedProject) => {
    exportProjectJson(project);
    toast({
      title: "Project Exported",
      description: `Downloaded ${project.title}.layoutcraft file.`,
    });
  };

  // Media Pool Upload
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        if (!dataUrl) return;

        const mediaItem: MediaItem = {
          id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          dataUrl,
          type: file.type,
          size: file.size,
          addedAt: Date.now(),
        };

        await saveMedia(mediaItem);
        refreshLibrary();
      };
      reader.readAsDataURL(file);
    }

    toast({
      title: "Media Added",
      description: `Successfully added ${files.length} photo(s) to Media Pool.`,
    });
  };

  const onRequestDeleteMedia = (media: MediaItem) => {
    setMediaToDelete(media);
  };

  const handleConfirmDeleteMedia = async () => {
    if (!mediaToDelete) return;
    await deleteMedia(mediaToDelete.id);
    toast({ title: "Media Item Removed" });
    refreshLibrary();
    setMediaToDelete(null);
  };

  // Filter & Sort Projects
  const filteredProjects = projects
    .filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "updatedAt-desc") return b.updatedAt - a.updatedAt;
      if (sortBy === "updatedAt-asc") return a.updatedAt - b.updatedAt;
      if (sortBy === "title-asc") return a.title.localeCompare(b.title);
      if (sortBy === "title-desc") return b.title.localeCompare(a.title);
      return 0;
    });

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary transition-colors duration-300 antialiased flex flex-col">
      {/* Precision Blueprint Grid Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-size-[24px_24px] opacity-70" />

      {/* Header Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/85 border-b border-border/60">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
              <Layout className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-foreground">
                Layout<span className="text-primary font-black">Crafter</span>
              </span>
              <Badge variant="outline" className="hidden sm:inline-flex text-[10px] uppercase tracking-wider font-semibold py-0.5 px-2 border-border text-muted-foreground">
                Library Hub
              </Badge>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg w-8 h-8 sm:w-9 sm:h-9 border border-border/60 hover:bg-accent"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportOpen(true)}
              className="rounded-lg text-xs font-semibold h-8 sm:h-9 px-2.5 sm:px-3 gap-1.5"
              title="Import File"
            >
              <Upload className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Import File</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setNewProjectOpen(true)}
              className="rounded-lg shadow-sm font-semibold h-8 sm:h-9 px-3 sm:px-4 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden min-[400px]:inline">New Project</span>
              <span className="min-[400px]:hidden">New</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="projects" className="space-y-6">
          {/* Top Bar with Tabs, Search, and Sort */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
            <TabsList className="bg-muted/60 p-1 rounded-lg">
              <TabsTrigger value="projects" className="gap-2 text-xs font-semibold px-4 py-1.5">
                <FolderOpen className="h-3.5 w-3.5" />
                My Projects
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 font-mono">
                  {projects.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="media" className="gap-2 text-xs font-semibold px-4 py-1.5">
                <ImageIcon className="h-3.5 w-3.5" />
                Media Pool
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 font-mono">
                  {mediaList.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* Controls Strip */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-xs bg-card border-border"
                />
              </div>

              <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                <SelectTrigger className="w-[150px] h-9 text-xs bg-card border-border">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="updatedAt-desc" className="text-xs">Latest Modified</SelectItem>
                  <SelectItem value="updatedAt-asc" className="text-xs">Oldest First</SelectItem>
                  <SelectItem value="title-asc" className="text-xs">Title (A-Z)</SelectItem>
                  <SelectItem value="title-desc" className="text-xs">Title (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* MY PROJECTS TAB CONTENT */}
          <TabsContent value="projects" className="space-y-6 outline-none">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-64 rounded-xl bg-card border border-border" />
                ))}
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onDuplicate={handleDuplicate}
                    onDelete={onRequestDeleteProject}
                    onRename={handleRename}
                    onExport={handleExport}
                  />
                ))}
              </div>
            ) : (
              /* Empty Projects State */
              <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center max-w-xl mx-auto space-y-4 my-8">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">No Projects Found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? `No projects match "${searchQuery}". Try clearing your search.`
                      : "Create your first photo layout project or import a saved .layoutcraft file."}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <Button onClick={() => setNewProjectOpen(true)} className="font-semibold gap-1.5">
                    <Plus className="h-4 w-4" />
                    Create New Project
                  </Button>
                  <Button variant="outline" onClick={() => setImportOpen(true)} className="gap-1.5">
                    <Upload className="h-4 w-4" />
                    Import File
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* MEDIA POOL TAB CONTENT */}
          <TabsContent value="media" className="space-y-6 outline-none">
            <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
              <div className="space-y-0.5">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-primary" />
                  Reusable Photo Collection
                </h3>
                <p className="text-xs text-muted-foreground">
                  Store photos locally to quickly access them when crafting new collage grids.
                </p>
              </div>

              <label htmlFor="media-upload-input">
                <Button size="sm" className="font-semibold gap-1.5 pointer-events-none">
                  <Upload className="h-3.5 w-3.5" />
                  Upload Photos
                </Button>
                <input
                  id="media-upload-input"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                />
              </label>
            </div>

            {mediaList.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {mediaList.map((media) => (
                  <div
                    key={media.id}
                    className="group relative rounded-lg border border-border bg-card overflow-hidden hover:border-primary/50 transition-all"
                  >
                    <div className="aspect-square bg-slate-950 flex items-center justify-center p-2">
                      <img
                        src={media.dataUrl}
                        alt={media.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>

                    <div className="p-2 flex items-center justify-between text-xs bg-card">
                      <span className="font-medium text-foreground truncate max-w-[100px]" title={media.name}>
                        {media.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRequestDeleteMedia(media)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center max-w-md mx-auto space-y-3">
                <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Your media pool is empty. Upload photos to quickly reuse them across your collage projects.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={Boolean(projectToDelete)}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
        title="Delete Saved Project?"
        description={`Are you sure you want to delete "${projectToDelete?.title}"? This action cannot be undone and will permanently remove the project.`}
        confirmText="Delete Project"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDeleteProject}
      />

      <ConfirmDialog
        open={Boolean(mediaToDelete)}
        onOpenChange={(open) => !open && setMediaToDelete(null)}
        title="Delete Photo Asset?"
        description={`Are you sure you want to delete "${mediaToDelete?.name}" from your local media pool?`}
        confirmText="Delete Asset"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDeleteMedia}
      />

      {/* Modals */}
      <InitialSetupModal
        open={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
        onApplySettings={handleApplyInitialSetup}
      />
      <ImportProjectModal
        open={importOpen}
        onOpenChange={setImportOpen}
        onImportSuccess={(proj) => {
          toast({ title: "Import Successful", description: `Restored ${proj.title}` });
          refreshLibrary();
        }}
      />
    </div>
  );
}
