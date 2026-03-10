import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockStorage } from '@/lib/mock-storage';
import { Evento } from '@/features/eventos/types';
import { toast } from 'sonner';

export function RelatoriosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [events, setEvents] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchEvents = async (filterType: 'all' | 'range') => {
    setLoading(true);
    try {
      const allEvents = await mockStorage.getEventos();
      let filteredEvents = allEvents;

      if (filterType === 'range') {
        if (!startDate || !endDate) {
          toast.error("Selecione as datas de início e fim.");
          setLoading(false);
          return;
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        // Adjust end date to include the full day
        end.setHours(23, 59, 59, 999);

        filteredEvents = allEvents.filter(event => {
          const eventDate = new Date(event.dataInicio);
          return eventDate >= start && eventDate <= end;
        });
      }

      if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        filteredEvents = filteredEvents.filter(event => 
          event.titulo.toLowerCase().includes(lowerTerm) ||
          event.clienteNome.toLowerCase().includes(lowerTerm)
        );
      }

      setEvents(filteredEvents);
      setHasSearched(true);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      toast.error("Erro ao carregar relatórios.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchEvents('range');
  };

  const handleFetchAll = () => {
    // Reset dates for "All" view if desired, or just ignore them
    fetchEvents('all');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Relatórios de Eventos</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="grid w-full gap-1.5 md:w-1/4">
              <label htmlFor="search" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Pesquisar
              </label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Título ou Cliente..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="grid w-full gap-1.5 md:w-1/4">
              <label htmlFor="startDate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Data Início
              </label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="grid w-full gap-1.5 md:w-1/4">
              <label htmlFor="endDate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Data Fim
              </label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="flex gap-2 md:w-auto">
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? "Buscando..." : "Pesquisar Intervalo"}
              </Button>
              <Button variant="outline" onClick={handleFetchAll} disabled={loading}>
                Todos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {hasSearched && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Resultados ({events.length})</CardTitle>
            {events.length > 0 && (
              <Button variant="ghost" size="sm" className="gap-1">
                <FileText className="h-4 w-4" />
                Exportar
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                Nenhum evento encontrado para os filtros selecionados.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Fim</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.titulo}</TableCell>
                        <TableCell>{event.clienteNome}</TableCell>
                        <TableCell>{formatDate(event.dataInicio)}</TableCell>
                        <TableCell>{formatDate(event.dataFim)}</TableCell>
                        <TableCell>
                          <Badge variant={
                            event.status === 'concluido' ? 'default' : 
                            event.status === 'cancelado' ? 'destructive' : 'secondary'
                          }>
                            {event.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(event.valor)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
