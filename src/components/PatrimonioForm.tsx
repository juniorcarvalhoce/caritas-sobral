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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const patrimonioSchema = z.object({
  tipo: z.string().min(1, "O tipo é obrigatório"),
  nome: z.string().min(1, "O nome do bem é obrigatório"),
  numero_serie: z.string().optional(),
  numero_tombamento: z.string().min(1, "O número de tombamento é obrigatório"),
  estado: z.enum(["novo", "bom", "regular", "danificado", "inservivel"]),
  descricao: z.string().optional(),
  valor: z.coerce.number().min(0, "O valor não pode ser negativo"),
  foto_url: z.string().optional(),
  foto_file: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `O tamanho máximo da imagem é 5MB.`)
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Apenas os formatos .jpg, .jpeg, .png e .webp são aceitos."
    ),
});

export type PatrimonioFormValues = z.infer<typeof patrimonioSchema>;

interface PatrimonioFormProps {
  onSubmit: (data: Omit<PatrimonioFormValues, 'foto_file'>) => void;
  onCancel: () => void;
  defaultValues?: Partial<PatrimonioFormValues>;
  isSubmitting?: boolean;
}

const PatrimonioForm = ({ onSubmit, onCancel, defaultValues, isSubmitting }: PatrimonioFormProps) => {
  const form = useForm<PatrimonioFormValues>({
    resolver: zodResolver(patrimonioSchema),
    defaultValues: {
      tipo: "",
      nome: "",
      numero_serie: "",
      numero_tombamento: "",
      estado: "bom",
      descricao: "",
      valor: 0,
      ...defaultValues,
    },
  });

  const handleFormSubmit = async (data: PatrimonioFormValues) => {
    let fotoUrl = data.foto_url;

    if (data.foto_file) {
      const file = data.foto_file;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('patrimonio')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Erro ao fazer upload da imagem para o Supabase:", uploadError);
        toast.error(`Erro ao enviar a imagem: ${uploadError.message}. Tente novamente.`);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('patrimonio')
        .getPublicUrl(filePath);
      
      fotoUrl = urlData.publicUrl;
    }

    const { foto_file, ...rest } = data;
    onSubmit({ ...rest, foto_url: fotoUrl });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{defaultValues?.nome ? "Editar Bem" : "Cadastrar Novo Bem"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Bem</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Cadeira de escritório" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de bem" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Tecnologia / TI">Tecnologia / TI</SelectItem>
                        <SelectItem value="Móveis e Utensílios">Móveis e Utensílios</SelectItem>
                        <SelectItem value="Veículos">Veículos</SelectItem>
                        <SelectItem value="Máquinas e Equipamentos">Máquinas e Equipamentos</SelectItem>
                        <SelectItem value="Imóveis">Imóveis</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="numero_tombamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nº de Tombamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 001234" {...field} />
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
                    <FormLabel>Nº de Série</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: SN-56789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado do Bem</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="novo">Novo</SelectItem>
                        <SelectItem value="bom">Bom</SelectItem>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="danificado">Danificado</SelectItem>
                        <SelectItem value="inservivel">Inservível</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Bem (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="Ex: 150.00" {...field} />
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
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalhes sobre o bem, como cor, marca, modelo, etc."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="foto_file"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Foto do Bem</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      accept="image/png, image/jpeg, image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(file);
                      }}
                      {...rest}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PatrimonioForm;
