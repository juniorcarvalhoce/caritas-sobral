import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Editais from "./pages/Editais";
import EditaisPublic from "./pages/EditaisPublic";
import Noticias from "./pages/Noticias";
import NoticiaDetalhe from "./pages/NoticiaDetalhe";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/editais" element={<EditaisPublic />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Navigate to="/admin/editais" replace />} />
          <Route path="/admin/editais" element={<Editais />} />
          <Route path="/admin/noticias" element={<Noticias />} />
          <Route path="/noticia/:id" element={<NoticiaDetalhe />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
