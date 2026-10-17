import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { comprimirImagem } from "@/lib/imagem";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Building, Camera, ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";

// Campos opcionais vêm do banco como null; por isso aceitam null além de vazio
const textoOpcional = z.string().nullable().optional();

const patrimonioSchema = z.object({
  tipo: z.string().min(1, "Selecione o tipo do bem"),
  nome: z.string().trim().min(1, "Informe o nome do bem"),
  numero_serie: textoOpcional,
  numero_tombamento: z.string().trim().min(1, "Informe o número de tombamento"),
  estado: z.enum(["novo", "bom", "regular", "danificado", "inservivel"]),
  descricao: textoOpcional,
  valor: z.coerce.number().min(0, "O valor não pode ser negativo"),
  foto_url: textoOpcional,
});

export type PatrimonioFormValues = z.infer<typeof patrimonioSchema>;

interface PatrimonioFormProps {
  onSubmit: (data: PatrimonioFormValues) => void;
  onCancel: () => void;
  defaultValues?: Partial<PatrimonioFormValues>;
  isSubmitting?: boolean;
}

export const TIPOS_DE_BEM = [
  "Tecnologia / TI",
  "Móveis e Utensílios",
  "Veículos",
  "Máquinas e Equipamentos",
  "Imóveis",
  "Outros",
];

export const ESTADOS: { valor: PatrimonioFormValues["estado"]; rotulo: string; classe: string }[] = [
  { valor: "novo", rotulo: "Novo", classe: "data-[ativo=true]:bg-emerald-600 data-[ativo=true]:border-emerald-600" },
  { valor: "bom", rotulo: "Bom", classe: "data-[ativo=true]:bg-green-600 data-[ativo=true]:border-green-600" },
  { valor: "regular", rotulo: "Regular", classe: "data-[ativo=true]:bg-amber-500 data-[ativo=true]:border-amber-500" },
  { valor: "danificado", rotulo: "Danificado", classe: "data-[ativo=true]:bg-orange-600 data-[ativo=true]:border-orange-600" },
  { valor: "inservivel", rotulo: "Inservível", classe: "data-[ativo=true]:bg-red-600 data-[ativo=true]:border-red-600" },
];

const formatarReais = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor || 0);

const Secao = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
  <fieldset className="space-y-4">
    <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{titulo}</legend>
    {children}
  </fieldset>
);

