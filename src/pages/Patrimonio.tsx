import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Printer,
  Search,
  Package,
  Wallet,
  ImageOff,
  AlertTriangle,
} from "lucide-react";
import PatrimonioForm, { PatrimonioFormValues, TIPOS_DE_BEM } from "@/components/PatrimonioForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { toast } from "sonner";

// Tipagem para os bens patrimoniais, alinhada com o banco de dados
export interface BemPatrimonial {
  id: number;
  created_at: string;
  tipo: string;
  nome: string;
  numero_serie?: string | null;
  numero_tombamento: string;
  estado: "novo" | "bom" | "regular" | "danificado" | "inservivel";
  descricao?: string | null;
  valor: number;
  foto_url?: string | null;
  localizacao_atual?: string | null;
  responsavel_atual?: string | null;
  data_ultima_movimentacao?: string | null;
}

export const estadoLabels: Record<BemPatrimonial["estado"], string> = {
  novo: "Novo",
  bom: "Bom",
  regular: "Regular",
  danificado: "Danificado",
  inservivel: "Inservível",
};

export const estadoCores: Record<BemPatrimonial["estado"], string> = {
  novo: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  bom: "bg-green-50 text-green-700 ring-green-600/20",
  regular: "bg-amber-50 text-amber-700 ring-amber-600/20",
  danificado: "bg-orange-50 text-orange-700 ring-orange-600/20",
  inservivel: "bg-red-50 text-red-700 ring-red-600/20",
};

const fetchBens = async (): Promise<BemPatrimonial[]> => {
  const { data, error } = await supabase
    .from("bens_patrimoniais")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);

