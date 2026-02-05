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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ExternalLink, Shield, LogOut, FileText, Eye, EyeOff } from "lucide-react";
import logoCaritas from "@/assets/logo-caritas.png";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

type Noticia = {
  id: string;
  titulo: string;
  resumo: string;
  imagem_url: string | null;
  url: string | null;
  conteudo: string | null;
  data_publicacao: string; // YYYY-MM-DD
  ativo: boolean;
  autor?: string;
  created_at: string | null;
  updated_at: string | null;
};

const noticiaSchema = z.object({
  titulo: z.string().min(3, "Título é obrigatório (mínimo 3 caracteres)"),
  resumo: z.string().min(5, "Subtítulo/Resumo é obrigatório (mínimo 5 caracteres)"),
  url: z.string().url("URL inválida").optional().nullable().or(z.literal("")),
  conteudo: z.string().optional().nullable(),
  data_publicacao: z.string().min(1, "Data de publicação é obrigatória"),
  ativo: z.boolean().default(true),
  autor: z.string().optional(),
});

type NoticiaFormValues = z.infer<typeof noticiaSchema>;

const PAGE_SIZE = 10;

const Noticias = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [search, setSearch] = useState("");
  const [ativoFilter, setAtivoFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Noticia | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

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

  const queryKey = useMemo(() => ["noticias-admin", { search, ativoFilter, page }], [search, ativoFilter, page]);

  const { data, isLoading, isError } = useQuery({
    queryKey,
    enabled: isAuthChecked,
    queryFn: async () => {
      let q = supabase
        .from("noticias")
        .select("*", { count: "exact" })
        .order("data_publicacao", { ascending: false })
        .range((page - 1) * PAGE_SIZE, (page - 1) * PAGE_SIZE + (PAGE_SIZE - 1));

      if (search) q = q.ilike("titulo", `%${search}%`);
      if (ativoFilter !== undefined) {
        q = q.eq("ativo", ativoFilter === "true");
      }

      const { data, error, count } = await q;
      if (error) throw error;
      return { items: (data ?? []) as Noticia[], count: count ?? 0 };
    },
  });

  const totalPages = useMemo(() => {
    const count = data?.count ?? 0;
    return Math.max(1, Math.ceil(count / PAGE_SIZE));
  }, [data?.count]);

  const form = useForm<NoticiaFormValues>({
    resolver: zodResolver(noticiaSchema),
    defaultValues: {
      titulo: "",
      resumo: "",
      url: "",
      conteudo: "",
      data_publicacao: "",
      ativo: true,
      autor: "",
    },
  });

  const resetForm = () => {
    form.reset({
      titulo: "",
      resumo: "",
      url: "",
      conteudo: "",
      data_publicacao: "",
      ativo: true,
      autor: "",
    });
    setEditing(null);
    setSelectedImage(null);
  };

  const uploadImageAndGetUrl = async (file: File) => {
    // Obter extensão do arquivo
    const fileExt = file.name.split('.').pop();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    
    if (!fileExt || !allowedExtensions.includes(fileExt.toLowerCase())) {
      throw new Error('Formato de imagem inválido. Use: JPG, PNG, WEBP ou GIF');
    }

    // Criar nome único para o arquivo
    const fileName = `noticia-${Date.now()}-${(crypto?.randomUUID?.() || Math.random().toString(36).slice(2)).slice(0, 8)}.${fileExt}`;
    
    // Determinar content type
    const contentType = file.type || `image/${fileExt.toLowerCase()}`;
    
    // Fazer upload para o bucket 'noticias'
    const { error: uploadError } = await supabase.storage
      .from("noticias")
      .upload(fileName, file, { 
        contentType, 
        cacheControl: "3600", 
        upsert: false 
      });
    
    if (uploadError) throw uploadError;
    
    // Obter URL pública
    const { data: pub } = supabase.storage.from("noticias").getPublicUrl(fileName);
    return pub.publicUrl;
  };

  const createMutation = useMutation({
    mutationFn: async ({ values, imageFile }: { values: NoticiaFormValues; imageFile?: File }) => {
      let imagemUrl = null;
      
      // Fazer upload da imagem se houver
      if (imageFile) {
        imagemUrl = await uploadImageAndGetUrl(imageFile);
      }
      
      const insertPayload = {
        titulo: values.titulo,
        resumo: values.resumo,
        imagem_url: imagemUrl,
        url: values.url || null,
        conteudo: values.conteudo || null,
        data_publicacao: values.data_publicacao,
        ativo: values.ativo,
        autor: values.autor || null,
      };
      const { error } = await supabase.from("noticias").insert(insertPayload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Notícia criada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["noticias"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Erro ao criar notícia");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ values, imageFile }: { values: NoticiaFormValues; imageFile?: File }) => {
      if (!editing) return;
      
      let imagemUrl = editing.imagem_url;
      
      // Se houver nova imagem, fazer upload
      if (imageFile) {
        imagemUrl = await uploadImageAndGetUrl(imageFile);
      }
      
      const updatePayload = {
        titulo: values.titulo,
        resumo: values.resumo,
        imagem_url: imagemUrl,
        url: values.url || null,
        conteudo: values.conteudo || null,
        data_publicacao: values.data_publicacao,
        ativo: values.ativo,
        autor: values.autor || null,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("noticias").update(updatePayload).eq("id", editing.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Notícia atualizada");
      queryClient.invalidateQueries({ queryKey: ["noticias"] });
      queryClient.invalidateQueries({ queryKey: ["noticias-admin"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Erro ao atualizar notícia");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("noticias").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Notícia deletada");
      queryClient.invalidateQueries({ queryKey: ["noticias"] });
      queryClient.invalidateQueries({ queryKey: ["noticias-admin"] });
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Erro ao deletar notícia");
    },
  });

  const toggleAtivoMutation = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase.from("noticias").update({ ativo, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.ativo ? "Notícia ativada" : "Notícia inativada");
      queryClient.invalidateQueries({ queryKey: ["noticias"] });
      queryClient.invalidateQueries({ queryKey: ["noticias-admin"] });
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Erro ao alterar status da notícia");
    },
  });

  const onSubmit = async (values: NoticiaFormValues) => {
    if (editing) {
      await updateMutation.mutateAsync({ values, imageFile: selectedImage ?? undefined });
    } else {
      await createMutation.mutateAsync({ values, imageFile: selectedImage ?? undefined });
    }
  };

  const openCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEdit = (item: Noticia) => {
    setEditing(item);
    form.reset({
      titulo: item.titulo,
      resumo: item.resumo,
      url: item.url ?? "",
      conteudo: item.conteudo ?? "",
      data_publicacao: item.data_publicacao?.slice(0, 10) ?? "",
      ativo: item.ativo,
      autor: item.autor ?? "",
    });
    setSelectedImage(null);
    setIsDialogOpen(true);
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

  // Função para normalizar URL (adiciona protocolo se não tiver)
  const normalizeUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    
    // Remove espaços
    url = url.trim();
    
    // Se já começa com http:// ou https://, retorna como está
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Se começa com //, adiciona https:
    if (url.startsWith('//')) {
      return `https:${url}`;
    }
    
    // Caso contrário, adiciona https://
    return `https://${url}`;
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
          {/* Navegação entre abas */}
          <div className="flex gap-2 border-b border-border">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin/editais")}
              className={`rounded-b-none ${location.pathname === "/admin/editais" ? "border-b-2 border-primary" : ""}`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Editais
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/admin/noticias")}
              className={`rounded-b-none ${location.pathname === "/admin/noticias" ? "border-b-2 border-primary" : ""}`}
            >
              <Eye className="w-4 h-4 mr-2" />
              Notícias
            </Button>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-10">
        <Card className="glass rounded-3xl shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="font-heading text-2xl">Notícias</CardTitle>
            <Button onClick={openCreate} variant="default" className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Notícia
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-6">
              <div className="flex gap-3 w-full md:w-auto">
                <Input
                  placeholder="Buscar por título..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="glass-dark"
                />
                <Select
                  value={ativoFilter ?? "all"}
                  onValueChange={(v) => {
                    setAtivoFilter(v === "all" ? undefined : v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px] glass-dark">
                    <SelectValue placeholder="Filtrar status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Ativas</SelectItem>
                    <SelectItem value="false">Inativas</SelectItem>
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
                    <TableHead>Título</TableHead>
                    <TableHead>Publicação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Link</TableHead>
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
                        <div className="py-6 text-center text-destructive">Erro ao carregar as notícias</div>
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && (data?.items?.length ?? 0) === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <div className="py-6 text-center text-muted-foreground">Nenhuma notícia encontrada</div>
                      </TableCell>
                    </TableRow>
                  )}
                  {(data?.items ?? []).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium max-w-md truncate">{item.titulo}</TableCell>
                      <TableCell>{formatDate(item.data_publicacao)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.ativo ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <Eye className="w-3 h-3" />
                              Ativa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                              <EyeOff className="w-3 h-3" />
                              Inativa
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.url ? (
                            <a
                              href={normalizeUrl(item.url) || '#'}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              Externo
                              <ExternalLink className="w-3 h-3" />
                            </a>
                        ) : (
                          <a
                              href={`/noticia/${item.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              Ver Notícia
                              <Eye className="w-3 h-3" />
                            </a>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAtivoMutation.mutate({ id: item.id, ativo: !item.ativo })}
                            disabled={toggleAtivoMutation.isPending}
                          >
                            {item.ativo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {item.ativo ? "Inativar" : "Ativar"}
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
          <DialogContent className="glass rounded-3xl max-h-[90vh] overflow-y-auto w-full max-w-4xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Notícia" : "Nova Notícia"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Título *</label>
                    <Input {...form.register("titulo")} className="glass-dark" placeholder="Título da notícia" />
                    {form.formState.errors.titulo && (
                    <p className="text-destructive text-xs mt-1">{form.formState.errors.titulo.message}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Autor</label>
                    <Input {...form.register("autor")} className="glass-dark" placeholder="Nome do autor" />
                    {form.formState.errors.autor && (
                    <p className="text-destructive text-xs mt-1">{form.formState.errors.autor.message}</p>
                    )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Subtítulo / Resumo *</label>
                <Textarea
                  {...form.register("resumo")}
                  className="glass-dark"
                  rows={2}
                  placeholder="Subtítulo ou resumo breve"
                />
                {form.formState.errors.resumo && (
                  <p className="text-destructive text-xs mt-1">{form.formState.errors.resumo.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Data de publicação *</label>
                  <Input type="date" {...form.register("data_publicacao")} className="glass-dark" />
                  {form.formState.errors.data_publicacao && (
                    <p className="text-destructive text-xs mt-1">{form.formState.errors.data_publicacao.message}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="ativo"
                    checked={form.watch("ativo")}
                    onCheckedChange={(checked) => form.setValue("ativo", checked)}
                  />
                  <Label htmlFor="ativo" className="cursor-pointer">
                    Notícia ativa
                  </Label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Imagem de Destaque</label>
                <Input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={(e) => setSelectedImage(e.target.files?.[0] ?? null)}
                  className="glass-dark"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {selectedImage ? (
                    <>Arquivo selecionado: {selectedImage.name}</>
                  ) : editing && editing.imagem_url ? (
                    <>
                      Imagem atual:{" "}
                      <a
                        href={editing.imagem_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        ver imagem
                      </a>
                      <br />
                      <span className="text-muted-foreground">Selecione uma nova imagem para substituir</span>
                    </>
                  ) : (
                    <>Formatos aceitos: JPG, PNG, WEBP, GIF</>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL Externa (Opcional)</label>
                <Input {...form.register("url")} className="glass-dark" placeholder="Deixe em branco para usar o editor abaixo" />
                <p className="text-xs text-muted-foreground mt-1">Preencha apenas se for uma notícia de outro site.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Conteúdo Completo</label>
                <div className="bg-white text-black rounded-md overflow-hidden">
                    <Controller
                        name="conteudo"
                        control={form.control}
                        render={({ field }) => (
                            <ReactQuill 
                                theme="snow" 
                                value={field.value || ''} 
                                onChange={field.onChange}
                                modules={{
                                    toolbar: [
                                        [{ 'header': [1, 2, 3, false] }],
                                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                        [{'list': 'ordered'}, {'list': 'bullet'}],
                                        ['link', 'image'],
                                        ['clean']
                                    ],
                                }}
                                className="h-64 mb-12"
                            />
                        )}
                    />
                </div>
              </div>

              <DialogFooter className="flex gap-2 pt-4">
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
                      Criar notícia
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
            <div className="py-4">Tem certeza que deseja deletar esta notícia? Essa ação não pode ser desfeita.</div>
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

export default Noticias;
