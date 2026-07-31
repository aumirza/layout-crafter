import { useState, useEffect } from "react";
import LandingPage from "./LandingPage";
import LibraryPage from "./LibraryPage";

const Index = () => {
  const [isPWA, setIsPWA] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches;
    const isNavStandalone = (window.navigator as any).standalone === true;
    const isPwaQuery = window.location.search.includes("mode=pwa");
    return isStandaloneMode || isNavStandalone || isPwaQuery;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsPWA(true);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  if (isPWA) {
    return <LibraryPage />;
  }

  return <LandingPage />;
};

export default Index;
