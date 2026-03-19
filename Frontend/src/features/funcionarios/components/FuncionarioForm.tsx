import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputMask from "react-input-mask";
import { funcionarioSchema, Funcionario } from "../types";
import { useCreateFuncionario, useUpdateFuncionario, useDeleteFuncionario } from "../api/use-funcionarios";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface FuncionarioFormProps {
  onSuccess: () => void;
  initialData?: Funcionario;
}

export function FuncionarioForm({ onSuccess, initialData }: FuncionarioFormProps) {
  const { mutate: createFuncionario, isPending: isCreating } = useCreateFuncionario();
  const { mutate: updateFuncionario, isPending: isUpdating } = useUpdateFuncionario();
  const { mutate: deleteFuncionario, isPending: isDeleting } = useDeleteFuncionario();

  const isSubmitting = isCreating || isUpdating || isDeleting;

  const form = useForm<Funcionario>({
    resolver: zodResolver(funcionarioSchema),
    defaultValues: initialData || {
      nome: "",
      cpf: "",
      telefone: "",
      ativo: true,
    },
  });

  async function onSubmit(values: Funcionario) {
    if (initialData?.id) {
        updateFuncionario({ id: initialData.id, data: values }, {
            onSuccess: () => {
                toast.success("Funcionário atualizado com sucesso!");
                onSuccess();
            },
            onError: () => {
                toast.error("Erro ao atualizar funcionário");
            }
        });
    } else {
        createFuncionario(values, {
            onSuccess: () => {
                toast.success("Funcionário criado com sucesso!");
                onSuccess();
            },
            onError: () => {
                toast.error("Erro ao criar funcionário");
            }
        });
    }
  }

  const handleDelete = async () => {
    if (initialData?.id) {
        if(window.confirm("Tem certeza que deseja excluir este funcionário?")) {
            deleteFuncionario(initialData.id, {
                onSuccess: () => {
                    toast.success("Funcionário excluído com sucesso!");
                    onSuccess();
                },
                onError: () => {
                    toast.error("Erro ao excluir funcionário");
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
                <Input placeholder="Nome do funcionário" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <InputMask
                  mask="999.999.999-99"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                >
                  {(inputProps: any) => (
                    <Input placeholder="000.000.000-00" {...inputProps} />
                  )}
                </InputMask>
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
          name="ativo"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Ativo
                </FormLabel>
                <FormDescription>
                  Funcionário disponível para escala
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
