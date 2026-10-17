import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, FileText, Eye, Shield, CheckCircle, Clock, AlertCircle, Calendar, Trash, Search } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { tipoDoArquivo } from "@/lib/arquivos";
import { ordenarEditais } from "@/lib/editais";

type Edital = {
  id: string;
  nome: string;
  data_publicacao: string;
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

  const [anexos, setAnexos] = useState<Array<{
    id?: string;
    descricao: string;
    arquivo: File | null;
    arquivo_url?: string;
    remover?: boolean;
  }>>([]);

  const { data: anexosExistentes } = useQuery({
    queryKey: ["editais-anexos", editing?.id],
    enabled: !!editing?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("edital_anexos")
        .select("*")
        .eq("edital_id", editing!.id)
        .order("created_at");
      if (error) throw error;
      return data as EditalAnexo[];
    },
  });

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

  // Atalho "Novo edital" vindo do Resumo (/admin/editais?novo=1)
  useEffect(() => {
    if (isAuthChecked && new URLSearchParams(location.search).get("novo") === "1") {
      setIsDialogOpen(true);
      navigate("/admin/editais", { replace: true });
    }
  }, [isAuthChecked, location.search, navigate]);

  const queryKey = useMemo(() => ["editais", { search, statusFilter, page }], [search, statusFilter, page]);

  const { data, isLoading, isError } = useQuery({
    queryKey,
    enabled: isAuthChecked,
    queryFn: async () => {
      // Busca todos para ordenar e filtrar pelo status calculado (que depende da data de finalização)
      let q = supabase.from("editais").select("*");
      if (search) q = q.ilike("nome", `%${search}%`);

      const { data, error } = await q;
      if (error) throw error;

      let itens = (data ?? []).map((item: Edital) => ({
        ...item,
        status: getStatusDinamico(item),
      }));
      if (statusFilter) itens = itens.filter((item) => item.status === statusFilter);
      itens = ordenarEditais(itens);

      const inicio = (page - 1) * PAGE_SIZE;
      return { items: itens.slice(inicio, inicio + PAGE_SIZE) as Edital[], count: itens.length };
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
      let statusFinal = values.status;
      if (values.data_finalizacao && podeUsarEmAndamento(values.data_finalizacao)) {
        if (values.status !== "Em andamento" && values.status !== "Cancelado") {
          statusFinal = "Finalizado";
        }
      }

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

      let statusFinal = values.status;
      if (values.data_finalizacao && podeUsarEmAndamento(values.data_finalizacao)) {
        if (values.status !== "Em andamento" && values.status !== "Cancelado") {
          statusFinal = "Finalizado";
        }
      }

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

      const anexosParaRemover = anexos.filter(a => a.remover && a.id);
      for (const anexo of anexosParaRemover) {
        const { error: errorRemover } = await supabase
          .from("edital_anexos")
          .delete()
          .eq("id", anexo.id);
        if (errorRemover) throw errorRemover;
      }

      const anexosSubstituir = anexos.filter(a => a.id && !a.remover && a.arquivo && a.descricao);
      for (const anexo of anexosSubstituir) {
        if (!anexo.arquivo) continue;
        const arquivoUrl = await uploadPdfAndGetUrl(anexo.arquivo);
        const { error: errorUpd } = await supabase
          .from("edital_anexos")
          .update({ arquivo_url: arquivoUrl, descricao: anexo.descricao })
          .eq("id", anexo.id);
        if (errorUpd) throw errorUpd;
      }

      const anexosAtualizarDescricao = anexos.filter(a => a.id && !a.remover && !a.arquivo && a.descricao);
      for (const anexo of anexosAtualizarDescricao) {
        const { error: errorUpd } = await supabase
          .from("edital_anexos")
          .update({ descricao: anexo.descricao })
          .eq("id", anexo.id);
        if (errorUpd) throw errorUpd;
      }

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

  const podeUsarEmAndamento = (dataFinalizacao?: string | null): boolean => {
    if (!dataFinalizacao) return false;
    
    const hojeBrasil = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const [year, month, day] = dataFinalizacao.split('T')[0].split('-');
    if (!year || !month || !day) return false;
    
    const hojeSemHora = new Date(hojeBrasil.getFullYear(), hojeBrasil.getMonth(), hojeBrasil.getDate());
    const finalizacaoSemHora = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
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
    const [year, month, day] = dateStr.split('T')[0].split('-');
    if (!year || !month || !day) return "—";
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("pt-BR");
  };

  const getStatusDinamico = (edital: Edital): Edital["status"] => {
    if (edital.status === "Cancelado") {
      return "Cancelado";
    }

    if (!edital.data_finalizacao) {
      return edital.status;
    }

    const hojeBrasil = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    
    const [year, month, day] = edital.data_finalizacao.split('T')[0].split('-');
    if (!year || !month || !day) return edital.status;
    
    const hojeSemHora = new Date(hojeBrasil.getFullYear(), hojeBrasil.getMonth(), hojeBrasil.getDate());
    const finalizacaoSemHora = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    if (hojeSemHora > finalizacaoSemHora) {
      if (edital.status === "Em andamento") {
        return "Em andamento";
      }
      return "Finalizado";
    }

    return edital.status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Aberto":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Em andamento":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "Finalizado":
        return <FileText className="w-4 h-4 text-gray-600" />;
      case "Cancelado":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aberto":
        return "bg-green-50 text-green-700 ring-green-600/20";
      case "Em andamento":
        return "bg-yellow-50 text-yellow-700 ring-yellow-600/20";
      case "Finalizado":
        return "bg-gray-50 text-gray-700 ring-gray-600/20";
      case "Cancelado":
        return "bg-red-50 text-red-700 ring-red-600/20";
      default:
        return "bg-gray-50 text-gray-700 ring-gray-600/20";
    }
  };

  return (
    <>
      <AdminPageHeader
        titulo="Editais"
        descricao="Editais publicados na página pública do site, com seus anexos."
        acoes={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo edital
          </Button>
        }
      />
      <div>
        <Card className="rounded-xl shadow-none">
          <CardHeader className="flex flex-col md:flex-row gap-3 p-4 border-b space-y-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter ?? "all"}
              onValueChange={(v) => {
                setStatusFilter(v === "all" ? undefined : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(s)}
                      <span>{s}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">Publicação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Finalização</TableHead>
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
                    <TableRow key={item.id} className="group">
                      <TableCell className="font-medium max-w-xs lg:max-w-md truncate">{item.nome}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(item.data_publicacao)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(item.data_finalizacao)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/edital/${item.id}`)}>
                                <Eye className="w-4 h-4" />
                                <span className="sr-only">Ver no site</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver no site</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                                <Pencil className="w-4 h-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteDialog({ open: true, id: item.id })}
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="sr-only">Excluir</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Excluir</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="text-xs text-muted-foreground px-4 py-3 border-t">
              {data?.count ?? 0} edital(is) encontrado(s)
            </div>
            {data && (data.count ?? 0) > PAGE_SIZE && (
              <div className="flex justify-center pb-4">
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
            )}
          </CardContent>
        </Card>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(o) => {
            setIsDialogOpen(o);
            if (!o) resetForm();
          }}
        >
          <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">
                {editing ? "Editar Edital" : "Novo Edital"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {editing ? "Atualize as informações do edital" : "Preencha os dados para criar um novo edital"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Edital</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome do edital" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="data_publicacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Publicação</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="date" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statusOptions.map((s) => {
                              const desabilitado = s === "Em andamento" && !podeUsarEmAndamento(form.watch("data_finalizacao"));
                              return (
                                <SelectItem
                                  key={s}
                                  value={s}
                                  disabled={desabilitado}
                                >
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(s)}
                                    <span>{s}</span>
                                    {desabilitado && <span className="text-xs text-muted-foreground">(após o prazo)</span>}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="data_finalizacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Finalização (opcional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="date" 
                              className="pl-10"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                if (e.target.value && podeUsarEmAndamento(e.target.value)) {
                                  const statusAtual = form.watch("status");
                                  if (statusAtual !== "Em andamento" && statusAtual !== "Cancelado") {
                                    form.setValue("status", "Finalizado");
                                  }
                                }
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição do Edital</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descreva detalhes do edital" rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FormLabel className="mb-0">
                      Anexos do edital
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {anexos.filter((a) => !a.remover).length} arquivo(s)
                      </span>
                    </FormLabel>
                  </div>
                  <div className="rounded-lg border divide-y">
                    {anexos.map((anexo, index) => {
                      // O índice é o da lista completa: anexos removidos ficam marcados e só são ocultados
                      if (anexo.remover) return null;
                      const tipo = tipoDoArquivo(anexo.arquivo?.name ?? anexo.arquivo_url);
                      const temArquivo = Boolean(anexo.arquivo || anexo.arquivo_url);
                      return (
                        <div key={anexo.id ?? `novo-${index}`} className="flex items-center gap-3 px-3 py-2.5">
                          <span
                            className={`w-11 flex-shrink-0 text-center rounded-md py-1 text-[10px] font-bold ring-1 ring-inset ${
                              temArquivo ? tipo.classe : "bg-muted text-muted-foreground ring-border"
                            }`}
                          >
                            {temArquivo ? tipo.rotulo : "—"}
                          </span>
                          <div className="flex-1 min-w-0 space-y-1">
                            <Input
                              value={anexo.descricao}
                              onChange={(e) => atualizarAnexo(index, "descricao", e.target.value)}
                              placeholder="Nome do documento (ex.: Edital completo)"
                              className="h-8 text-sm"
                              aria-label="Nome do documento"
                            />
                            <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                              {anexo.arquivo ? (
                                <span className="truncate">Novo arquivo: {anexo.arquivo.name}</span>
                              ) : anexo.arquivo_url ? (
                                <a href={anexo.arquivo_url} target="_blank" rel="noreferrer" className="truncate hover:text-primary hover:underline">
                                  Arquivo atual (abrir)
                                </a>
                              ) : (
                                <span className="text-amber-700">Nenhum arquivo escolhido</span>
                              )}
                              <label className="text-primary font-medium cursor-pointer hover:underline flex-shrink-0">
                                {temArquivo ? "Trocar" : "Escolher arquivo"}
                                <input
                                  type="file"
                                  className="sr-only"
                                  onChange={(e) => atualizarAnexo(index, "arquivo", e.target.files?.[0] ?? null)}
                                />
                              </label>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removerAnexo(index)}
                            aria-label="Remover anexo"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      onClick={adicionarAnexo}
                      className="w-full flex items-center justify-center gap-2 px-3 py-3 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar anexo
                    </button>
                  </div>
                </div>
              </form>
            </Form>
            <DialogFooter className="gap-3 sm:gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsDialogOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                onClick={form.handleSubmit(onSubmit)}
              >
                {editing ? (
                  <>
                    <Pencil className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Edital
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteDialog.open} onOpenChange={(o) => setDeleteDialog({ open: o, id: null })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este edital? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3 sm:gap-2">
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
                Deletar Edital
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Editais;
