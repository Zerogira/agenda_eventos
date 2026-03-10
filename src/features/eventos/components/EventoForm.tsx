import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventoSchema, EventoFormData, Evento } from "../types";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Trash2 } from "lucide-react";
import { Cliente } from "@/features/clientes/types";
import { Brinquedo } from "@/features/brinquedos/types";
import { Funcionario } from "@/features/funcionarios/types";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { useClientes } from "@/features/clientes/api/use-clientes";
import { useBrinquedos } from "@/features/brinquedos/api/use-brinquedos";
import { useFuncionarios } from "@/features/funcionarios/api/use-funcionarios";
import { useCreateEvento, useUpdateEvento, useDeleteEvento } from "../api/use-eventos";
import { format } from "date-fns";

interface EventoFormProps {
  onSuccess: () => void;
  initialData?: Evento;
}

export function EventoForm({ onSuccess, initialData }: EventoFormProps) {
  const { data: clientes = [] } = useClientes();
  const { data: brinquedos = [] } = useBrinquedos();
  const { data: funcionarios = [] } = useFuncionarios();

  const safeClientes = Array.isArray(clientes) ? clientes : [];
  const safeBrinquedos = Array.isArray(brinquedos) ? brinquedos : [];
  const safeFuncionarios = Array.isArray(funcionarios) ? funcionarios : [];

  const { mutate: createEvento, isPending: isCreating } = useCreateEvento();
  const { mutate: updateEvento, isPending: isUpdating } = useUpdateEvento();
  const { mutate: deleteEvento, isPending: isDeleting } = useDeleteEvento();

  const isSubmitting = isCreating || isUpdating || isDeleting;
  
  const [selectedBrinquedos, setSelectedBrinquedos] = useState<Brinquedo[]>(initialData?.brinquedos || []);
  const [selectedFuncionarios, setSelectedFuncionarios] = useState<Funcionario[]>(initialData?.funcionarios || []);

  const [isBrinquedosModalOpen, setIsBrinquedosModalOpen] = useState(false);
  const [isFuncionariosModalOpen, setIsFuncionariosModalOpen] = useState(false);

  // Helper para extrair data e hora de uma string ISO
  const getInitialDate = () => {
    if (initialData?.dataInicio) {
      return initialData.dataInicio.split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  };

  const getInitialTime = (isoString?: string) => {
    if (isoString) {
      return isoString.split('T')[1]?.substring(0, 5) || "00:00";
    }
    return "00:00";
  };

  const form = useForm<EventoFormData>({
    resolver: zodResolver(eventoSchema),
    defaultValues: initialData ? {
      titulo: initialData.titulo,
      descricao: initialData.descricao,
      data: getInitialDate(),
      horaInicio: getInitialTime(initialData.dataInicio),
      horaFim: getInitialTime(initialData.dataFim),
      clienteId: Number(initialData.clienteId),
      status: initialData.status as any,
      valor: initialData.valor,
      brinquedos: initialData.brinquedos.map(b => ({ brinquedoId: b.id!, quantidade: 1 })),
      funcionarios: initialData.funcionarios.map(f => f.id!),
    } : {
      titulo: "",
      descricao: "",
      data: new Date().toISOString().split('T')[0],
      horaInicio: "00:00",
      horaFim: "00:00",
      clienteId: 0,
      status: "AGENDADO",
      valor: 0,
      brinquedos: [],
      funcionarios: [],
    },
  });

  const handleAddBrinquedo = (brinquedo: Brinquedo) => {
    if (!selectedBrinquedos.find(b => b.id === brinquedo.id)) {
      const newSelected = [...selectedBrinquedos, brinquedo];
      setSelectedBrinquedos(newSelected);
      // Atualiza form
      const currentBrinquedos = form.getValues('brinquedos') || [];
      form.setValue('brinquedos', [...currentBrinquedos, { brinquedoId: brinquedo.id!, quantidade: 1 }]);
    }
  };

  const handleRemoveBrinquedo = (brinquedoId: number) => {
    const newSelected = selectedBrinquedos.filter(b => b.id !== brinquedoId);
    setSelectedBrinquedos(newSelected);
    // Atualiza form
    const currentBrinquedos = form.getValues('brinquedos') || [];
    form.setValue('brinquedos', currentBrinquedos.filter(b => b.brinquedoId !== brinquedoId));
  };

  const handleAddFuncionario = (funcionario: Funcionario) => {
    if (!selectedFuncionarios.find(f => f.id === funcionario.id)) {
      const newSelected = [...selectedFuncionarios, funcionario];
      setSelectedFuncionarios(newSelected);
      // Atualiza form
      const currentFuncionarios = form.getValues('funcionarios') || [];
      form.setValue('funcionarios', [...currentFuncionarios, funcionario.id!]);
    }
  };

  const handleRemoveFuncionario = (funcionarioId: number) => {
    const newSelected = selectedFuncionarios.filter(f => f.id !== funcionarioId);
    setSelectedFuncionarios(newSelected);
    // Atualiza form
    const currentFuncionarios = form.getValues('funcionarios') || [];
    form.setValue('funcionarios', currentFuncionarios.filter(id => id !== funcionarioId));
  };

  async function onSubmit(values: EventoFormData) {
    console.log("Submitting:", values); // Debug
    
    // Constrói dataInicio e dataFim ISO Strings para o backend
    const dataInicioISO = `${values.data}T${values.horaInicio}:00Z`; // Assumindo UTC por simplicidade, ou use date-fns para ajustar timezone
    const dataFimISO = `${values.data}T${values.horaFim}:00Z`;

    // O backend espera { dataInicio, dataFim, brinquedos: [{brinquedoId, quantidade}], funcionarios: [id] }
    // O payload precisa ser transformado do formato do Form para o formato da API
    const payload = {
      titulo: values.titulo,
      descricao: values.descricao,
      clienteId: values.clienteId,
      status: values.status,
      valor: values.valor,
      dataInicio: dataInicioISO,
      dataFim: dataFimISO,
      brinquedos: values.brinquedos,
      funcionarios: values.funcionarios, // Array de IDs
    };

    if (initialData?.id) {
      updateEvento(
        { id: initialData.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Evento atualizado com sucesso!");
            onSuccess();
          },
          onError: (error) => {
            console.error(error);
            toast.error("Erro ao atualizar evento");
          }
        }
      );
    } else {
      createEvento(payload, {
        onSuccess: () => {
          toast.success("Evento criado com sucesso!");
          onSuccess();
        },
        onError: (error) => {
          console.error(error);
          toast.error("Erro ao criar evento");
        }
      });
    }
  }

  const handleDelete = async () => {
    if (initialData?.id) {
      if(window.confirm("Tem certeza que deseja excluir este evento?")) {
        deleteEvento(initialData.id, {
          onSuccess: () => {
            toast.success("Evento excluído com sucesso!");
            onSuccess();
          },
          onError: () => {
            toast.error("Erro ao excluir evento");
          }
        });
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, (errors) => console.log(errors))} className="space-y-4">
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título do Evento</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Aniversário do João" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="clienteId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Select 
                  onValueChange={(val) => field.onChange(Number(val))} 
                  value={field.value ? field.value.toString() : ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {safeClientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id?.toString() || ""}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="valor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    {...field} 
                    onKeyDown={(e) => {
                      // Previne digitação de letras, permite apenas números, backspace, tab, delete, setas e ponto/vírgula
                      if (!/[0-9]/.test(e.key) && 
                          !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', '.', ','].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="data"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="horaInicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora Início</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type="time" {...field} className="[&::-webkit-calendar-picker-indicator]:hidden" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="horaFim"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora Fim</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type="time" {...field} className="[&::-webkit-calendar-picker-indicator]:hidden" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="AGENDADO">Agendado</SelectItem>
                  <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
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
                <Textarea placeholder="Detalhes do evento..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* BRINQUEDOS SECTION */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Brinquedos</Label>
            <Dialog open={isBrinquedosModalOpen} onOpenChange={setIsBrinquedosModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" type="button">
                  <Plus className="mr-2 h-4 w-4" /> Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Selecionar Brinquedos</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-2 max-h-[300px] overflow-y-auto">
                  {safeBrinquedos.length === 0 ? (
                     <p className="text-center text-muted-foreground">Nenhum brinquedo disponível.</p>
                  ) : (
                    safeBrinquedos.map(brinquedo => {
                      const isSelected = selectedBrinquedos.some(b => b.id === brinquedo.id);
                      return (
                        <div key={brinquedo.id} className="flex items-center space-x-2 border p-2 rounded-md hover:bg-muted/50 cursor-pointer" onClick={() => !isSelected && handleAddBrinquedo(brinquedo)}>
                           <Checkbox checked={isSelected} onCheckedChange={(checked) => {
                             if(checked) handleAddBrinquedo(brinquedo);
                             else handleRemoveBrinquedo(brinquedo.id!);
                           }} id={`toy-${brinquedo.id}`} />
                           <div className="flex-1">
                             <label htmlFor={`toy-${brinquedo.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                               {brinquedo.nome}
                             </label>
                             {brinquedo.quantidade_total > 0 && (
                               <p className="text-xs text-muted-foreground">Estoque: {brinquedo.quantidade_total}</p>
                             )}
                           </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="border rounded-md p-4 min-h-[100px] bg-muted/20">
            {selectedBrinquedos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum brinquedo selecionado</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedBrinquedos.map(brinquedo => (
                  <Badge key={brinquedo.id} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                    {brinquedo.nome}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 rounded-full hover:bg-destructive hover:text-destructive-foreground ml-1"
                      onClick={() => handleRemoveBrinquedo(brinquedo.id!)}
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FUNCIONARIOS SECTION */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Funcionários</Label>
            <Dialog open={isFuncionariosModalOpen} onOpenChange={setIsFuncionariosModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" type="button">
                  <Plus className="mr-2 h-4 w-4" /> Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Selecionar Funcionários</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-2 max-h-[300px] overflow-y-auto">
                   {safeFuncionarios.length === 0 ? (
                     <p className="text-center text-muted-foreground">Nenhum funcionário disponível.</p>
                  ) : (
                    safeFuncionarios.map(funcionario => {
                      const isSelected = selectedFuncionarios.some(f => f.id === funcionario.id);
                      return (
                        <div key={funcionario.id} className="flex items-center space-x-2 border p-2 rounded-md hover:bg-muted/50 cursor-pointer" onClick={() => !isSelected && handleAddFuncionario(funcionario)}>
                           <Checkbox checked={isSelected} onCheckedChange={(checked) => {
                             if(checked) handleAddFuncionario(funcionario);
                             else handleRemoveFuncionario(funcionario.id!);
                           }} id={`func-${funcionario.id}`} />
                           <div className="flex-1">
                             <label htmlFor={`func-${funcionario.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                               {funcionario.nome}
                             </label>
                             <p className="text-xs text-muted-foreground">{funcionario.telefone}</p>
                           </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="border rounded-md p-4 min-h-[100px] bg-muted/20">
            {selectedFuncionarios.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum funcionário selecionado</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedFuncionarios.map(funcionario => (
                  <Badge key={funcionario.id} variant="outline" className="pl-2 pr-1 py-1 flex items-center gap-1 bg-background">
                    {funcionario.nome}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 rounded-full hover:bg-destructive hover:text-destructive-foreground ml-1"
                      onClick={() => handleRemoveFuncionario(funcionario.id!)}
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 gap-2">
          {initialData?.id && (
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : (initialData?.id ? "Salvar Alterações" : "Criar Evento")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
