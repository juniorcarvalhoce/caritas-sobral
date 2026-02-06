import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Eye, Printer } from "lucide-react";
import PatrimonioForm, { PatrimonioFormValues } from "@/components/PatrimonioForm";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

// Tipagem para os bens patrimoniais, alinhada com o banco de dados
export interface BemPatrimonial {
  id: number;
  created_at: string;
  tipo: string;
  nome: string;
  numero_serie?: string;
  numero_tombamento: string;
  estado: "novo" | "bom" | "regular" | "danificado" | "inservivel";
  descricao?: string;
  valor: number;
  foto_url?: string;
  localizacao_atual?: string;
  responsavel_atual?: string;
  data_ultima_movimentacao?: string;
}

const fetchBens = async (): Promise<BemPatrimonial[]> => {
  const { data, error } = await supabase.from("bens_patrimoniais").select("*");
  if (error) throw new Error(error.message);
  return data || [];
};

const Patrimonio = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBem, setSelectedBem] = useState<BemPatrimonial | null>(null);

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bens_patrimoniais"] });
      setIsDialogOpen(false);
      setSelectedBem(null);
      sonnerToast.success("Operação realizada com sucesso!");
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("bens_patrimoniais").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bens_patrimoniais"] });
      sonnerToast.success("Bem excluído com sucesso!");
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFormSubmit = (data: PatrimonioFormValues) => {
    mutation.mutate({ bem: data, id: selectedBem?.id });
  };

  const handleDelete = (id: number) => {
    sonnerToast("Tem certeza que deseja excluir este item?", {
      action: {
        label: "Confirmar",
        onClick: () => deleteMutation.mutate(id),
      },
      cancel: {
        label: "Cancelar",
      },
    });
  };

  const openDialog = (bem: BemPatrimonial | null = null) => {
    setSelectedBem(bem);
    setIsDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const estadoLabels: Record<BemPatrimonial["estado"], string> = {
    novo: "Novo",
    bom: "Bom",
    regular: "Regular",
    danificado: "Danificado",
    inservivel: "Inservível",
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-heading">Gestão de Patrimônio</h1>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/admin/patrimonio/relatorio")}>
                <Printer className="mr-2 h-4 w-4" />
                Relatórios
            </Button>
            <Button onClick={() => openDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Bem
            </Button>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-md">
        {isLoading && <p>Carregando...</p>}
        {isError && <p className="text-destructive">Erro ao carregar os dados.</p>}
        {bens && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Nº Tombamento</TableHead>
                <TableHead>Localização Atual</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bens.map((bem) => (
                <TableRow key={bem.id}>
                  <TableCell className="font-medium">{bem.nome}</TableCell>
                  <TableCell>{bem.numero_tombamento}</TableCell>
                  <TableCell>{bem.localizacao_atual || "N/A"}</TableCell>
                  <TableCell>{bem.responsavel_atual || "N/A"}</TableCell>
                  <TableCell>{estadoLabels[bem.estado]}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/admin/patrimonio/${bem.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Visualizar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDialog(bem)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(bem.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {bens?.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Nenhum bem patrimonial cadastrado.
          </p>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedBem ? "Editar Bem" : "Adicionar Novo Bem"}
            </DialogTitle>
          </DialogHeader>
          <PatrimonioForm
            key={selectedBem?.id} // Garante que o formulário reinicie ao mudar o item
            onSubmit={handleFormSubmit}
            onCancel={() => setIsDialogOpen(false)}
            isSubmitting={mutation.isPending}
            defaultValues={selectedBem || undefined}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Patrimonio;
