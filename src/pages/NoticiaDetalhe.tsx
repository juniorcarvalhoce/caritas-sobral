
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, User, ArrowLeft, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Noticia = {
  id: string;
  titulo: string;
  resumo: string;
  imagem_url: string | null;
  conteudo: string | null;
  data_publicacao: string;
  autor?: string; // Optional for now
};

const NoticiaDetalhe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on component mount

    const fetchNoticia = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from("noticias")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setNoticia(data);
      } catch (error) {
        console.error("Erro ao carregar notícia:", error);
        navigate("/not-found"); // Or just show an error
      } finally {
        setLoading(false);
      }
    };

    fetchNoticia();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto py-24 px-4">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Skeleton className="h-96 w-full mb-8" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!noticia) return null;

  const normalizeUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    url = url.trim();
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('//')) {
      return `https:${url}`;
    }
    return `https://${url}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto pt-24 pb-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/', { state: { scrollTo: '#noticias-e-acoes' } })}
          className="mb-6 hover:bg-secondary/20"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>

        <article className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm mb-6">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(noticia.data_publicacao).toLocaleDateString('pt-BR')}
              </span>
              {noticia.autor && (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {noticia.autor}
                </span>
              )}
            </div>

            {/* Title & Subtitle */}
            <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4 text-foreground">
              {noticia.titulo}
            </h1>
            {noticia.resumo && (
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {noticia.resumo}
              </p>
            )}

            {/* Featured Image */}
            {noticia.imagem_url && (
              <div className="rounded-xl overflow-hidden mb-10 shadow-lg">
                <img
                  src={noticia.imagem_url}
                  alt={noticia.titulo}
                  className="w-full h-auto object-cover max-h-[600px]"
                />
              </div>
            )}

            {/* Content */}
            <div
              className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-heading prose-headings:font-bold
                prose-a:text-primary prose-img:rounded-xl prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: noticia.conteudo || "" }}
            />

            {/* External Link */}
            {noticia.url && (
              <div className="mt-8 text-center">
                <a
                  href={normalizeUrl(noticia.url) || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  Mais detalhes em: {noticia.url}
                </a>
              </div>
            )}
          </motion.div>
        </article>
      </div>
      <Footer />
    </div>
  );
};

export default NoticiaDetalhe;
