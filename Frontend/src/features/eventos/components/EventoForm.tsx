import { useState, useEffect } from "react";
import { useForm, Resolver } from "react-hook-form";
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
import { Plus, X, Trash2, Minus } from "lucide-react";
import { Brinquedo } from "../../brinquedos/types";
import { Funcionario } from "../../funcionarios/types";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { useClientes } from "../../clientes/api/use-clientes";
import { useBrinquedos } from "../../brinquedos/api/use-brinquedos";
import { useFuncionarios } from "../../funcionarios/api/use-funcionarios";
import { useCreateEvento, useUpdateEvento, useDeleteEvento, useEvento } from "../api/use-eventos";

interface EventoFormProps {
  onSuccess: () => void;
  initialData?: Evento;
  eventoId?: string; // New prop to fetch fresh data
}

interface SelectedBrinquedo extends Brinquedo {
    quantidade: number;
}

export function EventoForm({ onSuccess, initialData, eventoId }: EventoFormProps) {
  // If we have an ID but incomplete data, fetch the full event
  const { data: fetchedEvento } = useEvento(initialData?.id || eventoId);
  
  // Use fetched data if available, otherwise fallback to initialData
  const eventData = fetchedEvento || initialData;

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
  
  // Helper para extrair data e hora de uma string ISO ou completa
  function getInitialDate() {
    if (eventData?.dataInicio) {
        // Se contém T, é ISO (yyyy-mm-ddThh:mm)
        if (eventData.dataInicio.includes('T')) {
             return eventData.dataInicio.split('T')[0];
        }
        // Se não, pode ser apenas a data (yyyy-mm-dd) do dayGrid
        return eventData.dataInicio;
    }
    return new Date().toISOString().split('T')[0];
  }

  function getInitialTime(isoString?: string) {
    if (isoString && isoString.includes('T')) {
      // Se for ISO completo, extrai hora
      return isoString.split('T')[1]?.substring(0, 5) || "00:00";
    }
    return "00:00";
  }

  const form = useForm<EventoFormData>({
    resolver: zodResolver(eventoSchema) as Resolver<EventoFormData>,
    defaultValues: eventData ? {
      titulo: eventData.titulo || "",
      descricao: eventData.descricao || "",
      data: getInitialDate(),
      horaInicio: getInitialTime(eventData.dataInicio),
      horaFim: getInitialTime(eventData.dataFim),
      clienteId: Number(eventData.clienteId) || 0,
      status: (eventData.status as any) || "AGENDADO",
      valor: eventData.valor ?? 0,
      // Endereço
      endereco: eventData.endereco || "",
      numero: eventData.numero || "",
      bairro: eventData.bairro || "",
      cidade: eventData.cidade || "BOTUCATU",
      estado: eventData.estado || "SP",
      brinquedos: eventData.brinquedos?.map(b => {
          // Tenta extrair ID do brinquedo seja objeto completo ou { brinquedoId }
          const id = (b as any).brinquedoId || b.id;
          return { brinquedoId: id, quantidade: (b as any).quantidade || 1 };
      }) || [],
      funcionarios: eventData.funcionarios?.map(f => {
          // Tenta extrair ID seja objeto completo ou apenas ID numérico
          return typeof f === 'number' ? f : (f.id || (f as any).funcionarioId);
      }) || [],
    } : {
      titulo: "",
      descricao: "",
      data: new Date().toISOString().split('T')[0],
      horaInicio: "00:00",
      horaFim: "00:00",
      clienteId: 0,
      status: "AGENDADO",
      valor: 0,
      // Endereço Padrão
      endereco: "",
      numero: "",
      bairro: "",
      cidade: "BOTUCATU",
      estado: "SP",
      brinquedos: [],
      funcionarios: [],
    },
  });

  const [selectedBrinquedos, setSelectedBrinquedos] = useState<SelectedBrinquedo[]>([]);
  const [selectedFuncionarios, setSelectedFuncionarios] = useState<Funcionario[]>([]);
  const [autoCalculate, setAutoCalculate] = useState(true);

  // Recalculate total when selected toys change
  useEffect(() => {
    if (autoCalculate) {
      // Ensure selectedBrinquedos is an array before reducing
      const brinquedosList = Array.isArray(selectedBrinquedos) ? selectedBrinquedos : [];
      
      const total = brinquedosList.reduce((acc, curr) => {
        const price = Number(curr.valorUnitario) || 0;
        return acc + (price * curr.quantidade);
      }, 0);
      
      // Only update if value is different to avoid infinite loops
      const currentVal = form.getValues('valor');
      if (currentVal !== total) {
          form.setValue('valor', total);
      }
    }
  }, [selectedBrinquedos, autoCalculate, form]);

  // Effect to update local state when event data is loaded
  useEffect(() => {
    if (eventData) {
        // Pre-fill selected items based on IDs from eventData
        if (eventData.brinquedos && eventData.brinquedos.length > 0) {
            // Se o backend retornar os objetos completos, use-os
            if (typeof eventData.brinquedos[0] === 'object' && 'nome' in eventData.brinquedos[0]) {
                 // Remove duplicates by ID just in case backend sends duplicates
                 const uniqueBrinquedos = new Map();
                 eventData.brinquedos.forEach((b: any) => {
                     if (!uniqueBrinquedos.has(b.id)) {
                         uniqueBrinquedos.set(b.id, {
                             ...b,
                             quantidade: b.quantidade || 1
                         });
                     }
                 });
                 setSelectedBrinquedos(Array.from(uniqueBrinquedos.values()));
            } 
            // Se retornar apenas a estrutura { brinquedoId, quantidade }, precisamos encontrar o objeto completo na lista de brinquedos
            else if (brinquedos.length > 0) {
                const uniqueIds = new Set();
                const mappedBrinquedos = eventData.brinquedos.map(eb => {
                    // Tenta extrair ID de várias formas possíveis
                    const bId = (eb as any).brinquedoId || (eb as any).id || (eb as any).brinquedo?.id;
                    
                    if (uniqueIds.has(bId)) return null; // Avoid duplicates
                    uniqueIds.add(bId);

                    const brinquedo = brinquedos.find(b => b.id === bId);
                    if (brinquedo) {
                        return {
                            ...brinquedo,
                            quantidade: (eb as any).quantidade || 1,
                            valorUnitario: brinquedo.valorUnitario || 0
                        };
                    }
                    return null;
                }).filter(Boolean) as SelectedBrinquedo[];
                setSelectedBrinquedos(mappedBrinquedos);
            }
        } else {
            setSelectedBrinquedos([]);
        }

        if (eventData.funcionarios && eventData.funcionarios.length > 0) {
             // Se o backend retornar os objetos completos
            if (typeof eventData.funcionarios[0] === 'object' && 'nome' in eventData.funcionarios[0]) {
                const uniqueFuncs = new Map();
                eventData.funcionarios.forEach((f: any) => {
                    if(!uniqueFuncs.has(f.id)) uniqueFuncs.set(f.id, f);
                });
                setSelectedFuncionarios(Array.from(uniqueFuncs.values()));
            }
            // Se retornar apenas IDs, precisamos encontrar
            else if (funcionarios.length > 0) {
                const uniqueIds = new Set();
                const mappedFuncionarios = eventData.funcionarios.map(ef => {
                    // Tenta extrair ID de várias formas possíveis (id direto, funcionarioId, ou objeto aninhado)
                    let fId;
                    if (typeof ef === 'number') fId = ef;
                    else if ((ef as any).funcionarioId) fId = (ef as any).funcionarioId;
                    else if ((ef as any).id) fId = (ef as any).id;
                    else if ((ef as any).funcionario?.id) fId = (ef as any).funcionario.id;
                    
                    if (uniqueIds.has(fId)) return null;
                    uniqueIds.add(fId);

                    return funcionarios.find(f => f.id === fId);
                }).filter(Boolean) as Funcionario[];
                setSelectedFuncionarios(mappedFuncionarios);
            }
        } else {
            setSelectedFuncionarios([]);
        }
        
        // Update form values
        form.reset({
            titulo: eventData.titulo,
            descricao: eventData.descricao,
            data: eventData.dataInicio ? eventData.dataInicio.split('T')[0] : new Date().toISOString().split('T')[0],
            horaInicio: eventData.dataInicio ? (eventData.dataInicio.split('T')[1]?.substring(0, 5) || "00:00") : "00:00",
            horaFim: eventData.dataFim ? (eventData.dataFim.split('T')[1]?.substring(0, 5) || "00:00") : "00:00",
            clienteId: Number(eventData.clienteId),
            status: eventData.status as any,
            valor: eventData.valor ?? 0,
            // Endereço
            endereco: eventData.endereco || "",
            numero: eventData.numero || "",
            bairro: eventData.bairro || "",
            cidade: eventData.cidade || "BOTUCATU",
            estado: eventData.estado || "SP",
            brinquedos: eventData.brinquedos ? (() => {
                const unique = new Map();
                eventData.brinquedos.forEach(b => {
                     const bId = (b as any).brinquedoId || b.id || (b as any).brinquedo?.id;
                     if (!unique.has(bId)) {
                        unique.set(bId, { 
                            brinquedoId: bId, 
                            quantidade: (b as any).quantidade || 1 
                        });
                     }
                });
                return Array.from(unique.values());
            })() : [],
            funcionarios: eventData.funcionarios ? (() => {
                const unique = new Set();
                const result: number[] = [];
                eventData.funcionarios.forEach(f => {
                    const id = typeof f === 'number' ? f : ((f as any).funcionarioId || f.id || (f as any).funcionario?.id);
                    if (!unique.has(id)) {
                        unique.add(id);
                        result.push(id);
                    }
                });
                return result;
            })() : [],
        });
    }
  }, [eventData, brinquedos, funcionarios, form]);

  const [isBrinquedosModalOpen, setIsBrinquedosModalOpen] = useState(false);
  const [isFuncionariosModalOpen, setIsFuncionariosModalOpen] = useState(false);

  const handleAddBrinquedo = (brinquedo: Brinquedo) => {
    if (!selectedBrinquedos.find(b => b.id === brinquedo.id)) {
      const newSelected = [...selectedBrinquedos, { ...brinquedo, quantidade: 1 }];
      setSelectedBrinquedos(newSelected);
      // Atualiza form
      const currentBrinquedos = form.getValues('brinquedos') || [];
      // Garantir que não duplique ao adicionar no form state
      const filteredCurrent = currentBrinquedos.filter(b => b.brinquedoId !== brinquedo.id);
      form.setValue('brinquedos', [...filteredCurrent, { brinquedoId: brinquedo.id!, quantidade: 1 }], { shouldValidate: true });
    }
  };

  const handleRemoveBrinquedo = (brinquedoId: number) => {
    const newSelected = selectedBrinquedos.filter(b => b.id !== brinquedoId);
    setSelectedBrinquedos(newSelected);
    // Atualiza form
    const currentBrinquedos = form.getValues('brinquedos') || [];
    form.setValue('brinquedos', currentBrinquedos.filter(b => b.brinquedoId !== brinquedoId));
  };

  const handleUpdateBrinquedoQuantity = (brinquedoId: number, delta: number) => {
      setSelectedBrinquedos(prev => prev.map(b => {
          if (b.id === brinquedoId) {
              const newQtd = Math.max(1, b.quantidade + delta);
              return { ...b, quantidade: newQtd };
          }
          return b;
      }));

      // Update form
      const currentBrinquedos = form.getValues('brinquedos') || [];
      const updatedFormBrinquedos = currentBrinquedos.map(b => {
          if (b.brinquedoId === brinquedoId) {
              return { ...b, quantidade: Math.max(1, b.quantidade + delta) };
          }
          return b;
      });
      form.setValue('brinquedos', updatedFormBrinquedos);
  };

  const handleAddFuncionario = (funcionario: Funcionario) => {
    if (!selectedFuncionarios.find(f => f.id === funcionario.id)) {
      const newSelected = [...selectedFuncionarios, funcionario];
      setSelectedFuncionarios(newSelected);
      // Atualiza form
      const currentFuncionarios = form.getValues('funcionarios') || [];
      // Garantir que não duplique
      const filteredCurrent = currentFuncionarios.filter(id => id !== funcionario.id);
      form.setValue('funcionarios', [...filteredCurrent, funcionario.id!]);
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
    
    // Validação de Funcionários Necessários
    const brinquedosQueNecessitamFuncionario = selectedBrinquedos.filter(b => b.necessita_funcionario);
    const totalFuncionariosNecessarios = brinquedosQueNecessitamFuncionario.reduce((acc, b) => acc + b.quantidade, 0);
    const totalFuncionariosSelecionados = selectedFuncionarios.length;

    if (totalFuncionariosSelecionados < totalFuncionariosNecessarios) {
      toast.error(`Funcionários insuficientes! Este evento precisa de no mínimo ${totalFuncionariosNecessarios} funcionário(s) devido aos brinquedos selecionados, mas apenas ${totalFuncionariosSelecionados} foi(foram) escalado(s).`, {
        duration: 5000,
      });
      return;
    }

    // Constrói dataInicio e dataFim ISO Strings para o backend
    const dataInicioISO = `${values.data}T${values.horaInicio}:00Z`; // Assumindo UTC por simplicidade, ou use date-fns para ajustar timezone
    const dataFimISO = `${values.data}T${values.horaFim}:00Z`;

    // O backend espera { dataInicio, dataFim, brinquedos: [{brinquedoId, quantidade}], funcionarios: [id] }
    // O payload precisa ser transformado do formato do Form para o formato da API
    
    // Se clienteId foi selecionado, buscamos o nome do cliente na lista
    const cliente = clientes.find(c => c.id === values.clienteId);

    const payload = {
      titulo: values.titulo,
      descricao: values.descricao,
      clienteId: values.clienteId,
      clienteNome: cliente?.nome || "Cliente", // Adicionamos o nome do cliente
      status: values.status,
      valor: values.valor ? parseFloat(String(values.valor)) : 0, // Garante envio como número
      // Endereço
      endereco: values.endereco,
      numero: values.numero,
      bairro: values.bairro,
      cidade: values.cidade,
      estado: values.estado,
      dataInicio: dataInicioISO,
      dataFim: dataFimISO,
      brinquedos: values.brinquedos,
      funcionarios: values.funcionarios,
      // Envia campos brutos para caso o backend seja atualizado
      data: values.data,
      horaInicio: values.horaInicio,
      horaFim: values.horaFim
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
      <form onSubmit={form.handleSubmit(onSubmit, (errors) => console.log(errors))} className="space-y-6">
        
        {/* LINHA 1: TÍTULO E DESCRIÇÃO */}
        <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-6">
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
            </div>
            <div className="col-span-12 md:col-span-6">
                <FormField
                    control={form.control}
                    name="descricao"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                                <Input placeholder="Detalhes do evento..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>

        {/* LINHA 2: CLIENTE E VALOR */}
        <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-8">
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
            </div>
            <div className="col-span-12 md:col-span-4">
                <FormField
                    control={form.control}
                    name="valor"
                    render={({ field }) => (
                    <FormItem>
                        <div className="flex items-center justify-between">
                            <FormLabel>Valor (R$)</FormLabel>
                            <span className="text-[10px] text-muted-foreground font-normal italic">
                                {autoCalculate ? "Calculado automaticamente" : "Valor manual"}
                            </span>
                        </div>
                        <FormControl>
                        <Input 
                            type="number" 
                            step="0.01" 
                            {...field}
                            value={field.value ?? 0} // Fix uncontrolled to controlled warning
                            onChange={(e) => {
                                field.onChange(e);
                                setAutoCalculate(false);
                            }}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
        </div>

        {/* LINHA 3: DATA, HORÁRIOS E STATUS */}
        <div className="grid grid-cols-12 gap-4 bg-muted/20 p-3 rounded-md border">
            <div className="col-span-12 md:col-span-3">
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
            </div>
            <div className="col-span-6 md:col-span-2">
                <FormField
                    control={form.control}
                    name="horaInicio"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Início</FormLabel>
                        <FormControl>
                        <div className="relative">
                            <Input type="time" {...field} className="[&::-webkit-calendar-picker-indicator]:hidden text-center" />
                        </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            <div className="col-span-6 md:col-span-2">
                <FormField
                    control={form.control}
                    name="horaFim"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Fim</FormLabel>
                        <FormControl>
                        <div className="relative">
                            <Input type="time" {...field} className="[&::-webkit-calendar-picker-indicator]:hidden text-center" />
                        </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            <div className="col-span-12 md:col-span-5">
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
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
            </div>
        </div>

        {/* LINHA 4: LOCALIZAÇÃO */}
        <div className="space-y-3 border rounded-md p-4">
            <h3 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                Localização
            </h3>
            
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-9">
                    <FormField
                        control={form.control}
                        name="endereco"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Endereço (Rua)</FormLabel>
                            <FormControl>
                            <Input placeholder="Rua das Flores" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                <div className="col-span-12 md:col-span-3">
                    <FormField
                        control={form.control}
                        name="numero"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Número</FormLabel>
                            <FormControl>
                            <Input placeholder="123" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-5">
                    <FormField
                        control={form.control}
                        name="bairro"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bairro</FormLabel>
                            <FormControl>
                            <Input placeholder="Centro" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                <div className="col-span-12 md:col-span-5">
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
                </div>
                <div className="col-span-12 md:col-span-2">
                    <FormField
                        control={form.control}
                        name="estado"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>UF</FormLabel>
                            <FormControl>
                            <Input placeholder="SP" maxLength={2} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>

        {/* LINHA 5: RECURSOS (BRINQUEDOS E FUNCIONÁRIOS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* COLUNA ESQUERDA: BRINQUEDOS */}
            <div className="flex flex-col gap-2 h-full">
                <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Brinquedos</Label>
                    <Dialog open={isBrinquedosModalOpen} onOpenChange={setIsBrinquedosModalOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" type="button" className="h-8">
                        <Plus className="mr-2 h-3 w-3" /> Adicionar
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[400px] flex flex-col max-h-[80vh]">
                        <DialogHeader>
                        <DialogTitle>Selecionar Brinquedos</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-2 flex-1 overflow-y-auto">
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
                        <div className="pt-2 border-t mt-2 flex justify-end">
                            <Button type="button" onClick={() => setIsBrinquedosModalOpen(false)}>
                                Confirmar
                            </Button>
                        </div>
                    </DialogContent>
                    </Dialog>
                </div>
                
                <div className="flex-1 border rounded-md p-3 bg-muted/10 flex flex-col gap-2 min-h-[150px]">
                    {selectedBrinquedos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                        <p className="text-sm">Nenhum brinquedo selecionado</p>
                    </div>
                    ) : (
                    selectedBrinquedos.map(brinquedo => (
                        <div key={brinquedo.id} className="flex items-center justify-between bg-white p-2 rounded border shadow-sm">
                            <span className="text-sm font-medium truncate max-w-[120px]" title={brinquedo.nome}>{brinquedo.nome}</span>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center border rounded-md h-7">
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-full w-6 rounded-none rounded-l-md hover:bg-gray-100"
                                        onClick={() => handleUpdateBrinquedoQuantity(brinquedo.id!, -1)}
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-6 text-center text-xs font-medium">{brinquedo.quantidade}</span>
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-full w-6 rounded-none rounded-r-md hover:bg-gray-100"
                                        onClick={() => handleUpdateBrinquedoQuantity(brinquedo.id!, 1)}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleRemoveBrinquedo(brinquedo.id!)}
                                    type="button"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))
                    )}
                </div>
            </div>

            {/* COLUNA DIREITA: FUNCIONÁRIOS */}
            <div className="flex flex-col gap-2 h-full">
                <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Funcionários</Label>
                    <Dialog open={isFuncionariosModalOpen} onOpenChange={setIsFuncionariosModalOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" type="button" className="h-8">
                        <Plus className="mr-2 h-3 w-3" /> Adicionar
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[400px] flex flex-col max-h-[80vh]">
                        <DialogHeader>
                        <DialogTitle>Selecionar Funcionários</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-2 flex-1 overflow-y-auto">
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
                        <div className="pt-2 border-t mt-2 flex justify-end">
                            <Button type="button" onClick={() => setIsFuncionariosModalOpen(false)}>
                                Confirmar
                            </Button>
                        </div>
                    </DialogContent>
                    </Dialog>
                </div>
                
                <div className="flex-1 border rounded-md p-3 bg-muted/10 flex flex-col gap-2 min-h-[150px]">
                    {selectedFuncionarios.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                        <p className="text-sm">Nenhum funcionário selecionado</p>
                    </div>
                    ) : (
                    <div className="flex flex-col gap-2">
                        {selectedFuncionarios.map(funcionario => (
                        <div key={funcionario.id} className="flex items-center justify-between bg-white p-2 rounded border shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                    {funcionario.nome.charAt(0)}
                                </div>
                                <span className="text-sm font-medium">{funcionario.nome}</span>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemoveFuncionario(funcionario.id!)}
                                type="button"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                        ))}
                    </div>
                    )}
                </div>
            </div>
        </div>

        <div className="flex justify-end pt-4 gap-2 border-t mt-6">
          {initialData?.id && (
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
            {isSubmitting ? "Salvando..." : (initialData?.id ? "Salvar Alterações" : "Criar Evento")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
