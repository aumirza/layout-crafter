import { useState, useEffect, useRef } from "react";
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
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const { updatePageSize, updateLayout, setSpaceOptimization, setUnit } =
    useCollage();
  const collageRef = useRef<HTMLDivElement>(null);

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


