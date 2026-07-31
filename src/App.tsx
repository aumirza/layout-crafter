
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CollageProvider } from './context/CollageContext';
import { Toaster } from './components/toaster';
import { ThemeProvider } from './providers/ThemeProvider';
import Index from './pages/Index';
import LibraryPage from './pages/LibraryPage';
import Editor from './pages/Editor';
import NotFound from './pages/NotFound';
import { TooltipProvider } from './components/ui/tooltip';

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>

        <CollageProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </Router>
        </CollageProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
