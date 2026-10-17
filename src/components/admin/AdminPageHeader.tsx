import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
};

// Cabeçalho padrão das telas do painel administrativo
const AdminPageHeader = ({ titulo, descricao, acoes }: AdminPageHeaderProps) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
    <div>
      <h1 className="font-heading text-2xl md:text-3xl font-bold">{titulo}</h1>
      {descricao && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{descricao}</p>}
    </div>
    {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
  </div>
);

export default AdminPageHeader;
