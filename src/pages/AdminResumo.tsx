import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building, FileText, Newspaper, Plus, Wallet } from "lucide-react";

type ResumoEditais = { total: number; abertos: number; andamento: number };
type NoticiaResumo = { id: string; titulo: string; data_publicacao: string; ativo: boolean };

const formatCurrency = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

const formatDate = (data?: string | null) => {
  if (!data) return "—";
  const [ano, mes, dia] = data.split("T")[0].split("-");
  return `${dia}/${mes}/${ano}`;
};

const AdminResumo = () => {
  const editais = useQuery<ResumoEditais>({
    queryKey: ["admin-resumo-editais"],
    queryFn: async () => {
      const { data, error } = await supabase.from("editais").select("status");
      if (error) throw error;
      const lista = data ?? [];
      return {
        total: lista.length,
        abertos: lista.filter((e) => e.status === "Aberto").length,
        andamento: lista.filter((e) => e.status === "Em andamento").length,
      };
    },
  });

  const noticias = useQuery<NoticiaResumo[]>({
    queryKey: ["admin-resumo-noticias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("noticias")
        .select("id, titulo, data_publicacao, ativo")
        .order("data_publicacao", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  const patrimonio = useQuery<{ total: number; valor: number }>({
    queryKey: ["admin-resumo-patrimonio"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bens_patrimoniais").select("valor");
      if (error) throw error;
      const lista = data ?? [];
      return { total: lista.length, valor: lista.reduce((soma, b) => soma + (Number(b.valor) || 0), 0) };
    },
  });

  const cartoes = [
    {
      rotulo: "Editais abertos",
      valor: editais.data ? String(editais.data.abertos) : "—",
      detalhe: editais.data ? `${editais.data.andamento} em andamento · ${editais.data.total} no total` : "",
      icone: FileText,
      link: "/admin/editais",
    },
    {
      rotulo: "Notícias publicadas",
      valor: noticias.data ? String(noticias.data.filter((n) => n.ativo).length) : "—",
      detalhe: "entre as 5 mais recentes",
      icone: Newspaper,
      link: "/admin/noticias",
    },
    {
      rotulo: "Bens no patrimônio",
      valor: patrimonio.data ? String(patrimonio.data.total) : "—",
      detalhe: "cadastrados",
      icone: Building,
      link: "/admin/patrimonio",
    },
    {
      rotulo: "Valor do patrimônio",
      valor: patrimonio.data ? formatCurrency(patrimonio.data.valor) : "—",
      detalhe: "soma dos bens",
      icone: Wallet,
      link: "/admin/patrimonio",
    },
  ];

  return (
    <>
      <AdminPageHeader titulo="Resumo" descricao="Visão geral da área administrativa da Cáritas Diocesana de Sobral." />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cartoes.map((cartao) => (
          <Link
            key={cartao.rotulo}
            to={cartao.link}
            className="bg-card rounded-xl border p-5 hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{cartao.rotulo}</span>
              <cartao.icone className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold truncate">{cartao.valor}</p>
            <p className="text-xs text-muted-foreground mt-1">{cartao.detalhe}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="font-semibold">Últimas notícias</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/noticias">
                Ver todas <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <ul className="divide-y">
            {noticias.isLoading && <li className="px-5 py-6 text-sm text-muted-foreground">Carregando...</li>}
            {noticias.data?.length === 0 && <li className="px-5 py-6 text-sm text-muted-foreground">Nenhuma notícia cadastrada.</li>}
            {noticias.data?.map((n) => (
              <li key={n.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{n.titulo}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(n.data_publicacao)}</p>
                </div>
                <span
                  className={`text-[11px] font-medium rounded-full px-2 py-0.5 ring-1 ring-inset flex-shrink-0 ${
                    n.ativo ? "bg-green-50 text-green-700 ring-green-600/20" : "bg-gray-50 text-gray-600 ring-gray-500/20"
                  }`}
                >
                  {n.ativo ? "Publicada" : "Oculta"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card rounded-xl border p-5">
          <h2 className="font-semibold mb-4">Ações rápidas</h2>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/admin/editais?novo=1">
                <Plus className="w-4 h-4" /> Novo edital
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/admin/noticias">
                <Plus className="w-4 h-4" /> Nova notícia
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/admin/patrimonio">
                <Plus className="w-4 h-4" /> Cadastrar bem
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminResumo;
