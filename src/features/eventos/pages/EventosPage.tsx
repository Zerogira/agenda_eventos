import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Plus, Search, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Evento } from "../types";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { EventoForm } from "../components/EventoForm";
import { useEventos, useUpdateEvento } from "../api/use-eventos";

export function EventosPage() {
  const { data: eventos = [], isLoading, isError, refetch } = useEventos();
  const { mutate: updateEvento } = useUpdateEvento();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [selectedEvento, setSelectedEvento] = useState<Evento | undefined>(undefined);

  const handleEditEvento = (evento: Evento) => {
    setSelectedEvento(evento);
    setIsDialogOpen(true);
  };

  const handleNewEvento = () => {
    setSelectedEvento(undefined);
    setIsDialogOpen(true);
  };

  const handleConcluirEvento = async (e: React.MouseEvent, evento: Evento) => {
    e.stopPropagation();
    if (window.confirm(`Deseja marcar o evento "${evento.titulo}" como concluído?`)) {
        updateEvento(
          { id: evento.id!, data: { status: 'CONCLUIDO' } },
          {
            onSuccess: () => {
              toast.success("Evento concluído com sucesso!");
            },
            onError: () => {
              toast.error("Erro ao concluir evento");
            }
          }
        );
    }
  };

  const filteredEventos = eventos.filter((evento) => {
    const matchesSearch =
      evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evento.clienteNome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "todos" || evento.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort logic
  const [sortConfig, setSortConfig] = useState<{ key: keyof Evento | 'clienteNome'; direction: 'asc' | 'desc' } | null>(null);

  const requestSort = (key: keyof Evento | 'clienteNome') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedEventos = [...filteredEventos].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const { key, direction } = sortConfig;
    let aValue = a[key as keyof Evento];
    let bValue = b[key as keyof Evento];

    // Handle nested or specific types if needed, for now simple string/number comparison
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();

    if (aValue! < bValue!) {
      return direction === 'asc' ? -1 : 1;
    }
    if (aValue! > bValue!) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const getSortIcon = (key: keyof Evento | 'clienteNome') => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? " ↑" : " ↓";
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "agendado":
        return <Badge variant="secondary">Agendado</Badge>;
      case "concluido":
        return <Badge variant="default">Concluído</Badge>;
      case "cancelado":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Eventos</h2>
          <p className="text-muted-foreground">
            Gerencie seus eventos agendados.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewEvento}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedEvento ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <EventoForm 
                initialData={selectedEvento}
                onSuccess={() => {
                  setIsDialogOpen(false);
                  refetch();
                }} 
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título ou cliente..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                className="h-9 w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="todos">Todos os Status</option>
                <option value="agendado">Agendado</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : isError ? (
            <div className="flex h-32 items-center justify-center text-destructive">
              Erro ao carregar eventos.
            </div>
          ) : filteredEventos.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Nenhum evento encontrado.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer hover:bg-muted" onClick={() => requestSort('titulo')}>
                      Título {getSortIcon('titulo')}
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted" onClick={() => requestSort('clienteNome')}>
                      Cliente {getSortIcon('clienteNome')}
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted" onClick={() => requestSort('dataInicio')}>
                      Data Início {getSortIcon('dataInicio')}
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted" onClick={() => requestSort('status')}>
                      Status {getSortIcon('status')}
                    </TableHead>
                    <TableHead className="text-right cursor-pointer hover:bg-muted" onClick={() => requestSort('valor')}>
                      Valor {getSortIcon('valor')}
                    </TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedEventos.map((evento) => (
                    <TableRow key={evento.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleEditEvento(evento)}>
                      <TableCell className="font-medium">{evento.titulo}</TableCell>
                      <TableCell>{evento.clienteNome}</TableCell>
                      <TableCell>
                        {(() => {
                          try {
                            const date = new Date(evento.dataInicio);
                            if (isNaN(date.getTime())) return "Data inválida";
                            return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
                          } catch {
                            return "Data inválida";
                          }
                        })()}
                      </TableCell>
                      <TableCell>{getStatusBadge(evento.status)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(evento.valor)}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                            {evento.status !== 'concluido' && evento.status !== 'cancelado' && (
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Concluir Evento" onClick={(e) => handleConcluirEvento(e, evento)}>
                                    <span className="sr-only">Concluir</span>
                                    <span className="text-green-600 font-bold">✓</span>
                                </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
