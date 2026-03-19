import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputMask from "react-input-mask";
import { clienteSchema, Cliente } from "../types";
import { useCreateCliente, useUpdateCliente, useDeleteCliente } from "../api/use-clientes";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface ClienteFormProps {
  onSuccess: () => void;
  initialData?: Cliente;
}

export function ClienteForm({ onSuccess, initialData }: ClienteFormProps) {
  const { mutate: createCliente, isPending: isCreating } = useCreateCliente();
  const { mutate: updateCliente, isPending: isUpdating } = useUpdateCliente();
  const { mutate: deleteCliente, isPending: isDeleting } = useDeleteCliente();

  const isSubmitting = isCreating || isUpdating || isDeleting;

  const form = useForm<Cliente>({
    resolver: zodResolver(clienteSchema),
    defaultValues: initialData || {
      nome: "",
      telefone: "",
      cidade: "",
      empresaId: undefined
    },
  });

  async function onSubmit(values: Cliente) {
    const userStr = localStorage.getItem('user');
    let empresaId = "";
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            empresaId = user.empresaId;
        } catch (e) {
            console.error("Error parsing user from local storage", e);
        }
    }

    const payload = { ...values, empresaId };

    if (initialData?.id) {
        updateCliente({ id: initialData.id, data: payload }, {
            onSuccess: () => {
                toast.success("Cliente atualizado com sucesso!");
                onSuccess();
            },
            onError: () => {
                toast.error("Erro ao atualizar cliente");
            }
        });
    } else {
        createCliente(payload, {
            onSuccess: () => {
                toast.success("Cliente criado com sucesso!");
                onSuccess();
            },
            onError: () => {
                toast.error("Erro ao criar cliente");
            }
        });
    }
  }

  const handleDelete = async () => {
    if (initialData?.id) {
        if(window.confirm("Tem certeza que deseja excluir este cliente?")) {
            deleteCliente(initialData.id, {
                onSuccess: () => {
                    toast.success("Cliente excluído com sucesso!");
                    onSuccess();
                },
                onError: () => {
                    toast.error("Erro ao excluir cliente");
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
                <Input placeholder="Nome do cliente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="telefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <InputMask
                  mask="(99) 99999-9999"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                >
                  {(inputProps: any) => (
                    <Input placeholder="(00) 00000-0000" {...inputProps} />
                  )}
                </InputMask>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cidade</FormLabel>
              <FormControl>
                <Input placeholder="Cidade" {...field} />
              </FormControl>
              <FormMessage />
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
