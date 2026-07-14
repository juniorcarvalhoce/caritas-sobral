import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, FileText, ExternalLink, Shield, LogOut, Eye } from "lucide-react";
import logoCaritas from "@/assets/logo-caritas.png";

type Edital = {
  id: string;
  nome: string;
  data_publicacao: string; // date string (YYYY-MM-DD)
  status: "Aberto" | "Em andamento" | "Finalizado" | "Cancelado";
  data_finalizacao: string | null;
  documento_url: string | null;
  descricao: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type EditalAnexo = {
  id: string;
  edital_id: string;
  descricao: string;
  arquivo_url: string;
  created_at: string;
};

const statusOptions = ["Aberto", "Em andamento", "Finalizado", "Cancelado"] as const;

const editalSchema = z.object({
  nome: z.string().min(3, "Nome é obrigatório"),
  data_publicacao: z.string().min(1, "Data de publicação é obrigatória"),
  status: z.enum(statusOptions),
  data_finalizacao: z.string().optional().nullable(),
  descricao: z.string().optional().nullable(),
});

type EditalFormValues = z.infer<typeof editalSchema>;

const PAGE_SIZE = 10;

const Editais = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Edital | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  // Anexos
  const [anexos, setAnexos] = useState<Array<{
    id?: string;
    descricao: string;
    arquivo: File | null;
    arquivo_url?: string;
    remover?: boolean;
  }>>([]);

  // Para buscar anexos existentes quando editando
  const { data: anexosExistentes } = useQuery({
    queryKey: ["editais-anexos", editing?.id],
    enabled: !!editing?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("edital_anexos")
        .select("*")
        .eq("edital_id", editing!.id);
      if (error) throw error;
      return data as EditalAnexo[];
    },
  });

  // Auth guard
  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/login", { replace: true });
        return;
      }
      setIsAuthChecked(true);
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login", { replace: true });
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const queryKey = useMemo(() => ["editais", { search, statusFilter, page }], [search, statusFilter, page]);

  const { data, isLoading, isError } = useQuery({
    queryKey,
    enabled: isAuthChecked,
    queryFn: async () => {
      let q = supabase
        .from("editais")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, (page - 1) * PAGE_SIZE + (PAGE_SIZE - 1));

      if (search) q = q.ilike("nome", `%${search}%`);
      if (statusFilter) q = q.eq("status", statusFilter);

      const { data, error, count } = await q;
      if (error) throw error;
      
      // Aplica o status dinâmico baseado na data de finalização
      const itemsComStatus = (data ?? []).map((item: Edital) => ({
        ...item,
        status: getStatusDinamico(item),
      }));
      
      return { items: itemsComStatus as Edital[], count: count ?? 0 };
    },
  });

  const totalPages = useMemo(() => {
    const count = data?.count ?? 0;
    return Math.max(1, Math.ceil(count / PAGE_SIZE));
  }, [data?.count]);

  const form = useForm<EditalFormValues>({
    resolver: zodResolver(editalSchema),
    defaultValues: {
      nome: "",
      data_publicacao: "",
      status: "Aberto",
      data_finalizacao: "",
      documento_url: "",
      descricao: "",
    },
  });

  const resetForm = () => {
    form.reset({
      nome: "",
      data_publicacao: "",
      status: "Aberto",
      data_finalizacao: "",
      descricao: "",
    });
    setEditing(null);
    setAnexos([]);
  };

  // Efeito para carregar anexos existentes quando editando
  useEffect(() => {
    if (anexosExistentes) {
      setAnexos(anexosExistentes.map(anexo => ({
        id: anexo.id,
        descricao: anexo.descricao,
        arquivo: null,
        arquivo_url: anexo.arquivo_url,
        remover: false,
      })));
    }
  }, [anexosExistentes]);

  const uploadPdfAndGetUrl = async (file: File) => {
    const path = `edital-anexo-${Date.now()}-${(crypto?.randomUUID?.() || Math.random().toString(36).slice(2)).slice(0, 8)}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage
      .from("editais")
      .upload(path, file, { 
        contentType: file.type,
        cacheControl: "3600",
        upsert: false 
      });
    if (uploadError) throw uploadError;
    const { data: pub } = supabase.storage.from("editais").getPublicUrl(path);
    return pub.publicUrl;
  };

  // Funções para gerenciar anexos
  const adicionarAnexo = () => {
    setAnexos([...anexos, { descricao: "", arquivo: null, remover: false }]);
  };

  const atualizarAnexo = (index: number, campo: "descricao" | "arquivo", valor: any) => {
    const novosAnexos = [...anexos];
    novosAnexos[index][campo] = valor;
    setAnexos(novosAnexos);
  };

  const removerAnexo = (index: number) => {
    const novosAnexos = [...anexos];
    if (novosAnexos[index].id) {
      novosAnexos[index].remover = true;
    } else {
      novosAnexos.splice(index, 1);
    }
    setAnexos(novosAnexos);
  };

  const createMutation = useMutation({
    mutationFn: async ({ values }: { values: EditalFormValues }) => {
      // Determina o status final
      let statusFinal = values.status;
      if (values.data_finalizacao && podeUsarEmAndamento(values.data_finalizacao)) {
        if (values.status !== "Em andamento" && values.status !== "Cancelado") {
          statusFinal = "Finalizado";
        }
      }

      // Cria o edital
      const insertPayload = {
        nome: values.nome,
        data_publicacao: values.data_publicacao,
        status: statusFinal,
        data_finalizacao: values.data_finalizacao ? values.data_finalizacao : null,
        descricao: values.descricao ?? null,
      };
      const { data: editalCriado, error } = await supabase
        .from("editais")
        .insert(insertPayload)
        .select("id")
        .single();
      if (error) throw error;

      // Cria os anexos
      for (const anexo of anexos) {
        if (!anexo.arquivo || !anexo.descricao) continue;
        const arquivoUrl = await uploadPdfAndGetUrl(anexo.arquivo);
        const { error: errorAnexo } = await supabase.from("edital_anexos").insert({
          edital_id: editalCriado.id,
          descricao: anexo.descricao,
          arquivo_url: arquivoUrl,
        });
        if (errorAnexo) throw errorAnexo;
      }
    },
    onSuccess: () => {
      toast.success("Edital criado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["editais"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Erro ao criar edital");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ values }: { values: EditalFormValues }) => {
      if (!editing) return;

      // Determina o status final
      let statusFinal = values.status;
      if (values.data_finalizacao && podeUsarEmAndamento(values.data_finalizacao)) {
        if (values.status !== "Em andamento" && values.status !== "Cancelado") {
          statusFinal = "Finalizado";
        }
      }

      // Atualiza o edital
      const updatePayload = {
        nome: values.nome,
        data_publicacao: values.data_publicacao,
        status: statusFinal,
        data_finalizacao: values.data_finalizacao ? values.data_finalizacao : null,
        descricao: values.descricao ?? null,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("editais")
        .update(updatePayload)
        .eq("id", editing.id);
      if (error) throw error;

      // Remove os anexos marcados para remoção
      const anexosParaRemover = anexos.filter(a => a.remover && a.id);
      for (const anexo of anexosParaRemover) {
        const { error: errorRemover } = await supabase
          .from("edital_anexos")
          .delete()
          .eq("id", anexo.id);
        if (errorRemover) throw errorRemover;
      }

      // Adiciona novos anexos
      const novosAnexos = anexos.filter(a => !a.id && !a.remover && a.arquivo && a.descricao);
      for (const anexo of novosAnexos) {
        if (!anexo.arquivo || !anexo.descricao) continue;
        const arquivoUrl = await uploadPdfAndGetUrl(anexo.arquivo);
        const { error: errorAnexo } = await supabase.from("edital_anexos").insert({
          edital_id: editing.id,
          descricao: anexo.descricao,
          arquivo_url: arquivoUrl,
        });
        if (errorAnexo) throw errorAnexo;
      }
    },
    onSuccess: () => {
      toast.success("Edital atualizado");
      queryClient.invalidateQueries({ queryKey: ["editais"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Erro ao atualizar edital");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("editais").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Edital deletado");
      queryClient.invalidateQueries({ queryKey: ["editais"] });
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Erro ao deletar edital");
    },
  });

  const onSubmit = async (values: EditalFormValues) => {
    if (editing) {
      await updateMutation.mutateAsync({ values });
    } else {
      await createMutation.mutateAsync({ values });
    }
  };

  const openCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEdit = (item: Edital) => {
    setEditing(item);
    form.reset({
      nome: item.nome,
      data_publicacao: item.data_publicacao?.slice(0, 10) ?? "",
      status: item.status,
      data_finalizacao: item.data_finalizacao?.slice(0, 10) ?? "",
      descricao: item.descricao ?? "",
    });
    setIsDialogOpen(true);
  };

  // Função para verificar se pode usar "Em andamento"
  const podeUsarEmAndamento = (dataFinalizacao?: string | null): boolean => {
    if (!dataFinalizacao) return false;
    
    const hojeBrasil = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const [year, month, day] = dataFinalizacao.split('T')[0].split('-');
    if (!year || !month || !day) return false;
    
    const hojeSemHora = new Date(hojeBrasil.getFullYear(), hojeBrasil.getMonth(), hojeBrasil.getDate());
    const finalizacaoSemHora = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    // Só permite "Em andamento" se hoje > data de finalização
    return hojeSemHora > finalizacaoSemHora;
  };

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" />
          <span>Verificando autenticação...</span>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    // Trata a data como local (YYYY-MM-DD) para evitar problemas de timezone
    const [year, month, day] = dateStr.split('T')[0].split('-');
    if (!year || !month || !day) return "—";
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("pt-BR");
  };

  // Função para calcular o status dinâmico baseado na data de finalização
  const getStatusDinamico = (edital: Edital): Edital["status"] => {
    // Se o status for "Cancelado", mantém como está
    if (edital.status === "Cancelado") {
      return "Cancelado";
    }

    // Se não houver data de finalização, retorna o status original
    if (!edital.data_finalizacao) {
      return edital.status;
    }

    // Obtém a data de hoje no timezone do Brasil (America/Sao_Paulo)
    const hojeBrasil = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    
    // Trata a data de finalização como local (YYYY-MM-DD)
    const [year, month, day] = edital.data_finalizacao.split('T')[0].split('-');
    if (!year || !month || !day) return edital.status;
    
    // Compara apenas as datas (sem horas)
    const hojeSemHora = new Date(hojeBrasil.getFullYear(), hojeBrasil.getMonth(), hojeBrasil.getDate());
    const finalizacaoSemHora = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    // Se hoje for maior que a data de finalização (limite para inscrição)
    if (hojeSemHora > finalizacaoSemHora) {
      // Se o usuário definiu manualmente como "Em andamento", mantém
      if (edital.status === "Em andamento") {
        return "Em andamento";
      }
      // Caso contrário, muda automaticamente para "Finalizado"
      return "Finalizado";
    }

    // Se hoje for menor ou igual à data de finalização, mantém o status original
    return edital.status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Cabeçalho com logo, navegação e logout */}
      <header className="w-full bg-card/80 shadow-lg mb-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src={logoCaritas} alt="Logo Cáritas" className="h-10 w-auto rounded-lg shadow" />
              <span className="font-heading text-xl font-bold text-primary">Área Administrativa</span>
            </div>
            <Button
              variant="ghost"
              className="gap-2"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/login", { replace: true });
              }}
            >
              <LogOut className="w-5 h-5" />
              Sair
            </Button>
          </div>

        </div>
      </header>
      <div className="container mx-auto px-4 py-10">
        <Card className="glass rounded-3xl shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="font-heading text-2xl">Editais</CardTitle>
            <Button onClick={openCreate} variant="default" className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Edital
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-6">
              <div className="flex gap-3 w-full md:w-auto">
                <Input
                  placeholder="Buscar por nome..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="glass-dark"
                />
                <Select
                  value={statusFilter ?? "all"}
                  onValueChange={(v) => {
                    setStatusFilter(v === "all" ? undefined : v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[220px] glass-dark">
                    <SelectValue placeholder="Filtrar status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {statusOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                {data?.count ?? 0} resultado(s)
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Publicação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Finalização</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <div className="py-6 text-center text-muted-foreground">Carregando...</div>
                      </TableCell>
                    </TableRow>
                  )}
                  {isError && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <div className="py-6 text-center text-destructive">Erro ao carregar os editais</div>
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && (data?.items?.length ?? 0) === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <div className="py-6 text-center text-muted-foreground">Nenhum edital encontrado</div>
                      </TableCell>
                    </TableRow>
                  )}
                  {(data?.items ?? []).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nome}</TableCell>
                      <TableCell>{formatDate(item.data_publicacao)}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>{formatDate(item.data_finalizacao)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/edital/${item.id}`)}>
                            <Eye className="w-4 h-4" /> Ver
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                            <Pencil className="w-4 h-4" /> Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteDialog({ open: true, id: item.id })}
                          >
                            <Trash2 className="w-4 h-4" /> Deletar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.max(1, p - 1));
                      }}
                    />
                  </PaginationItem>
                  <div className="px-3 text-sm text-muted-foreground">Página {page} de {totalPages}</div>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.min(totalPages, p + 1));
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>

        {/* Modal de criação/edição */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={(o) => {
            setIsDialogOpen(o);
            if (!o) resetForm();
          }}
        >
          <DialogContent className="glass rounded-3xl max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Edital" : "Novo Edital"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <Input {...form.register("nome")} className="glass-dark" placeholder="Nome do edital" />
                {form.formState.errors.nome && (
                  <p className="text-destructive text-xs mt-1">{form.formState.errors.nome.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Data de publicação</label>
                  <Input type="date" {...form.register("data_publicacao")} className="glass-dark" />
                  {form.formState.errors.data_publicacao && (
                    <p className="text-destructive text-xs mt-1">{form.formState.errors.data_publicacao.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <Select
                    value={form.watch("status")}
                    onValueChange={(v) => form.setValue("status", v as EditalFormValues["status"], { shouldValidate: true })}
                  >
                    <SelectTrigger className="glass-dark">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => {
                        const desabilitado = s === "Em andamento" && !podeUsarEmAndamento(form.watch("data_finalizacao"));
                        return (
                          <SelectItem
                            key={s}
                            value={s}
                            disabled={desabilitado}
                            className={desabilitado ? "opacity-50 cursor-not-allowed" : ""}
                          >
                            {s}
                            {desabilitado && " (apenas se hoje > limite de inscrição)"}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.status && (
                    <p className="text-destructive text-xs mt-1">{form.formState.errors.status.message as any}</p>
                  )}
                  {!podeUsarEmAndamento(form.watch("data_finalizacao")) && form.watch("data_finalizacao") && (
                    <p className="text-xs text-muted-foreground mt-1">
                      "Em andamento" só está disponível quando hoje é maior que o limite de inscrição
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Data de finalização</label>
                  <Input
                    type="date"
                    {...form.register("data_finalizacao")}
                    className="glass-dark"
                    onChange={(e) => {
                      form.setValue("data_finalizacao", e.target.value);
                      if (e.target.value && podeUsarEmAndamento(e.target.value)) {
                        const statusAtual = form.watch("status");
                        if (statusAtual !== "Em andamento" && statusAtual !== "Cancelado") {
                          form.setValue("status", "Finalizado");
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <Textarea {...form.register("descricao")} className="glass-dark" rows={4} placeholder="Detalhes do edital" />
              </div>

              {/* Anexos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Anexos</label>
                  <Button type="button" variant="ghost" onClick={adicionarAnexo} className="text-xs">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar anexo
                  </Button>
                </div>
                <div className="space-y-3">
                  {anexos.map((anexo, index) => !anexo.remover && (
                    <Card key={index} className="border-primary/20">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">Descrição</label>
                            <Input
                              value={anexo.descricao}
                              onChange={(e) => atualizarAnexo(index, "descricao", e.target.value)}
                              placeholder="Ex: Edital principal"
                              className="glass-dark"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">Arquivo</label>
                            {anexo.arquivo_url && !anexo.arquivo ? (
                              <div className="flex items-center gap-2 text-sm">
                                <FileText className="w-4 h-4 text-primary" />
                                <a href={anexo.arquivo_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                  Arquivo existente
                                </a>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => atualizarAnexo(index, "arquivo", null)}
                                >
                                  Substituir
                                </Button>
                              </div>
                            ) : (
                              <Input
                                type="file"
                                onChange={(e) => atualizarAnexo(index, "arquivo", e.target.files?.[0] ?? null)}
                                className="glass-dark"
                              />
                            )}
                            {anexo.arquivo && (
                              <p className="text-xs text-muted-foreground mt-1">Arquivo selecionado: {anexo.arquivo.name}</p>
                            )}
                          </div>
                          <div className="flex justify-end">
                            <Button type="button" variant="destructive" size="sm" onClick={() => removerAnexo(index)}>
                              <Trash2 className="w-3 h-3 mr-1" />
                              Remover
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <DialogFooter className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsDialogOpen(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="default" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editing ? (
                    <span className="inline-flex items-center gap-2">
                      <Pencil className="w-4 h-4" />
                      Salvar alterações
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Criar edital
                    </span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal de confirmação de deleção */}
        <Dialog open={deleteDialog.open} onOpenChange={(o) => setDeleteDialog({ open: o, id: null })}>
          <DialogContent className="glass rounded-2xl">
            <DialogHeader>
              <DialogTitle>Confirmar deleção</DialogTitle>
            </DialogHeader>
            <div className="py-4">Tem certeza que deseja deletar este edital? Essa ação não pode ser desfeita.</div>
            <DialogFooter className="flex gap-2">
              <Button variant="ghost" onClick={() => setDeleteDialog({ open: false, id: null })}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (deleteDialog.id) deleteMutation.mutate(deleteDialog.id);
                  setDeleteDialog({ open: false, id: null });
                }}
              >
                Deletar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Editais;