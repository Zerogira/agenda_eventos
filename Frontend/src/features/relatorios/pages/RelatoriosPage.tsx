import { useState, useEffect, useMemo } from 'react';
import { format, setYear, startOfYear, endOfYear, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Search, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  LayoutDashboard, 
  ListFilter, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { useEventos } from '@/features/eventos/api/use-eventos';
import { Evento } from '@/features/eventos/types';
import { toast } from 'sonner';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { RelatorioEventos } from '@/pdf/RelatorioEventos';
import { DashboardCharts } from '../components/DashboardCharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function RelatoriosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [visualization, setVisualization] = useState('anual');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [clientFilter, setClientFilter] = useState('todos');
  const [teamFilter, setTeamFilter] = useState('todos');
  const [toyFilter, setToyFilter] = useState('todos');
  const [filteredEvents, setFilteredEvents] = useState<Evento[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // State to track expanded rows
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const { data: allEvents = [], isLoading } = useEventos();

  // Opções para os filtros baseadas nos dados reais
  const filterOptions = useMemo(() => {
    const clients = Array.from(new Set(allEvents.map(e => e.clienteNome).filter(Boolean))).sort();
    
    const teams = Array.from(new Set(
      allEvents.flatMap(e => (e.funcionarios || []).map((f: any) => f.nome)).filter(Boolean)
    )).sort();

    const toys = Array.from(new Set(
      allEvents.flatMap(e => (e.brinquedos || []).map((b: any) => b.nome)).filter(Boolean)
    )).sort();

    return { clients, teams, toys };
  }, [allEvents]);

  // Métricas Rápidas (KPIs) baseadas em todos os eventos
  const stats = useMemo(() => {
    const activeEvents = allEvents.filter(e => e.status !== 'CANCELADO');
    const totalReceita = activeEvents.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
    const totalBrinquedos = activeEvents.reduce((acc, curr) => acc + (curr.brinquedos?.length || 0), 0);
    const totalFuncionarios = activeEvents.reduce((acc, curr) => acc + (curr.funcionarios?.length || 0), 0);

    return {
      totalEventos: activeEvents.length,
      receita: totalReceita,
      brinquedos: totalBrinquedos,
      funcionarios: totalFuncionarios
    };
  }, [allEvents]);

  useEffect(() => {
    // Aplica filtros sempre que houver novos dados ou mudança nos parâmetros
    if (allEvents.length > 0) {
        applyFilters(allEvents);
    }
  }, [allEvents, selectedYear, visualization, statusFilter, clientFilter, teamFilter, toyFilter, searchTerm]);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const applyFilters = (events: Evento[]) => {
      let results = [...events];

      // Filtro de Ano e Visualização
      const baseDate = setYear(new Date(), selectedYear);
      let start: Date, end: Date;

      if (visualization === 'anual') {
        start = startOfYear(baseDate);
        end = endOfYear(baseDate);
      } else if (visualization === 'mensal') {
        // Para mensal, usamos o mês atual do ano selecionado
        const currentMonth = new Date().getMonth();
        const dateWithMonth = new Date(selectedYear, currentMonth, 1);
        start = startOfMonth(dateWithMonth);
        end = endOfMonth(dateWithMonth);
      } else {
        // Caso 'hoje' ou similar se houver
        start = new Date();
        start.setHours(0,0,0,0);
        end = new Date();
        end.setHours(23,59,59,999);
      }

      results = results.filter(event => {
        const eventDate = new Date(event.dataInicio);
        return eventDate >= start && eventDate <= end;
      });

      // Filtro de Status
      if (statusFilter !== 'todos') {
        results = results.filter(event => event.status === statusFilter);
      }

      // Filtro de Cliente
      if (clientFilter !== 'todos') {
        results = results.filter(event => event.clienteNome === clientFilter);
      }

      // Filtro de Equipe
      if (teamFilter !== 'todos') {
        results = results.filter(event => 
          (event.funcionarios || []).some((f: any) => f.nome === teamFilter)
        );
      }

      // Filtro de Brinquedo
      if (toyFilter !== 'todos') {
        results = results.filter(event => 
          (event.brinquedos || []).some((b: any) => b.nome === toyFilter)
        );
      }

      // Filtro de Termo de Busca (Texto livre)
      if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        results = results.filter(event => 
          event.titulo.toLowerCase().includes(lowerTerm) ||
          (event.clienteNome && event.clienteNome.toLowerCase().includes(lowerTerm))
        );
      }
      
      setFilteredEvents(results);
  };

  const handleSearch = () => {
    if (allEvents.length > 0) {
        applyFilters(allEvents);
        setHasSearched(true);
    }
  };

  const handleFetchAll = () => {
    if (allEvents.length > 0) {
        setSearchTerm('');
        setSelectedYear(new Date().getFullYear());
        setVisualization('anual');
        setStatusFilter('todos');
        setClientFilter('todos');
        setTeamFilter('todos');
        setToyFilter('todos');
        setFilteredEvents(allEvents);
        setHasSearched(true);
    }
  };

  const handlePrevYear = () => setSelectedYear(prev => prev - 1);
  const handleNextYear = () => setSelectedYear(prev => prev + 1);
  const handleToday = () => {
    const today = new Date();
    setSelectedYear(today.getFullYear());
    setVisualization('mensal'); // Ou 'hoje' se preferir
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
    <div className="space-y-8 pb-10">
      {/* Header com KPIs Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* EVENTOS - ROXO */}
        <Card className="shadow-sm bg-white overflow-hidden" style={{ borderLeft: '4px solid #7c3aed' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Eventos</p>
                <h3 className="text-2xl font-bold mt-1 text-slate-900">{stats.totalEventos}</h3>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 font-medium italic">Eventos ativos no sistema</p>
          </CardContent>
        </Card>

        {/* RECEITA - VERDE */}
        <Card className="shadow-sm bg-white overflow-hidden" style={{ borderLeft: '4px solid #10b981' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Faturamento</p>
                <h3 className="text-2xl font-bold mt-1 text-slate-900">{formatCurrency(stats.receita)}</h3>
              </div>
              <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 font-medium italic">Receita bruta acumulada</p>
          </CardContent>
        </Card>

        {/* BRINQUEDOS (ATIVOS) - AZUL */}
        <Card className="shadow-sm bg-white overflow-hidden" style={{ borderLeft: '4px solid #3b82f6' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Brinquedos</p>
                <h3 className="text-2xl font-bold mt-1 text-slate-900">{stats.brinquedos}</h3>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <Package className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 font-medium italic">Total de itens em eventos</p>
          </CardContent>
        </Card>

        {/* EQUIPE - LARANJA */}
        <Card className="shadow-sm bg-white overflow-hidden" style={{ borderLeft: '4px solid #f97316' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Equipe</p>
                <h3 className="text-2xl font-bold mt-1 text-slate-900">{stats.funcionarios}</h3>
              </div>
              <div className="h-12 w-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 font-medium italic">Funcionários designados</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-none overflow-hidden bg-white">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-0">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Gestão Analítica</CardTitle>
              <CardDescription className="text-sm">Painel de controle e exportação de dados</CardDescription>
            </div>
            <TabsList className="bg-slate-100 p-1 mb-[-1px]">
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm px-6 font-bold"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="relatorios" 
                className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm px-6 font-bold"
              >
                <ListFilter className="h-4 w-4 mr-2" />
                Relatórios
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="p-6">
            <TabsContent value="dashboard" className="mt-0 focus-visible:outline-none space-y-6">
              <div className="bg-white p-3 rounded-xl border-t-2 border-[#734ebd] shadow-sm mb-6 transition-all duration-200">
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-4">
                  {/* Navegação de Ano */}
                  <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-0.5 shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 hover:text-[#734ebd] hover:bg-purple-50 transition-colors"
                      onClick={handlePrevYear}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="px-3 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-[#734ebd]" />
                      <span className="text-xs font-bold text-slate-700">{selectedYear}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 hover:text-[#734ebd] hover:bg-purple-50 transition-colors"
                      onClick={handleNextYear}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-[11px] font-black uppercase tracking-wider border-slate-200 hover:border-[#734ebd] hover:text-[#734ebd] transition-all shrink-0"
                    onClick={handleToday}
                  >
                    Hoje
                  </Button>

                  <div className="h-6 w-px bg-slate-200 hidden lg:block shrink-0" />

                  {/* Filtros Centrais */}
                  <div className="flex flex-1 flex-wrap lg:flex-nowrap items-center gap-3">
                    {/* Status */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className={cn(
                        "h-8 w-[130px] text-xs transition-all duration-200",
                        statusFilter !== 'todos' 
                          ? "bg-purple-50/50 border-[#734ebd] text-[#734ebd] font-bold" 
                          : "bg-white border-slate-200 text-slate-600"
                      )}>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos Status</SelectItem>
                        <SelectItem value="PENDENTE">Pendente</SelectItem>
                        <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                        <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                        <SelectItem value="CANCELADO">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Cliente */}
                    <Select value={clientFilter} onValueChange={setClientFilter}>
                      <SelectTrigger className={cn(
                        "h-8 flex-1 min-w-[150px] max-w-[200px] text-xs transition-all duration-200",
                        clientFilter !== 'todos' 
                          ? "bg-purple-50/50 border-[#734ebd] text-[#734ebd] font-bold" 
                          : "bg-white border-slate-200 text-slate-600"
                      )}>
                        <SelectValue placeholder="Cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos Clientes</SelectItem>
                        {filterOptions.clients.map(client => (
                          <SelectItem key={client} value={client}>{client}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Equipe */}
                    <Select value={teamFilter} onValueChange={setTeamFilter}>
                      <SelectTrigger className={cn(
                        "h-8 flex-1 min-w-[130px] max-w-[180px] text-xs transition-all duration-200",
                        teamFilter !== 'todos' 
                          ? "bg-purple-50/50 border-[#734ebd] text-[#734ebd] font-bold" 
                          : "bg-white border-slate-200 text-slate-600"
                      )}>
                        <SelectValue placeholder="Equipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Toda Equipe</SelectItem>
                        {filterOptions.teams.map(member => (
                          <SelectItem key={member} value={member}>{member}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Brinquedo */}
                    <Select value={toyFilter} onValueChange={setToyFilter}>
                      <SelectTrigger className={cn(
                        "h-8 flex-1 min-w-[130px] max-w-[180px] text-xs transition-all duration-200",
                        toyFilter !== 'todos' 
                          ? "bg-purple-50/50 border-[#734ebd] text-[#734ebd] font-bold" 
                          : "bg-white border-slate-200 text-slate-600"
                      )}>
                        <SelectValue placeholder="Brinquedo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos Brinquedos</SelectItem>
                        {filterOptions.toys.map(toy => (
                          <SelectItem key={toy} value={toy}>{toy}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Visualização à Direita */}
                  <div className="flex items-center gap-2 shrink-0 ml-auto">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider hidden xl:block">Visualização</span>
                    <Select value={visualization} onValueChange={setVisualization}>
                      <SelectTrigger className="h-8 w-[110px] text-xs border-slate-200 focus:ring-[#734ebd]/20 focus:border-[#734ebd] font-bold">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anual">Anual</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                  <p className="text-slate-500 font-medium">Processando informações...</p>
                </div>
              ) : (
                <DashboardCharts eventos={filteredEvents} />
              )}
            </TabsContent>

            <TabsContent value="relatorios" className="mt-0 space-y-6 focus-visible:outline-none">
              <div className="bg-white p-4 rounded-xl border-t-2 border-[#734ebd] shadow-sm mb-6 transition-all duration-200">
                <div className="space-y-4">
                  {/* Linha 1: Navegação de Ano e Visualização */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:text-[#734ebd] hover:bg-purple-50 transition-colors"
                          onClick={handlePrevYear}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="px-4 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#734ebd]" />
                          <span className="text-sm font-bold text-slate-700">{selectedYear}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:text-[#734ebd] hover:bg-purple-50 transition-colors"
                          onClick={handleNextYear}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 text-xs font-bold border-slate-200 hover:border-[#734ebd] hover:text-[#734ebd] transition-all"
                        onClick={handleToday}
                      >
                        Hoje
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Visualização</label>
                      <Select value={visualization} onValueChange={setVisualization}>
                        <SelectTrigger className="h-9 w-[140px] text-sm border-slate-200 focus:ring-[#734ebd]/20 focus:border-[#734ebd]">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="anual">Anual</SelectItem>
                          <SelectItem value="mensal">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Linha 2: Filtros Operacionais */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 mr-2">
                      <Filter className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Filtros</span>
                    </div>

                    {/* Busca Texto */}
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <Input
                        placeholder="Buscar por evento ou cliente..."
                        className="h-9 pl-9 text-sm bg-slate-50 border-slate-200 focus:border-[#734ebd] focus:ring-1 focus:ring-[#734ebd]/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-1">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className={cn(
                          "h-9 w-[140px] text-sm transition-all duration-200",
                          statusFilter !== 'todos' 
                            ? "bg-purple-50/50 border-[#734ebd] text-[#734ebd] font-medium" 
                            : "bg-white border-slate-200 text-slate-600"
                        )}>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos Status</SelectItem>
                          <SelectItem value="PENDENTE">Pendente</SelectItem>
                          <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                          <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                          <SelectItem value="CANCELADO">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Cliente */}
                    <div className="flex flex-col gap-1">
                      <Select value={clientFilter} onValueChange={setClientFilter}>
                        <SelectTrigger className={cn(
                          "h-9 w-[180px] text-sm transition-all duration-200",
                          clientFilter !== 'todos' 
                            ? "bg-purple-50/50 border-[#734ebd] text-[#734ebd] font-medium" 
                            : "bg-white border-slate-200 text-slate-600"
                        )}>
                          <SelectValue placeholder="Cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos Clientes</SelectItem>
                          {filterOptions.clients.map(client => (
                            <SelectItem key={client} value={client}>{client}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Equipe */}
                    <div className="flex flex-col gap-1">
                      <Select value={teamFilter} onValueChange={setTeamFilter}>
                        <SelectTrigger className={cn(
                          "h-9 w-[160px] text-sm transition-all duration-200",
                          teamFilter !== 'todos' 
                            ? "bg-purple-50/50 border-[#734ebd] text-[#734ebd] font-medium" 
                            : "bg-white border-slate-200 text-slate-600"
                        )}>
                          <SelectValue placeholder="Equipe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Toda Equipe</SelectItem>
                          {filterOptions.teams.map(member => (
                            <SelectItem key={member} value={member}>{member}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Brinquedo */}
                    <div className="flex flex-col gap-1">
                      <Select value={toyFilter} onValueChange={setToyFilter}>
                        <SelectTrigger className={cn(
                          "h-9 w-[160px] text-sm transition-all duration-200",
                          toyFilter !== 'todos' 
                            ? "bg-purple-50/50 border-[#734ebd] text-[#734ebd] font-medium" 
                            : "bg-white border-slate-200 text-slate-600"
                        )}>
                          <SelectValue placeholder="Brinquedo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos Brinquedos</SelectItem>
                          {filterOptions.toys.map(toy => (
                            <SelectItem key={toy} value={toy}>{toy}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      <Button 
                        onClick={handleSearch} 
                        className="bg-[#734ebd] hover:bg-[#5e3fbd] h-9 px-6 font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95"
                        disabled={isLoading}
                      >
                        Filtrar
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={handleFetchAll} 
                        className="h-9 px-3 text-slate-400 hover:text-rose-500 transition-colors rounded-full"
                        disabled={isLoading}
                        title="Limpar Filtros"
                      >
                        <Search className="h-4 w-4 rotate-45" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {hasSearched && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">Resultados da Consulta</h4>
                      <p className="text-sm text-slate-500">{filteredEvents.length} registros encontrados</p>
                    </div>
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
                          <Button 
                            variant="outline" 
                            className="gap-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-bold"
                            disabled={loading}
                          >
                            <FileText className="h-4 w-4" />
                            {loading ? 'Preparando...' : 'Baixar PDF'}
                          </Button>
                        )}
                      </PDFDownloadLink>
                    )}
                  </div>

                  {filteredEvents.length === 0 ? (
                    <div className="flex flex-col h-48 items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                      <ListFilter className="h-10 w-10 text-slate-300 mb-2" />
                      <p className="text-slate-500 font-medium">Nenhum dado corresponde aos filtros.</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow className="hover:bg-transparent border-slate-200">
                            <TableHead className="w-[40px]"></TableHead>
                            <TableHead className="text-slate-900 font-bold uppercase text-[10px] tracking-widest">Evento</TableHead>
                            <TableHead className="text-slate-900 font-bold uppercase text-[10px] tracking-widest">Cliente</TableHead>
                            <TableHead className="text-slate-900 font-bold uppercase text-[10px] tracking-widest">Data/Hora</TableHead>
                            <TableHead className="text-slate-900 font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
                            <TableHead className="text-right text-slate-900 font-bold uppercase text-[10px] tracking-widest">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEvents.map((event) => (
                            <>
                              <TableRow 
                                key={event.id} 
                                className="cursor-pointer hover:bg-slate-50/50 transition-colors border-slate-100"
                                onClick={() => toggleRow(event.id)}
                              >
                                <TableCell>
                                  {expandedRows[event.id] ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                                </TableCell>
                                <TableCell className="font-bold text-slate-900">{event.titulo}</TableCell>
                                <TableCell className="text-slate-600">{event.clienteNome || 'N/A'}</TableCell>
                                <TableCell className="text-xs text-slate-500">{formatDate(event.dataInicio)}</TableCell>
                                <TableCell>
                                  <Badge 
                                    className={`${
                                      event.status === 'CONCLUIDO' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50' :
                                      event.status === 'CANCELADO' ? 'bg-rose-50 text-rose-700 hover:bg-rose-50' :
                                      'bg-blue-50 text-blue-700 hover:bg-blue-50'
                                    } border-none shadow-none font-bold text-[10px]`}
                                  >
                                    {event.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right font-mono font-bold text-slate-900">
                                  {formatCurrency(Number(event.valor) || 0)}
                                </TableCell>
                              </TableRow>
                              {expandedRows[event.id] && (
                                <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-slate-100">
                                  <TableCell colSpan={6} className="p-0">
                                    <div className="px-10 py-6 grid grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-1 duration-200">
                                      <div className="space-y-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Itens Alugados</p>
                                        <div className="flex flex-wrap gap-2">
                                          {event.brinquedos && event.brinquedos.length > 0 ? (
                                            event.brinquedos.map((b: any, i: number) => (
                                              <Badge key={i} variant="outline" className="bg-white border-slate-200 text-slate-600 font-medium">
                                                {b.quantidade}x {b.nome}
                                              </Badge>
                                            ))
                                          ) : (
                                            <span className="text-xs text-slate-400 italic">Nenhum brinquedo alocado</span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="space-y-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Equipe Alocada</p>
                                        <div className="flex flex-wrap gap-2">
                                          {event.funcionarios && event.funcionarios.length > 0 ? (
                                            event.funcionarios.map((f: any, i: number) => (
                                              <Badge key={i} variant="outline" className="bg-white border-slate-200 text-slate-600 font-medium">
                                                {f.nome}
                                              </Badge>
                                            ))
                                          ) : (
                                            <span className="text-xs text-slate-400 italic">Nenhum funcionário escalado</span>
                                          )}
                                        </div>
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
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
