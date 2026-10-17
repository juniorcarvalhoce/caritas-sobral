// Reduz e comprime uma foto no navegador antes do envio.
// Fotos de celular costumam ter 3–10 MB; depois disso ficam com algumas centenas de KB.
export const comprimirImagem = async (
  arquivo: File,
  { ladoMaximo = 1600, qualidade = 0.82 }: { ladoMaximo?: number; qualidade?: number } = {}
): Promise<File> => {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(arquivo);
  } catch {
    throw new Error(
      "Não foi possível ler esta imagem. Use uma foto em JPG, PNG ou WebP (no iPhone, envie pela câmera ou pela galeria do navegador)."
    );
  }

  const escala = Math.min(1, ladoMaximo / Math.max(bitmap.width, bitmap.height));
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Seu navegador não conseguiu processar a imagem.");
  ctx.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", qualidade));
  // Navegadores antigos sem WebP caem para JPEG
  const final = blob ?? (await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", qualidade)));
  if (!final) throw new Error("Não foi possível comprimir a imagem.");

  const extensao = final.type === "image/webp" ? "webp" : "jpg";
  const nomeBase = arquivo.name.replace(/\.[^.]+$/, "") || "foto";
  return new File([final], `${nomeBase}.${extensao}`, { type: final.type });
};
