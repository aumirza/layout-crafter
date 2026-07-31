import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { InitialSetupModal } from "@/components/InitialSetupModal";
import { useCollage } from "@/context/CollageContext";
import { Settings } from "@/types/settings";
import { CanvasControlsProvider } from "@/context/CanvasControlsContext";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { CollageSidebar } from "@/components/CollageSidebar";
import { CanvasControls } from "@/components/CanvasControls";
import { CanvasContainer } from "@/components/CanvasContainer";

const Editor = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);

  const {
    updatePageSize,
    updateLayout,
    setSpaceOptimization,
    setUnit,
    loadProject,
    createNewProject,
    closeCurrentProject,
    currentProjectId,
  } = useCollage();

  const collageRef = useRef<HTMLDivElement>(null);
  const initializedProjectIdRef = useRef<string | null>(null);

  // Load active project from URL parameter or create a fresh project in IndexedDB
  useEffect(() => {
    const projectId = searchParams.get("project");

    const initializeEditorProject = async () => {
      if (projectId) {
        if (initializedProjectIdRef.current === projectId) return;
        initializedProjectIdRef.current = projectId;
        const loaded = await loadProject(projectId);
        if (loaded) return;
      }

      // If no valid project found, create a new one
      if (!currentProjectId && initializedProjectIdRef.current !== "new_created") {
        initializedProjectIdRef.current = "new_created";
        const newId = await createNewProject(undefined, undefined, "New Studio Layout");
        setSearchParams({ project: newId }, { replace: true });
      }
    };

    initializeEditorProject();
  }, [searchParams, loadProject, createNewProject, setSearchParams, currentProjectId]);

  // Save low-resolution thumbnail when closing/leaving editor
  useEffect(() => {
    return () => {
      closeCurrentProject();
    };
  }, [closeCurrentProject]);

  useEffect(() => {
    const hasSeenSetup = sessionStorage.getItem("hasSeenCollageSetup");
    if (!hasSeenSetup) {
      setShowSetupModal(true);
    }
  }, []);

  const handleInitialSetup = (settings: Settings) => {
    updatePageSize(settings.pageSize);
    updateLayout(settings.layout);
    setSpaceOptimization(settings.spaceOptimization);
    setUnit(settings.selectedUnit);

    sessionStorage.setItem("hasSeenCollageSetup", "true");
    setShowSetupModal(false);
  };

  return (
    <CanvasControlsProvider>
      <SidebarProvider>
        <CollageSidebar
          collageRef={collageRef}
          selectedCellId={selectedCellId}
        />
        <SidebarInset className="flex flex-col h-screen overflow-hidden bg-background pb-16 md:pb-0">
          <Header />
          <div className="flex-1 flex overflow-hidden relative">
            <main className="flex-1 flex flex-col overflow-hidden relative">
              <CanvasContainer
                collageRef={collageRef}
                onSelectCell={(imageId) => setSelectedCellId(imageId)}
              />
              <CanvasControls />
            </main>
          </div>
          <InitialSetupModal
            open={showSetupModal}
            onClose={() => setShowSetupModal(false)}
            onApplySettings={handleInitialSetup}
          />
        </SidebarInset>
      </SidebarProvider>
    </CanvasControlsProvider>
  );
};

export default Editor;