const PatrimonioForm = ({ onSubmit, onCancel, defaultValues, isSubmitting }: PatrimonioFormProps) => {
  const editando = Boolean(defaultValues?.nome);
  const inputFotoRef = useRef<HTMLInputElement>(null);
  const [fotoNova, setFotoNova] = useState<File | null>(null);
  const [previa, setPrevia] = useState<string | null>(defaultValues?.foto_url ?? null);
  const [arrastando, setArrastando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  const form = useForm<PatrimonioFormValues>({
    resolver: zodResolver(patrimonioSchema),
    defaultValues: {
      tipo: defaultValues?.tipo ?? "",
      nome: defaultValues?.nome ?? "",
      numero_serie: defaultValues?.numero_serie ?? "",
      numero_tombamento: defaultValues?.numero_tombamento ?? "",
      estado: defaultValues?.estado ?? "bom",
      descricao: defaultValues?.descricao ?? "",
      valor: Number(defaultValues?.valor ?? 0),
      foto_url: defaultValues?.foto_url ?? null,
    },
  });

  // Libera a memória da prévia local
  useEffect(() => {
    return () => {
      if (previa?.startsWith("blob:")) URL.revokeObjectURL(previa);
    };
  }, [previa]);

  const escolherFoto = async (arquivo: File | undefined) => {
    if (!arquivo) return;
    if (!arquivo.type.startsWith("image/")) {
      toast.error("Escolha um arquivo de imagem.");
      return;
    }
    try {
      const comprimida = await comprimirImagem(arquivo);
      setFotoNova(comprimida);
      setPrevia(URL.createObjectURL(comprimida));
    } catch (erro) {
      toast.error((erro as Error).message);
    }
  };

  const removerFoto = () => {
    setFotoNova(null);
    setPrevia(null);
    form.setValue("foto_url", null);
    if (inputFotoRef.current) inputFotoRef.current.value = "";
  };

  const handleFormSubmit = async (data: PatrimonioFormValues) => {
    let fotoUrl = data.foto_url ?? null;

    if (fotoNova) {
      setEnviandoFoto(true);
      const caminho = `bens/${crypto.randomUUID()}.${fotoNova.name.split(".").pop()}`;
      const { error } = await supabase.storage
        .from("patrimonio")
        .upload(caminho, fotoNova, { contentType: fotoNova.type, cacheControl: "31536000" });
      setEnviandoFoto(false);

      if (error) {
        console.error("Erro ao enviar a foto do bem:", error);
        const semPermissao = /row-level security|not authorized|unauthorized|403/i.test(error.message);
        toast.error(
          semPermissao
            ? "Sem permissão para enviar fotos. Peça para executar o script supabase_patrimonio_bucket.sql no Supabase."
            : `Erro ao enviar a foto: ${error.message}`
        );
        return;
      }
      fotoUrl = supabase.storage.from("patrimonio").getPublicUrl(caminho).data.publicUrl;
    }

    onSubmit({
      ...data,
      numero_serie: data.numero_serie?.trim() || null,
      descricao: data.descricao?.trim() || null,
      foto_url: fotoUrl,
    });
  };

  const ocupado = isSubmitting || enviandoFoto;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col min-h-0 flex-1">
        {/* Cabeçalho */}
        <div className="flex items-center gap-4 px-6 py-5 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle className="font-heading text-xl">{editando ? "Editar bem" : "Cadastrar novo bem"}</DialogTitle>
            <DialogDescription>
              {editando ? "Atualize as informações do bem patrimonial." : "Preencha os dados e adicione uma foto do bem."}
            </DialogDescription>
          </div>
        </div>

        {/* Conteúdo com rolagem */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="grid md:grid-cols-[240px_1fr] gap-8">
            {/* Foto */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Foto do bem</p>
              <input
                ref={inputFotoRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                id="foto-bem"
                onChange={(e) => escolherFoto(e.target.files?.[0])}
              />
              {previa ? (
                <div className="space-y-2">
                  <div className="aspect-square rounded-2xl overflow-hidden border bg-muted">
                    <img src={previa} alt="Prévia da foto do bem" className="w-full h-full object-cover" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => inputFotoRef.current?.click()}>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Trocar
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={removerFoto}>
                      <Trash2 className="w-3.5 h-3.5" />
                      Remover
                    </Button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="foto-bem"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setArrastando(true);
                  }}
                  onDragLeave={() => setArrastando(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setArrastando(false);
                    escolherFoto(e.dataTransfer.files?.[0]);
                  }}
                  className={cn(
                    "aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-center p-4 cursor-pointer transition-colors",
                    arrastando ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-muted/50"
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <ImagePlus className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium">Adicionar foto</span>
                  <span className="text-xs text-muted-foreground">Clique ou arraste a imagem aqui</span>
                  <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1 md:hidden">
                    <Camera className="w-3 h-3" /> No celular, abre a câmera
                  </span>
                </label>
              )}
              <p className="text-[11px] text-muted-foreground">
                A foto é reduzida automaticamente antes do envio.
              </p>
            </div>

            {/* Campos */}
            <div className="space-y-8">
              <Secao titulo="Identificação">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do bem</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex.: Notebook Dell Inspiron 15" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-1">
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIPOS_DE_BEM.map((tipo) => (
                              <SelectItem key={tipo} value={tipo}>
                                {tipo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="numero_tombamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nº de tombamento</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex.: 001234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="numero_serie"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nº de série <span className="text-muted-foreground font-normal">(opcional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Ex.: SN-56789" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Secao>

              <Secao titulo="Situação">
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado de conservação</FormLabel>
                      <div role="radiogroup" className="flex flex-wrap gap-2">
                        {ESTADOS.map((estado) => (
                          <button
                            key={estado.valor}
                            type="button"
                            role="radio"
                            aria-checked={field.value === estado.valor}
                            data-ativo={field.value === estado.valor}
                            onClick={() => field.onChange(estado.valor)}
                            className={cn(
                              "px-4 py-2 rounded-full border text-sm font-medium transition-colors",
                              "hover:border-foreground/40 data-[ativo=true]:text-white",
                              estado.classe
                            )}
                          >
                            {estado.rotulo}
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Secao>

              <Secao titulo="Valor e descrição">
                <FormField
                  control={form.control}
                  name="valor"
                  render={({ field }) => (
                    <FormItem className="sm:max-w-xs">
                      <FormLabel>Valor do bem</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          value={formatarReais(Number(field.value))}
                          onChange={(e) => {
                            const centavos = Number(e.target.value.replace(/\D/g, "") || "0");
                            field.onChange(centavos / 100);
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Descrição <span className="text-muted-foreground font-normal">(opcional)</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Cor, marca, modelo, acessórios, observações..."
                          className="resize-none"
                          rows={3}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Secao>
            </div>
          </div>
        </div>

        {/* Rodapé fixo */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-muted/30">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={ocupado}>
            Cancelar
          </Button>
          <Button type="submit" disabled={ocupado} className="min-w-[140px]">
            {ocupado && <Loader2 className="w-4 h-4 animate-spin" />}
            {enviandoFoto ? "Enviando foto..." : isSubmitting ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar bem"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PatrimonioForm;
