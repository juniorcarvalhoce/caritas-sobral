import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useParams } from "react-router-dom";
import { BemPatrimonial } from "./Patrimonio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import MovimentacaoForm, { MovimentacaoFormValues } from "@/components/MovimentacaoForm";
import { toast } from "sonner";
import { useState } from "react";

interface Movimentacao {
    id: string;
    bem_id: string;
    setor: string;
    responsavel: string;
    data_movimentacao: string;
}

const fetchBemById = async (id: string): Promise<BemPatrimonial> => {
  const { data, error } = await supabase
    .from("bens_patrimoniais")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

const fetchMovimentacoesByBemId = async (bemId: string): Promise<Movimentacao[]> => {
    const { data, error } = await supabase
        .from("movimentacoes")
        .select("*")
        .eq("bem_id", bemId)
        .order("data_movimentacao", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

const PatrimonioDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showMovimentacaoForm, setShowMovimentacaoForm] = useState(false);

  const { data: bem, isLoading: isLoadingBem, isError: isErrorBem } = useQuery<BemPatrimonial>({
    queryKey: ["bem_patrimonial", id],
    queryFn: () => fetchBemById(id!),
    enabled: !!id,
  });

  const { data: movimentacoes, isLoading: isLoadingMovimentacoes } = useQuery<Movimentacao[]>({
      queryKey: ["movimentacoes", id],
      queryFn: () => fetchMovimentacoesByBemId(id!),
      enabled: !!id,
  });

  const addMovimentacaoMutation = useMutation({
    mutationFn: async (movimentacaoData: MovimentacaoFormValues) => {
      const { error } = await supabase.rpc('registrar_movimentacao', {
        p_bem_id: id,
        p_setor: movimentacaoData.setor,
        p_responsavel: movimentacaoData.responsavel,
        p_data_movimentacao: movimentacaoData.data_movimentacao,
      });

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Movimentação registrada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["movimentacoes", id] });
      queryClient.invalidateQueries({ queryKey: ["bem_patrimonial", id] });
      setShowMovimentacaoForm(false);
    },
    onError: (error) => {
      toast.error(`Erro ao registrar movimentação: ${error.message}`);
    },
  });

  const handleAddMovimentacao = (data: MovimentacaoFormValues) => {
    addMovimentacaoMutation.mutate(data);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("pt-BR", { timeZone: 'UTC' });
  }

  const estadoLabels: Record<BemPatrimonial["estado"], string> = {
    novo: "Novo",
    bom: "Bom",
    regular: "Regular",
    danificado: "Danificado",
    inservivel: "Inservível",
  };

  if (isLoadingBem) return <div>Carregando...</div>;
  if (isErrorBem) return <div>Erro ao carregar o bem.</div>;
  if (!bem) return <div>Bem não encontrado.</div>;

  return (
    <div>
        <Button variant="outline" onClick={() => navigate("/admin/patrimonio")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a Lista
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold font-heading">{bem.nome}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">{bem.descricao}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong>Tipo:</strong> {bem.tipo}</div>
                            <div><strong>Nº Tombamento:</strong> {bem.numero_tombamento}</div>
                            <div><strong>Nº Série:</strong> {bem.numero_serie || "N/A"}</div>
                            <div><strong>Valor:</strong> {formatCurrency(bem.valor)}</div>
                            <div><strong>Estado:</strong> <Badge>{estadoLabels[bem.estado]}</Badge></div>
                        </div>
                        {bem.localizacao_atual && (
                            <div className="mt-4 pt-4 border-t">
                                <h4 className="font-semibold mb-2">Localização Atual</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><strong>Setor:</strong> {bem.localizacao_atual}</div>
                                    <div><strong>Responsável:</strong> {bem.responsavel_atual}</div>
                                    <div><strong>Data:</strong> {formatDate(bem.data_ultima_movimentacao!)}</div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Foto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {bem.foto_url ? (
                            <img src={bem.foto_url} alt={bem.nome} className="rounded-lg w-full" />
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                Nenhuma foto cadastrada.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>

        <div className="mt-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Histórico de Movimentações</CardTitle>
                    <Button size="sm" onClick={() => setShowMovimentacaoForm(!showMovimentacaoForm)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {showMovimentacaoForm ? "Cancelar" : "Nova Movimentação"}
                    </Button>
                </CardHeader>
                <CardContent>
                    {showMovimentacaoForm && (
                        <div className="mb-6">
                            <MovimentacaoForm 
                                onSubmit={handleAddMovimentacao}
                                isSubmitting={addMovimentacaoMutation.isPending}
                            />
                        </div>
                    )}

                    {isLoadingMovimentacoes ? (
                        <p>Carregando histórico...</p>
                    ) : movimentacoes && movimentacoes.length > 0 ? (
                        <ul className="space-y-4">
                            {movimentacoes.map((mov) => (
                                <li key={mov.id} className="p-4 border rounded-lg bg-muted/40">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p><strong>Setor:</strong> {mov.setor}</p>
                                            <p><strong>Responsável:</strong> {mov.responsavel}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(mov.data_movimentacao)}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-muted-foreground py-4">
                            Nenhuma movimentação registrada para este bem.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
};

export default PatrimonioDetalhe;
