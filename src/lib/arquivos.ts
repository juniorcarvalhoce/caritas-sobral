// Identifica o tipo de um arquivo pela extensão, para mostrar uma etiqueta colorida (PDF, DOC, XLS...)
type TipoArquivo = { rotulo: string; classe: string };

const TIPOS: Record<string, TipoArquivo> = {
  pdf: { rotulo: "PDF", classe: "bg-red-50 text-red-700 ring-red-600/20" },
  doc: { rotulo: "DOC", classe: "bg-blue-50 text-blue-700 ring-blue-600/20" },
  docx: { rotulo: "DOC", classe: "bg-blue-50 text-blue-700 ring-blue-600/20" },
  odt: { rotulo: "ODT", classe: "bg-blue-50 text-blue-700 ring-blue-600/20" },
  xls: { rotulo: "XLS", classe: "bg-green-50 text-green-700 ring-green-600/20" },
  xlsx: { rotulo: "XLS", classe: "bg-green-50 text-green-700 ring-green-600/20" },
  ods: { rotulo: "ODS", classe: "bg-green-50 text-green-700 ring-green-600/20" },
  csv: { rotulo: "CSV", classe: "bg-green-50 text-green-700 ring-green-600/20" },
  ppt: { rotulo: "PPT", classe: "bg-orange-50 text-orange-700 ring-orange-600/20" },
  pptx: { rotulo: "PPT", classe: "bg-orange-50 text-orange-700 ring-orange-600/20" },
  jpg: { rotulo: "IMG", classe: "bg-purple-50 text-purple-700 ring-purple-600/20" },
  jpeg: { rotulo: "IMG", classe: "bg-purple-50 text-purple-700 ring-purple-600/20" },
  png: { rotulo: "IMG", classe: "bg-purple-50 text-purple-700 ring-purple-600/20" },
  webp: { rotulo: "IMG", classe: "bg-purple-50 text-purple-700 ring-purple-600/20" },
  zip: { rotulo: "ZIP", classe: "bg-gray-100 text-gray-700 ring-gray-500/20" },
  rar: { rotulo: "RAR", classe: "bg-gray-100 text-gray-700 ring-gray-500/20" },
};

export const extensaoDoArquivo = (nomeOuUrl?: string | null) =>
  (nomeOuUrl ?? "").split("?")[0].split("#")[0].split(".").pop()?.toLowerCase() ?? "";

export const tipoDoArquivo = (nomeOuUrl?: string | null): TipoArquivo =>
  TIPOS[extensaoDoArquivo(nomeOuUrl)] ?? { rotulo: "ARQ", classe: "bg-gray-100 text-gray-700 ring-gray-500/20" };

// Arquivos que o navegador abre direto numa aba (os demais só baixam)
export const abreNoNavegador = (nomeOuUrl?: string | null) =>
  ["pdf", "jpg", "jpeg", "png", "webp"].includes(extensaoDoArquivo(nomeOuUrl));