const Patrimonio = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBem, setSelectedBem] = useState<BemPatrimonial | null>(null);
  const [bemParaExcluir, setBemParaExcluir] = useState<BemPatrimonial | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const { data: bens, isLoading, isError } = useQuery<BemPatrimonial[]>({
    queryKey: ["bens_patrimoniais"],
    queryFn: fetchBens,
  });

  const mutation = useMutation({
    mutationFn: async ({ bem, id }: { bem: PatrimonioFormValues; id?: number }) => {
      const { data, error } = id
        ? await supabase.from("bens_patrimoniais").update(bem).eq("id", id).select().single()
        : await supabase.from("bens_patrimoniais").insert(bem).select().single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["bens_patrimoniais"] });
      setIsDialogOpen(false);
      setSelectedBem(null);
      toast.success(id ? "Bem atualizado com sucesso!" : "Bem cadastrado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao salvar: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("bens_patrimoniais").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bens_patrimoniais"] });
      toast.success("Bem excluído com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  const openDialog = (bem: BemPatrimonial | null = null) => {
    setSelectedBem(bem);
    setIsDialogOpen(true);
  };

  const bensFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return (bens ?? []).filter((bem) => {
      const casaBusca =
        !termo ||
        [bem.nome, bem.numero_tombamento, bem.numero_serie, bem.localizacao_atual, bem.responsavel_atual]
          .filter(Boolean)
          .some((campo) => String(campo).toLowerCase().includes(termo));
      const casaTipo = filtroTipo === "todos" || bem.tipo === filtroTipo;
      const casaEstado = filtroEstado === "todos" || bem.estado === filtroEstado;
      return casaBusca && casaTipo && casaEstado;
    });
  }, [bens, busca, filtroTipo, filtroEstado]);

  const resumo = useMemo(() => {
    const lista = bens ?? [];
    return {
      total: lista.length,
      valor: lista.reduce((soma, bem) => soma + (Number(bem.valor) || 0), 0),
      atencao: lista.filter((bem) => bem.estado === "danificado" || bem.estado === "inservivel").length,
      semFoto: lista.filter((bem) => !bem.foto_url).length,
    };
  }, [bens]);

  const cartoes = [
    { rotulo: "Bens cadastrados", valor: String(resumo.total), icone: Package },
    { rotulo: "Valor total", valor: formatCurrency(resumo.valor), icone: Wallet },
    { rotulo: "Danificados ou inservíveis", valor: String(resumo.atencao), icone: AlertTriangle },
    { rotulo: "Sem foto", valor: String(resumo.semFoto), icone: ImageOff },
  ];

  const filtrosAtivos = busca || filtroTipo !== "todos" || filtroEstado !== "todos";

  return (
    <>
      <AdminPageHeader
        titulo="Patrimônio"
        descricao="Bens da Cáritas Diocesana de Sobral, com localização, responsável e estado de conservação."
        acoes={
          <>
            <Button variant="outline" onClick={() => navigate("/admin/patrimonio/relatorio")}>
              <Printer className="h-4 w-4" />
              Relatórios
            </Button>
            <Button onClick={() => openDialog()}>
              <PlusCircle className="h-4 w-4" />
              Adicionar bem
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cartoes.map((cartao) => (
          <div key={cartao.rotulo} className="bg-card rounded-xl border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <cartao.icone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{cartao.rotulo}</p>
              <p className="text-lg font-semibold truncate">{isLoading ? "—" : cartao.valor}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border">
        <div className="flex flex-col md:flex-row gap-3 p-4 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, tombamento, série, local ou responsável"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="md:w-[210px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              {TIPOS_DE_BEM.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="md:w-[170px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os estados</SelectItem>
              {Object.entries(estadoLabels).map(([valor, rotulo]) => (
                <SelectItem key={valor} value={valor}>
                  {rotulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading && <p className="p-8 text-center text-muted-foreground">Carregando...</p>}
        {isError && <p className="p-8 text-center text-destructive">Erro ao carregar os dados.</p>}

        {bens && bensFiltrados.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bem</TableHead>
                  <TableHead className="hidden md:table-cell">Tombamento</TableHead>
                  <TableHead className="hidden lg:table-cell">Localização</TableHead>
                  <TableHead className="hidden lg:table-cell">Responsável</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Valor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bensFiltrados.map((bem) => (
                  <TableRow
                    key={bem.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/admin/patrimonio/${bem.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-muted flex items-center justify-center flex-shrink-0 border">
                          {bem.foto_url ? (
                            <img src={bem.foto_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[220px] lg:max-w-[320px]">{bem.nome}</p>
                          <p className="text-xs text-muted-foreground truncate">{bem.tipo}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-sm">{bem.numero_tombamento}</TableCell>
                    <TableCell className="hidden lg:table-cell">{bem.localizacao_atual || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="hidden lg:table-cell">{bem.responsavel_atual || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="hidden sm:table-cell text-right tabular-nums">{formatCurrency(bem.valor)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${estadoCores[bem.estado]}`}>
                        {estadoLabels[bem.estado]}
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="sr-only">Abrir ações</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/admin/patrimonio/${bem.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDialog(bem)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setBemParaExcluir(bem)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {bens && bensFiltrados.length === 0 && (
          <div className="text-center py-14 px-4">
            <Package className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-medium">
              {filtrosAtivos ? "Nenhum bem encontrado com esses filtros" : "Nenhum bem patrimonial cadastrado"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {filtrosAtivos ? "Tente outra busca ou limpe os filtros." : "Clique em “Adicionar bem” para começar."}
            </p>
          </div>
        )}

        {bens && bens.length > 0 && (
          <p className="text-xs text-muted-foreground px-4 py-3 border-t">
            Mostrando {bensFiltrados.length} de {bens.length} bens
          </p>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl p-0 gap-0 max-h-[92vh] flex flex-col overflow-hidden">
          <PatrimonioForm
            key={selectedBem?.id ?? "novo"} // Garante que o formulário reinicie ao mudar o item
            onSubmit={(data) => mutation.mutate({ bem: data, id: selectedBem?.id })}
            onCancel={() => setIsDialogOpen(false)}
            isSubmitting={mutation.isPending}
            defaultValues={selectedBem || undefined}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(bemParaExcluir)} onOpenChange={(aberto) => !aberto && setBemParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este bem?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{bemParaExcluir?.nome}</strong> (tombamento {bemParaExcluir?.numero_tombamento}) será removido do
              patrimônio. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => bemParaExcluir && deleteMutation.mutate(bemParaExcluir.id)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Patrimonio;
