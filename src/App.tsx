import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Editais from "./pages/Editais";
import EditaisPublic from "./pages/EditaisPublic";
import Noticias from "./pages/Noticias";
import NoticiaDetalhe from "./pages/NoticiaDetalhe";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "./lib/supabase";

import AdminLayout from "./pages/AdminLayout";
import Patrimonio from "./pages/Patrimonio";

import PatrimonioDetalhe from "./pages/PatrimonioDetalhe";
import PatrimonioRelatorio from "./pages/PatrimonioRelatorio";

const queryClient = new QueryClient();

// Componente para redirecionar para o edital
const EditalRedirect = () => {
  const { id } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["edital-redirect", id],
    queryFn: async () => {
      if (!id) throw new Error("ID do edital não encontrado");
      const { data, error } = await supabase
        .from("editais")
        .select("documento_url")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (isError || !data?.documento_url) return <NotFound />;

  // Redireciona para o URL do arquivo no Supabase
  window.location.href = data.documento_url;
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/editais" element={<EditaisPublic />} />
          <Route path="/edital/:id" element={<EditalRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/noticia/:id" element={<NoticiaDetalhe />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/editais" replace />} />
            <Route path="editais" element={<Editais />} />
            <Route path="noticias" element={<Noticias />} />
            <Route path="patrimonio" element={<Patrimonio />} />
            <Route path="patrimonio/:id" element={<PatrimonioDetalhe />} />
            <Route path="patrimonio/relatorio" element={<PatrimonioRelatorio />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
