import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Calendar as CalendarIcon, FileText, ChevronDown, ChevronUp } from 'lucide-react';
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
import { useEventos } from '@/features/eventos/api/use-eventos';
import { Evento } from '@/features/eventos/types';
import { toast } from 'sonner';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { RelatorioEventos } from '@/pdf/RelatorioEventos';
import { DashboardCharts } from '../components/DashboardCharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function RelatoriosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredEvents, setFilteredEvents] = useState<Evento[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // State to track expanded rows
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const { data: allEvents, isLoading } = useEventos();

  useEffect(() => {
    // If we have already searched, re-apply filters when allEvents updates
    if (hasSearched && allEvents) {
        applyFilters(allEvents, searchTerm, startDate, endDate);
    }
  }, [allEvents]);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const applyFilters = (events: Evento[], term: string, start: string, end: string) => {
      let results = events;

      if (start && end) {
        // Data Início: 00:00:00
        const startDateObj = new Date(start);
        startDateObj.setHours(0, 0, 0, 0); // Garante início do dia
        
        // Data Fim: 23:59:59
        const endDateObj = new Date(end);
        endDateObj.setHours(23, 59, 59, 999); // Garante fim do dia

        results = results.filter(event => {
          const eventDate = new Date(event.dataInicio);
          return eventDate >= startDateObj && eventDate <= endDateObj;
        });
      }

      if (term) {
        const lowerTerm = term.toLowerCase();
        results = results.filter(event => 
          event.titulo.toLowerCase().includes(lowerTerm) ||
          (event.clienteNome && event.clienteNome.toLowerCase().includes(lowerTerm))
        );
      }
      
      setFilteredEvents(results);
  };

  const handleSearch = () => {
    // Se nenhum filtro foi preenchido
    if (!startDate && !endDate && !searchTerm) {
        toast.error("Preencha pelo menos um campo para pesquisar.");
        return;
    }
    
    // Se preencheu data inicio mas não fim, ou vice-versa
    if ((startDate && !endDate) || (!startDate && endDate)) {
        toast.error("Para filtrar por data, selecione início e fim.");
        return;
    }

    if (allEvents) {
        applyFilters(allEvents, searchTerm, startDate, endDate);
        setHasSearched(true);
    }
  };

  const handleFetchAll = () => {
    if (allEvents) {
        setStartDate('');
        setEndDate('');
        setSearchTerm('');
        setFilteredEvents(allEvents);
        setHasSearched(true);
    }
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

  const getPeriodoString = () => {
    if (startDate && endDate) {
      return `${format(new Date(startDate), "dd/MM/yyyy")} a ${format(new Date(endDate), "dd/MM/yyyy")}`;
    }
    return "Todo o período";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Relatórios & Dashboard Analítico</h2>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios Detalhados</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center p-8">Carregando dados...</div>
          ) : (
            <DashboardCharts eventos={allEvents || []} />
          )}
        </TabsContent>

        <TabsContent value="relatorios" className="mt-6 space-y-6">
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
                  <Button onClick={handleSearch} disabled={isLoading}>
                    {isLoading ? "Carregando..." : "Pesquisar"}
                  </Button>
                  <Button variant="outline" onClick={handleFetchAll} disabled={isLoading}>
                    Todos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {hasSearched && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Resultados ({filteredEvents.length})</CardTitle>
                {filteredEvents.length > 0 && (
                  <PDFDownloadLink
                    document={
                      <RelatorioEventos 
                        eventos={filteredEvents} 
                        periodo={getPeriodoString()}
                      />
                    }
                    fileName={`relatorio_eventos_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`}
                  >
                    {({ loading }) => (
                      <Button variant="ghost" size="sm" className="gap-1" disabled={loading}>
                        <FileText className="h-4 w-4" />
                        {loading ? 'Gerando PDF...' : 'Exportar PDF'}
                      </Button>
                    )}
                  </PDFDownloadLink>
                )}
              </CardHeader>
              <CardContent>
                {filteredEvents.length === 0 ? (
                  <div className="flex h-32 items-center justify-center text-muted-foreground">
                    Nenhum evento encontrado para os filtros selecionados.
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[30px]"></TableHead>
                          <TableHead>Título</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Início</TableHead>
                          <TableHead>Fim</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEvents.map((event) => (
                          <>
                            <TableRow 
                                key={event.id} 
                                className="cursor-pointer hover:bg-muted/50" 
                                onClick={() => toggleRow(event.id)}
                            >
                              <TableCell>
                                {expandedRows[event.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </TableCell>
                              <TableCell className="font-medium">{event.titulo}</TableCell>
                              <TableCell>{event.clienteNome}</TableCell>
                              <TableCell>{formatDate(event.dataInicio)}</TableCell>
                              <TableCell>{formatDate(event.dataFim)}</TableCell>
                              <TableCell>
                                <Badge variant={
                                  event.status === 'CONCLUIDO' ? 'default' : 
                                  event.status === 'CANCELADO' ? 'destructive' : 'secondary'
                                }>
                                  {event.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">{formatCurrency(event.valor || 0)}</TableCell>
                            </TableRow>
                            {expandedRows[event.id] && (
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableCell colSpan={7} className="p-0">
                                        <div className="p-4 pl-12 space-y-4">
                                            {/* Brinquedos */}
                                            <div>
                                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                                    Brinquedos
                                                    <Badge variant="outline" className="text-[10px] h-5">{event.brinquedos?.length || 0}</Badge>
                                                </h4>
                                                {event.brinquedos && event.brinquedos.length > 0 ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                        {event.brinquedos.map((brinquedo: any, idx) => (
                                                            <div key={idx} className="flex items-center justify-between bg-white border rounded p-2 text-sm">
                                                                <span>{brinquedo.nome}</span>
                                                                <Badge variant="secondary" className="text-xs">Qtd: {brinquedo.quantidade}</Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground italic">Nenhum brinquedo vinculado.</p>
                                                )}
                                            </div>

                                            {/* Funcionários */}
                                            <div>
                                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                                    Equipe
                                                    <Badge variant="outline" className="text-[10px] h-5">{event.funcionarios?.length || 0}</Badge>
                                                </h4>
                                                {event.funcionarios && event.funcionarios.length > 0 ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                        {event.funcionarios.map((func: any, idx) => (
                                                            <div key={idx} className="flex items-center gap-2 bg-white border rounded p-2 text-sm">
                                                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                                <span>{func.nome}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground italic">Nenhum funcionário vinculado.</p>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                          </>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
