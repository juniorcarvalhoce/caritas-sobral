import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { comprimirImagem } from "@/lib/imagem";
import { CHAVES_SOBRE, sobrePadrao } from "@/data/sobre";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AlertTriangle, ExternalLink, ImagePlus, Loader2, RotateCcw, Save } from "lucide-react";

type Linha = { chave: string; valor: string | null };
type Campo = "historia" | "missao" | "visao";

const tabelaInexistente = (mensagem?: string) => /conteudo_site|does not exist|schema cache|PGRST205|42P01/i.test(mensagem ?? "");

const CAMPOS: { campo: Campo; titulo: string; ajuda: string; linhas: number }[] = [
  {
    campo: "historia",
    titulo: "Nossa história",
    ajuda: "Separe os parágrafos com uma linha em branco.",
    linhas: 9,
  },
  { campo: "missao", titulo: "Nossa missão", ajuda: "Aparece em destaque, como citação.", linhas: 4 },
  { campo: "visao", titulo: "Nossa visão", ajuda: "O texto atual é provisório: substitua pela visão oficial.", linhas: 4 },
];

const SobreAdmin = () => {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [textos, setTextos] = useState<Record<Campo, string>>({ historia: "", missao: "", visao: "" });
  const [fotoNova, setFotoNova] = useState<File | null>(null);
  const [previa, setPrevia] = useState<string | null>(null);
  const [removerFoto, setRemoverFoto] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["conteudo-sobre-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conteudo_site")
        .select("chave, valor")
        .in("chave", Object.values(CHAVES_SOBRE));
      const valores = Object.fromEntries(((data ?? []) as Linha[]).map((l) => [l.chave, l.valor ?? ""]));
      return { valores, erro: error?.message };
    },
  });

  const semTabela = tabelaInexistente(data?.erro);
  const salvos = data?.valores ?? {};
  const fotoSalva = salvos[CHAVES_SOBRE.foto] || null;

  // Preenche os campos com o que está salvo; vazio significa "usar o texto padrão"
  useEffect(() => {
    if (!data) return;
    setTextos({
      historia: salvos[CHAVES_SOBRE.historia] ?? "",
      missao: salvos[CHAVES_SOBRE.missao] ?? "",
      visao: salvos[CHAVES_SOBRE.visao] ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => () => {
    if (previa) URL.revokeObjectURL(previa);
  }, [previa]);

  const alterado =
    Boolean(fotoNova) ||
    removerFoto ||
    CAMPOS.some(({ campo }) => textos[campo].trim() !== (salvos[CHAVES_SOBRE[campo]] ?? "").trim());

  const salvar = useMutation({
    mutationFn: async () => {
      let fotoUrl: string | null = removerFoto ? null : fotoSalva;
      if (fotoNova) {
        const caminho = `site/sobre-${crypto.randomUUID()}.${fotoNova.name.split(".").pop()}`;
        const { error } = await supabase.storage
          .from("noticias")
          .upload(caminho, fotoNova, { contentType: fotoNova.type, cacheControl: "31536000" });
        if (error) throw new Error(`Erro ao enviar a foto: ${error.message}`);
        fotoUrl = supabase.storage.from("noticias").getPublicUrl(caminho).data.publicUrl;
      }
      const agora = new Date().toISOString();
      const { error } = await supabase.from("conteudo_site").upsert([
        { chave: CHAVES_SOBRE.historia, valor: textos.historia.trim() || null, updated_at: agora },
        { chave: CHAVES_SOBRE.missao, valor: textos.missao.trim() || null, updated_at: agora },
        { chave: CHAVES_SOBRE.visao, valor: textos.visao.trim() || null, updated_at: agora },
        { chave: CHAVES_SOBRE.foto, valor: fotoUrl, updated_at: agora },
      ]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setFotoNova(null);
      setPrevia(null);
      setRemoverFoto(false);
      queryClient.invalidateQueries({ queryKey: ["conteudo-sobre-admin"] });
      queryClient.invalidateQueries({ queryKey: ["conteudo-sobre"] });
      toast.success("Seção Sobre atualizada!");
    },
    onError: (erro: Error) => {
      toast.error(
        tabelaInexistente(erro.message)
          ? "A tabela de conteúdo ainda não existe. Execute o script supabase_conteudo_site.sql no Supabase."
          : erro.message
      );
    },
  });

  const escolherFoto = async (arquivo?: File) => {
    if (!arquivo) return;
    try {
      const comprimida = await comprimirImagem(arquivo, { ladoMaximo: 1800 });
      setFotoNova(comprimida);
      setPrevia(URL.createObjectURL(comprimida));
      setRemoverFoto(false);
    } catch (erro) {
      toast.error((erro as Error).message);
    }
  };

  const fotoExibida = previa ?? (removerFoto ? sobrePadrao.foto : fotoSalva ?? sobrePadrao.foto);
  const fotoProvisoria = !previa && (removerFoto || !fotoSalva);

  return (
    <>
      <AdminPageHeader
        titulo="Sobre a Cáritas"
        descricao="Textos e foto da seção “Sobre a Cáritas Diocesana” da página inicial. Campos em branco usam o texto padrão."
        acoes={
          <>
            <Button variant="outline" asChild>
              <a href="/#sobre" target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4" />
                Ver no site
              </a>
            </Button>
            <Button onClick={() => salvar.mutate()} disabled={semTabela || !alterado || salvar.isPending}>
              {salvar.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar alterações
            </Button>
          </>
        }
      />

      {semTabela && (
        <div className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 mb-6 text-sm text-amber-900">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Falta um passo no Supabase</p>
            <p>
              Para salvar, execute uma vez o script <code className="font-mono">supabase_conteudo_site.sql</code> no SQL Editor
              do Supabase. Enquanto isso, o site continua mostrando os textos e a foto padrão.
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <div className="grid lg:grid-cols-[360px_1fr] gap-6 items-start">
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="relative aspect-[4/3] bg-muted">
              {fotoExibida && <img src={fotoExibida} alt="" className="w-full h-full object-cover" />}
              {fotoProvisoria && (
                <span className="absolute top-2 left-2 text-[11px] font-medium rounded-full bg-black/60 text-white px-2 py-0.5">
                  Foto provisória (de uma notícia)
                </span>
              )}
              {fotoNova && (
                <span className="absolute top-2 left-2 text-[11px] font-medium rounded-full bg-amber-500 text-white px-2 py-0.5">
                  Nova foto — clique em Salvar
                </span>
              )}
            </div>
            <div className="p-4 space-y-2">
              <p className="font-semibold">Foto da seção</p>
              <p className="text-xs text-muted-foreground">Use uma foto horizontal da equipe, da sede ou de uma ação nas comunidades.</p>
              <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={(e) => escolherFoto(e.target.files?.[0])} />
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={semTabela}>
                  <ImagePlus className="w-4 h-4" />
                  Trocar foto
                </Button>
                {(fotoSalva || fotoNova) && !removerFoto && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    disabled={semTabela}
                    onClick={() => {
                      setFotoNova(null);
                      setPrevia(null);
                      setRemoverFoto(true);
                    }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Usar a padrão
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {CAMPOS.map(({ campo, titulo, ajuda, linhas }) => (
              <div key={campo} className="bg-card rounded-xl border p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor={`campo-${campo}`} className="font-semibold">
                    {titulo}
                  </label>
                  {textos[campo].trim() && (
                    <button
                      type="button"
                      onClick={() => setTextos((t) => ({ ...t, [campo]: "" }))}
                      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                      disabled={semTabela}
                    >
                      <RotateCcw className="w-3 h-3" /> Voltar ao padrão
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{ajuda}</p>
                <Textarea
                  id={`campo-${campo}`}
                  value={textos[campo]}
                  onChange={(e) => setTextos((t) => ({ ...t, [campo]: e.target.value }))}
                  placeholder={sobrePadrao[campo]}
                  rows={linhas}
                  className="text-sm"
                  disabled={semTabela}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default SobreAdmin;
