import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { comprimirImagem } from "@/lib/imagem";
import { areasPadrao, type AreaAtuacao } from "@/data/areas";
import { projetos, temas } from "@/data/projetos";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AlertTriangle, ImagePlus, Loader2, RotateCcw, Save } from "lucide-react";

type Linha = { slug: string; descricao: string | null; foto_url: string | null };

const tabelaInexistente = (mensagem?: string) => /areas_atuacao|does not exist|schema cache|PGRST205|42P01/i.test(mensagem ?? "");

const CartaoArea = ({ area, salva, semTabela }: { area: AreaAtuacao; salva?: Linha; semTabela: boolean }) => {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [descricao, setDescricao] = useState(salva?.descricao ?? "");
  const [fotoNova, setFotoNova] = useState<File | null>(null);
  const [previa, setPrevia] = useState<string | null>(null);
  const cor = temas[area.tema].cor;
  const fotoAtual = previa ?? salva?.foto_url ?? area.foto;
  const usandoPadrao = !salva?.foto_url && !fotoNova;

  useEffect(() => setDescricao(salva?.descricao ?? ""), [salva?.descricao]);
  useEffect(() => () => {
    if (previa) URL.revokeObjectURL(previa);
  }, [previa]);

  const salvar = useMutation({
    mutationFn: async ({ restaurar }: { restaurar?: boolean } = {}) => {
      let fotoUrl = restaurar ? null : salva?.foto_url ?? null;
      if (fotoNova && !restaurar) {
        const caminho = `areas/${area.slug}-${crypto.randomUUID()}.${fotoNova.name.split(".").pop()}`;
        const { error } = await supabase.storage
          .from("noticias")
          .upload(caminho, fotoNova, { contentType: fotoNova.type, cacheControl: "31536000" });
        if (error) throw new Error(`Erro ao enviar a foto: ${error.message}`);
        fotoUrl = supabase.storage.from("noticias").getPublicUrl(caminho).data.publicUrl;
      }
      const { error } = await supabase.from("areas_atuacao").upsert({
        slug: area.slug,
        descricao: restaurar ? null : descricao.trim() || null,
        foto_url: fotoUrl,
        updated_at: new Date().toISOString(),
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: (_d, vars) => {
      setFotoNova(null);
      setPrevia(null);
      if (vars?.restaurar) setDescricao("");
      queryClient.invalidateQueries({ queryKey: ["areas-atuacao-admin"] });
      queryClient.invalidateQueries({ queryKey: ["areas-atuacao"] });
      toast.success(vars?.restaurar ? `${area.tema}: padrão restaurado` : `${area.tema}: alterações salvas`);
    },
    onError: (erro: Error) => {
      toast.error(
        tabelaInexistente(erro.message)
          ? "A tabela de áreas ainda não existe. Execute o script supabase_areas_atuacao.sql no Supabase."
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
    } catch (erro) {
      toast.error((erro as Error).message);
    }
  };

  const alterado = Boolean(fotoNova) || descricao.trim() !== (salva?.descricao ?? "").trim();
  const qtdProjetos = projetos.filter((p) => p.tema === area.tema).length;

  return (
    <div className="bg-card rounded-xl border overflow-hidden flex flex-col">
      <div className="relative aspect-[16/9] bg-muted group">
        {fotoAtual && <img src={fotoAtual} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: cor }} />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => escolherFoto(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={semTabela}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/0 hover:bg-black/45 text-white opacity-0 hover:opacity-100 focus-visible:opacity-100 focus-visible:bg-black/45 transition disabled:cursor-not-allowed"
        >
          <ImagePlus className="w-7 h-7" />
          <span className="text-sm font-medium">Trocar foto</span>
        </button>
        {usandoPadrao && (
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

      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: cor }}>
            <area.icone className="w-4 h-4" />
          </span>
          <div>
            <p className="font-semibold leading-tight">{area.tema}</p>
            <p className="text-xs text-muted-foreground">{qtdProjetos} projetos</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`desc-${area.slug}`} className="text-xs font-medium text-muted-foreground">
            Texto da área (deixe em branco para usar o padrão)
          </label>
          <Textarea
            id={`desc-${area.slug}`}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder={areasPadrao.find((a) => a.slug === area.slug)?.descricao}
            rows={4}
            className="resize-none text-sm"
            disabled={semTabela}
          />
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            disabled={semTabela || salvar.isPending || (!salva?.foto_url && !salva?.descricao && !alterado)}
            onClick={() => salvar.mutate({ restaurar: true })}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar padrão
          </Button>
          <Button type="button" size="sm" disabled={semTabela || !alterado || salvar.isPending} onClick={() => salvar.mutate({})}>
            {salvar.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
};

const AreasAtuacaoAdmin = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["areas-atuacao-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("areas_atuacao").select("slug, descricao, foto_url");
      return { linhas: (data ?? []) as Linha[], erro: error?.message };
    },
  });

  const semTabela = tabelaInexistente(data?.erro);

  return (
    <>
      <AdminPageHeader
        titulo="Áreas de atuação"
        descricao="Troque a foto e o texto de cada área exibida na seção “Nossas Áreas de Atuação” da página inicial."
      />

      {semTabela && (
        <div className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 mb-6 text-sm text-amber-900">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Falta um passo no Supabase</p>
            <p>
              Para salvar fotos e textos, execute uma vez o script <code className="font-mono">supabase_areas_atuacao.sql</code> no
              SQL Editor do Supabase. Enquanto isso, o site continua mostrando as fotos e os textos padrão.
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {areasPadrao.map((area) => (
            <CartaoArea
              key={area.slug}
              area={area}
              salva={data?.linhas.find((l) => l.slug === area.slug)}
              semTabela={semTabela}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-6">
        Dica: use fotos horizontais e com boa resolução. Elas são reduzidas automaticamente antes do envio.
      </p>
    </>
  );
};

export default AreasAtuacaoAdmin;
