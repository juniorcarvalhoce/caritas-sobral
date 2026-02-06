import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer, ArrowLeft } from "lucide-react";
import { BemPatrimonial } from "./Patrimonio";
import { useNavigate } from "react-router-dom";

const fetchBensParaRelatorio = async (filters: any) => {
    let query = supabase.from("bens_patrimoniais").select("*");

    if (filters.tipo) {
        query = query.ilike("tipo", `%${filters.tipo}%`);
    }
    if (filters.estado) {
        query = query.eq("estado", filters.estado);
    }
    if (filters.localizacao_atual) {
        query = query.ilike("localizacao_atual", `%${filters.localizacao_atual}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
};

const PatrimonioRelatorio = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        tipo: "",
        estado: "",
        localizacao_atual: "",
    });

    const { data: bens, isLoading, refetch } = useQuery<BemPatrimonial[]>({
        queryKey: ["relatorio_bens", filters],
        queryFn: () => fetchBensParaRelatorio(filters),
        enabled: false, // Só executa a query ao clicar no botão
    });

    const handleFilterChange = (name: string, value: string) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerateReport = () => {
        refetch();
    };

    const handlePrint = () => {
        window.print();
    }

    const estadoOptions = [
        { value: "novo", label: "Novo" },
        { value: "bom", label: "Bom" },
        { value: "regular", label: "Regular" },
        { value: "danificado", label: "Danificado" },
        { value: "inservivel", label: "Inservível" },
    ];

    const tipoOptions = [
        { value: "Tecnologia / TI", label: "Tecnologia / TI" },
        { value: "Móveis e Utensílios", label: "Móveis e Utensílios" },
        { value: "Veículos", label: "Veículos" },
        { value: "Máquinas e Equipamentos", label: "Máquinas e Equipamentos" },
        { value: "Imóveis", label: "Imóveis" },
        { value: "Outros", label: "Outros" },
    ];

    return (
        <div>
            <style type="text/css" media="print">
            {`
                @page { size: auto; margin: 0.5in; }
                body { -webkit-print-color-adjust: exact; }
                .no-print { display: none; }
            `}
            </style>

            <div className="no-print flex justify-between items-center mb-6">
                <Button variant="outline" onClick={() => navigate("/admin/patrimonio")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>
                <h1 className="text-3xl font-bold font-heading">Relatório de Bens Patrimoniais</h1>
                <Button onClick={handlePrint} disabled={!bens || bens.length === 0}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir
                </Button>
            </div>

            <Card className="no-print">
                <CardHeader>
                    <CardTitle>Filtros do Relatório</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Select onValueChange={(value) => handleFilterChange("tipo", value)} value={filters.tipo}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filtrar por tipo..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Todos os tipos</SelectItem>
                            {tipoOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select onValueChange={(value) => handleFilterChange("estado", value)} value={filters.estado}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filtrar por estado..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Todos os estados</SelectItem>
                            {estadoOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input 
                        placeholder="Filtrar por setor..."
                        value={filters.localizacao_atual}
                        onChange={(e) => handleFilterChange("localizacao_atual", e.target.value)}
                    />
                    <Button onClick={handleGenerateReport} disabled={isLoading}>
                        {isLoading ? "Gerando..." : "Gerar Relatório"}
                    </Button>
                </CardContent>
            </Card>

            {bens && (
                <div className="mt-6">
                    <h2 className="text-2xl font-bold mb-4 font-heading">Resultados</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Nº Tombamento</TableHead>
                                <TableHead>Localização</TableHead>
                                <TableHead>Responsável</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bens.map((bem) => (
                                <TableRow key={bem.id}>
                                    <TableCell>{bem.nome}</TableCell>
                                    <TableCell>{bem.numero_tombamento}</TableCell>
                                    <TableCell>{bem.localizacao_atual || "N/A"}</TableCell>
                                    <TableCell>{bem.responsavel_atual || "N/A"}</TableCell>
                                    <TableCell>{bem.estado}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
};

export default PatrimonioRelatorio;
