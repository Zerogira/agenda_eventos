import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { brinquedoSchema, Brinquedo } from "../types";
import { useCreateBrinquedo, useUpdateBrinquedo, useDeleteBrinquedo } from "../api/use-brinquedos";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface BrinquedoFormProps {
  onSuccess: () => void;
  initialData?: Brinquedo;
}

export function BrinquedoForm({ onSuccess, initialData }: BrinquedoFormProps) {
  const { mutate: createBrinquedo, isPending: isCreating } = useCreateBrinquedo();
  const { mutate: updateBrinquedo, isPending: isUpdating } = useUpdateBrinquedo();
  const { mutate: deleteBrinquedo, isPending: isDeleting } = useDeleteBrinquedo();

  const isSubmitting = isCreating || isUpdating || isDeleting;

  const form = useForm<Brinquedo>({
    resolver: zodResolver(brinquedoSchema) as any,
    defaultValues: initialData || {
      nome: "",
      descricao: "",
      marca: "",
      quantidade_total: 1,
      necessita_funcionario: false,
      ativo: true,
    },
  });

  async function onSubmit(values: Brinquedo) {
    if (initialData?.id) {
        updateBrinquedo({ id: initialData.id, data: values }, {
            onSuccess: () => {
                toast.success("Brinquedo atualizado com sucesso!");
                onSuccess();
            },
            onError: () => {
                toast.error("Erro ao atualizar brinquedo");
            }
        });
    } else {
        createBrinquedo(values, {
            onSuccess: () => {
                toast.success("Brinquedo criado com sucesso!");
                onSuccess();
            },
            onError: () => {
                toast.error("Erro ao criar brinquedo");
            }
        });
    }
  }

  const handleDelete = async () => {
    if (initialData?.id) {
        if(window.confirm("Tem certeza que deseja excluir este brinquedo?")) {
            deleteBrinquedo(initialData.id, {
                onSuccess: () => {
                    toast.success("Brinquedo excluído com sucesso!");
                    onSuccess();
                },
                onError: () => {
                    toast.error("Erro ao excluir brinquedo");
                }
            });
        }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do brinquedo" {...field} />
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
                <Textarea placeholder="Descrição detalhada" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="marca"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                    <Input placeholder="Marca do brinquedo" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="quantidade_total"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Quantidade Total</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="1" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="necessita_funcionario"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Necessita Monitor?
                </FormLabel>
                <FormDescription>
                  Marque se este brinquedo exige acompanhamento de um funcionário.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ativo"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Ativo
                </FormLabel>
                <FormDescription>
                  Disponível para novos agendamentos
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4 gap-2">
          {initialData?.id && (
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : (initialData?.id ? "Salvar Alterações" : "Salvar")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
