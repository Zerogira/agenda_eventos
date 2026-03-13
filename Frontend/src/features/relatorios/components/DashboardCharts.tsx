import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Evento } from "@/features/eventos/types";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isWithinInterval, 
  addMonths, 
  subMonths, 
  addYears, 
  subYears, 
  addWeeks, 
  subWeeks, 
  startOfYear, 
  endOfYear,
  getDaysInMonth,
  getDate,
  isSameDay,
  getHours,
  differenceInDays
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Package, Users, DollarSign, Calendar as CalendarIcon, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Calendar, UserCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useClientes } from "@/features/clientes/api/use-clientes";
import { useFuncionarios } from "@/features/funcionarios/api/use-funcionarios";
import { useBrinquedos } from "@/features/brinquedos/api/use-brinquedos";
import { Badge } from "@/components/ui/badge";

interface DashboardChartsProps {
  eventos: Evento[];
}

export function DashboardCharts({ eventos }: DashboardChartsProps) {
  // Hooks para filtros
  const { data: clientes = [] } = useClientes();
  const { data: funcionarios = [] } = useFuncionarios();
  const { data: brinquedos = [] } = useBrinquedos();

  // Estados de Filtro
  const [filterType, setFilterType] = useState<"year" | "month" | "week">("year");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCliente, setFilterCliente] = useState<string>("all");
  const [filterFuncionario, setFilterFuncionario] = useState<string>("all");
  const [filterBrinquedo, setFilterBrinquedo] = useState<string>("all");

  // Navegação Temporal
  const handlePrevious = () => {
      if (filterType === 'year') setCurrentDate(d => subYears(d, 1));
      else if (filterType === 'month') setCurrentDate(d => subMonths(d, 1));
      else if (filterType === 'week') setCurrentDate(d => subWeeks(d, 1));
  };

  const handleNext = () => {
      if (filterType === 'year') setCurrentDate(d => addYears(d, 1));
      else if (filterType === 'month') setCurrentDate(d => addMonths(d, 1));
      else if (filterType === 'week') setCurrentDate(d => addWeeks(d, 1));
  };

  const handleToday = () => {
      setCurrentDate(new Date());
  };

  // Texto do Período Atual
  const periodLabel = useMemo(() => {
      if (filterType === 'year') return format(currentDate, 'yyyy');
      if (filterType === 'month') return format(currentDate, 'MMMM yyyy', { locale: ptBR });
      if (filterType === 'week') {
          const start = startOfWeek(currentDate, { locale: ptBR });
          const end = endOfWeek(currentDate, { locale: ptBR });
          return `${format(start, 'dd/MM')} - ${format(end, 'dd/MM')}`;
      }
      return '';
  }, [currentDate, filterType]);

  // --- FILTERED EVENTS ---
  const filteredEvents = useMemo(() => {
    let result = eventos;

    // 1. Filtro Temporal Baseado em currentDate
    let start, end;
    if (filterType === "week") {
        start = startOfWeek(currentDate, { locale: ptBR });
        end = endOfWeek(currentDate, { locale: ptBR });
    } else if (filterType === "month") {
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
    } else {
        start = startOfYear(currentDate);
        end = endOfYear(currentDate);
    }
    
    result = result.filter(e => isWithinInterval(new Date(e.dataInicio), { start, end }));

    // 2. Filtros Adicionais
    if (filterStatus !== "all") {
        result = result.filter(e => e.status === filterStatus);
    }
    if (filterCliente !== "all") {
        result = result.filter(e => e.clienteId.toString() === filterCliente);
    }
    if (filterFuncionario !== "all") {
        result = result.filter(e => e.funcionarios?.some((f: any) => {
            const fId = typeof f === 'number' ? f : (f.id || f.funcionarioId);
            return fId.toString() === filterFuncionario;
        }));
    }
    if (filterBrinquedo !== "all") {
        result = result.filter(e => e.brinquedos?.some((b: any) => {
            const bId = (b.brinquedoId || b.id);
            return bId.toString() === filterBrinquedo;
        }));
    }

    return result;
  }, [eventos, currentDate, filterType, filterStatus, filterCliente, filterFuncionario, filterBrinquedo]);

  // --- COMPARISON DATA (Previous Period) ---
  const previousPeriodData = useMemo(() => {
      let start, end;
      if (filterType === 'week') {
          const prevDate = subWeeks(currentDate, 1);
          start = startOfWeek(prevDate, { locale: ptBR });
          end = endOfWeek(prevDate, { locale: ptBR });
      } else if (filterType === 'month') {
          const prevDate = subMonths(currentDate, 1);
          start = startOfMonth(prevDate);
          end = endOfMonth(prevDate);
      } else { // year
          const prevDate = subYears(currentDate, 1);
          start = startOfYear(prevDate);
          end = endOfYear(prevDate);
      }

      const prevEvents = eventos.filter(e => isWithinInterval(new Date(e.dataInicio), { start, end }));
      const receita = prevEvents.reduce((acc, curr) => curr.status !== 'CANCELADO' ? acc + (Number(curr.valor) || 0) : acc, 0);
      const total = prevEvents.length;
      
      return { receita, total };
  }, [eventos, filterType, currentDate]);

  // --- KPI CALCULATIONS ---
  const kpiData = useMemo(() => {
    const totalEventos = filteredEvents.length;
    const receitaTotal = filteredEvents.reduce((acc, curr) => curr.status !== 'CANCELADO' ? acc + (Number(curr.valor) || 0) : acc, 0);
    const ticketMedio = totalEventos > 0 ? receitaTotal / totalEventos : 0;
    const clientesUnicos = new Set(filteredEvents.map(e => e.clienteId)).size;
    
    // Growth
    let receitaGrowth = 0;
    let eventosGrowth = 0;
    
    if (previousPeriodData && previousPeriodData.receita > 0) {
        receitaGrowth = ((receitaTotal - previousPeriodData.receita) / previousPeriodData.receita) * 100;
    }
    if (previousPeriodData && previousPeriodData.total > 0) {
        eventosGrowth = ((totalEventos - previousPeriodData.total) / previousPeriodData.total) * 100;
    }

    return { totalEventos, receitaTotal, ticketMedio, clientesUnicos, receitaGrowth, eventosGrowth };
  }, [filteredEvents, previousPeriodData]);


  // --- CHARTS DATA ---
  
  // 1. Evolution (Time Series) & Accumulated
  const timeData = useMemo(() => {
    if (filterType === 'year') {
        const data = Array.from({ length: 12 }, (_, i) => ({
            name: format(new Date(currentDate.getFullYear(), i, 1), "MMM", { locale: ptBR }),
            receita: 0,
            eventos: 0,
            acumulado: 0,
            date: new Date(currentDate.getFullYear(), i, 1)
        }));
        
        let acumulado = 0;
        filteredEvents.forEach((evento) => {
            const month = new Date(evento.dataInicio).getMonth();
            const valor = Number(evento.valor) || 0;
            if (evento.status !== "CANCELADO") {
                data[month].receita += valor;
            }
            data[month].eventos += 1;
        });

        data.forEach(d => {
            acumulado += d.receita;
            d.acumulado = acumulado;
        });

        return data;
    } else {
        const daysMap = new Map<string, { receita: number, eventos: number, date: Date }>();
        
        filteredEvents.forEach(e => {
            const date = new Date(e.dataInicio);
            const key = format(date, 'yyyy-MM-dd');
            if (!daysMap.has(key)) daysMap.set(key, { receita: 0, eventos: 0, date });
            
            const current = daysMap.get(key)!;
            if (e.status !== 'CANCELADO') current.receita += (Number(e.valor) || 0);
            current.eventos += 1;
        });

        let acumulado = 0;
        return Array.from(daysMap.values())
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map(d => {
                acumulado += d.receita;
                return {
                    name: format(d.date, 'dd/MM'),
                    receita: d.receita,
                    eventos: d.eventos,
                    acumulado
                };
            });
    }
  }, [filteredEvents, filterType, currentDate]);

  // 2. Status Distribution
  const statusData = useMemo(() => {
    const statusCount: Record<string, number> = {};
    filteredEvents.forEach((e) => {
        const s = e.status;
        statusCount[s] = (statusCount[s] || 0) + 1;
    });
    return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
  }, [filteredEvents]);

  // 3. Receita por Brinquedo
  const revenueByToy = useMemo(() => {
      const toyMap: Record<string, number> = {};
      filteredEvents.forEach(e => {
          if (e.status !== 'CANCELADO' && e.brinquedos) {
              e.brinquedos.forEach((b: any) => {
                  const name = b.nome || b.brinquedo?.nome || "Desconhecido";
                  const valorEvento = Number(e.valor) || 0;
                  const qtdBrinquedos = e.brinquedos.length || 1;
                  const valorParcela = valorEvento / qtdBrinquedos; 
                  
                  toyMap[name] = (toyMap[name] || 0) + valorParcela;
              });
          }
      });
      
      return Object.entries(toyMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
  }, [filteredEvents]);

  // 4. Eventos por Dia da Semana
  const eventsByDayOfWeek = useMemo(() => {
      const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const counts = Array(7).fill(0);
      
      filteredEvents.forEach(e => {
          const day = new Date(e.dataInicio).getDay();
          counts[day]++;
      });
      
      return days.map((day, i) => ({ name: day, value: counts[i] }));
  }, [filteredEvents]);

  // 5. Heatmap Data (Calendar)
  const heatmapData = useMemo(() => {
      if (filterType !== 'month') return null; // Heatmap makes most sense for Month view
      
      const daysInMonth = getDaysInMonth(currentDate);
      const days = Array.from({ length: daysInMonth }, (_, i) => ({
          day: i + 1,
          receita: 0,
          eventos: 0
      }));

      filteredEvents.forEach(e => {
          const day = getDate(new Date(e.dataInicio));
          if (day >= 1 && day <= daysInMonth) {
              if (e.status !== 'CANCELADO') days[day - 1].receita += (Number(e.valor) || 0);
              days[day - 1].eventos += 1;
          }
      });

      return days;
  }, [filteredEvents, filterType, currentDate]);

  // 6. Horários mais comuns
  const hoursDistribution = useMemo(() => {
      const hours = Array(24).fill(0);
      filteredEvents.forEach(e => {
          if (e.status !== 'CANCELADO') {
              const date = new Date(e.dataInicio);
              const hour = getHours(date);
              hours[hour]++;
          }
      });
      
      return hours.map((count, hour) => ({
          name: `${hour}h`,
          value: count
      })).filter(h => h.value > 0);
  }, [filteredEvents]);

  // 7. Cancelamentos por período
  const cancellationsOverTime = useMemo(() => {
      if (filterType === 'year') {
          const data = Array.from({ length: 12 }, (_, i) => ({
              name: format(new Date(currentDate.getFullYear(), i, 1), "MMM", { locale: ptBR }),
              total: 0,
              cancelled: 0,
              rate: 0
          }));
          
          eventos.forEach((evento) => {
              const date = new Date(evento.dataInicio);
              if (date.getFullYear() === currentDate.getFullYear()) {
                  const month = date.getMonth();
                  data[month].total++;
                  if (evento.status === 'CANCELADO') {
                      data[month].cancelled++;
                  }
              }
          });

          return data.map(d => ({
              ...d,
              rate: d.total > 0 ? (d.cancelled / d.total) * 100 : 0
          }));
      } else {
          // Para mês ou semana, agrupar por dia
          const daysMap = new Map<string, { total: number, cancelled: number, date: Date }>();
          
          // Usar filteredEvents para respeitar o range de data selecionado (Mês ou Semana)
          // Mas precisamos ter cuidado com o filtro de status. Se o usuário filtrou status, isso aqui fica enviesado.
          // O ideal seria usar "eventos" e filtrar pela data manualmente aqui.
          
          let start, end;
          if (filterType === "week") {
              start = startOfWeek(currentDate, { locale: ptBR });
              end = endOfWeek(currentDate, { locale: ptBR });
          } else {
              start = startOfMonth(currentDate);
              end = endOfMonth(currentDate);
          }

          eventos.forEach(e => {
              const date = new Date(e.dataInicio);
              if (isWithinInterval(date, { start, end })) {
                  const key = format(date, 'yyyy-MM-dd');
                  if (!daysMap.has(key)) daysMap.set(key, { total: 0, cancelled: 0, date });
                  
                  const current = daysMap.get(key)!;
                  current.total++;
                  if (e.status === 'CANCELADO') current.cancelled++;
              }
          });

          return Array.from(daysMap.values())
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map(d => ({
                  name: format(d.date, 'dd/MM'),
                  rate: d.total > 0 ? (d.cancelled / d.total) * 100 : 0,
                  total: d.total,
                  cancelled: d.cancelled
              }));
      }
  }, [eventos, filterType, currentDate]);

  // 8. Antecedência média (Lead Time)
  const leadTimeDistribution = useMemo(() => {
      const ranges = [
          { name: '0-2 dias', min: 0, max: 2, value: 0 },
          { name: '3-7 dias', min: 3, max: 7, value: 0 },
          { name: '8-15 dias', min: 8, max: 15, value: 0 },
          { name: '16-30 dias', min: 16, max: 30, value: 0 },
          { name: '+30 dias', min: 31, max: 9999, value: 0 },
      ];
      
      filteredEvents.forEach(e => {
          if (e.status !== 'CANCELADO' && e.createdAt) {
              const start = new Date(e.dataInicio);
              const created = new Date(e.createdAt);
              const diff = differenceInDays(start, created);
              
              const range = ranges.find(r => diff >= r.min && diff <= r.max);
              if (range) range.value++;
          }
      });
      
      return ranges.map(r => ({ name: r.name, value: r.value }));
  }, [filteredEvents]);

  // --- ANÁLISE DE LOCAÇÃO ---
  const rentalAnalysis = useMemo(() => {
      const toyStats: Record<string, { count: number, revenue: number }> = {};
      let totalBrinquedosAlugados = 0;
      
      filteredEvents.forEach(e => {
          if (e.status !== 'CANCELADO' && e.brinquedos) {
              const valorEvento = Number(e.valor) || 0;
              const qtdItens = e.brinquedos.length || 1;
              const valorParcela = valorEvento / qtdItens;

              e.brinquedos.forEach((b: any) => {
                  const name = b.nome || b.brinquedo?.nome || "Desconhecido";
                  if (!toyStats[name]) toyStats[name] = { count: 0, revenue: 0 };
                  
                  const qtd = Number(b.quantidade) || 1;
                  toyStats[name].count += qtd;
                  toyStats[name].revenue += valorParcela;
                  totalBrinquedosAlugados += qtd;
              });
          }
      });

      const sortedByCount = Object.entries(toyStats).sort((a, b) => b[1].count - a[1].count);
      const sortedByRevenue = Object.entries(toyStats).sort((a, b) => b[1].revenue - a[1].revenue);
      
      const mediaBrinquedosPorEvento = filteredEvents.length > 0 ? totalBrinquedosAlugados / filteredEvents.length : 0;

      return {
          mostRented: sortedByCount.slice(0, 5).map(([name, stats]) => ({ name, ...stats })),
          mostRevenue: sortedByRevenue.slice(0, 5).map(([name, stats]) => ({ name, ...stats })),
          mediaBrinquedosPorEvento
      };
  }, [filteredEvents]);

  // --- RANKINGS ---
  const rankings = useMemo(() => {
    // Clients Ranking
    const clientsMap: Record<string, { name: string, total: number, count: number }> = {};
    const employeesMap: Record<string, { name: string, count: number }> = {};

    filteredEvents.forEach(curr => {
        if (curr.status !== 'CANCELADO') {
            // Client
            const cId = curr.clienteId;
            const cName = curr.clienteNome || `Cliente ${cId}`;
            if (!clientsMap[cId]) clientsMap[cId] = { name: cName, total: 0, count: 0 };
            clientsMap[cId].total += (Number(curr.valor) || 0);
            clientsMap[cId].count += 1;

            // Employees
            curr.funcionarios?.forEach((f: any) => {
                const fId = f.id || f.funcionarioId;
                const fName = f.nome || f.funcionario?.nome || "Funcionário";
                if (!employeesMap[fId]) employeesMap[fId] = { name: fName, count: 0 };
                employeesMap[fId].count += 1;
            });
        }
    });

    const topClientsByRevenue = Object.values(clientsMap).sort((a, b) => b.total - a.total).slice(0, 5);
    const topClientsByEvents = Object.values(clientsMap).sort((a, b) => b.count - a.count).slice(0, 5);
    const topEmployees = Object.values(employeesMap).sort((a, b) => b.count - a.count).slice(0, 5);

    // Toys Ranking (Reusing logic from rentalAnalysis for consistency)
    const topToys = rentalAnalysis.mostRented;

    return { topClientsByRevenue, topClientsByEvents, topEmployees, topToys };
  }, [filteredEvents, rentalAnalysis]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleBarClick = (data: any) => {
    if (filterType === 'year' && data && data.activePayload && data.activePayload.length > 0) {
      const payload = data.activePayload[0].payload;
      if (payload.date) {
          setCurrentDate(payload.date);
          setFilterType('month');
      }
    }
  };

  const renderGrowthBadge = (value: number) => {
      if (value === 0) return <Badge variant="outline" className="ml-2 text-xs">0%</Badge>;
      const isPositive = value > 0;
      return (
          <Badge 
            variant={isPositive ? "default" : "destructive"} 
            className={`ml-2 text-xs ${isPositive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
          >
              {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(value).toFixed(1)}%
          </Badge>
      );
  };

  // Helper for Heatmap Color
  const getHeatmapColor = (receita: number, maxReceita: number) => {
      if (receita === 0) return "bg-gray-100";
      const ratio = receita / (maxReceita || 1);
      if (ratio < 0.25) return "bg-green-200";
      if (ratio < 0.5) return "bg-green-300";
      if (ratio < 0.75) return "bg-green-400";
      return "bg-green-600";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* LINHA 1: CABEÇALHO E FILTROS */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Título e Navegação Temporal */}
            <div className="flex items-center gap-4">
                <h3 className="text-xl font-semibold flex items-center gap-2 min-w-[200px]">
                    {filterType === 'month' && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 mr-1"
                            onClick={() => setFilterType('year')}
                            title="Voltar para Visão Anual"
                        >
                            <Calendar className="h-4 w-4" />
                        </Button>
                    )}
                    Painel Analítico
                </h3>

                <div className="flex items-center bg-secondary/20 rounded-md border p-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevious}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <span className="min-w-[140px] text-center font-medium text-sm capitalize px-2">
                        {periodLabel}
                    </span>
                    
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNext}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <Button variant="outline" size="sm" onClick={handleToday} className="ml-2">
                    Hoje
                </Button>
            </div>
            
            {/* Seletor de Tipo de Visualização */}
            <div className="flex items-center gap-2">
                <Select value={filterType} onValueChange={(val: any) => setFilterType(val)}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="year">Visão Anual</SelectItem>
                        <SelectItem value="month">Visão Mensal</SelectItem>
                        <SelectItem value="week">Visão Semanal</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        {/* Filtros Avançados */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t">
            <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="AGENDADO">Agendado</SelectItem>
                        <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                        <SelectItem value="CANCELADO">Cancelado</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Cliente</label>
                <Select value={filterCliente} onValueChange={setFilterCliente}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {clientes.map(c => <SelectItem key={c.id} value={c.id?.toString() || ""}>{c.nome}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Funcionário</label>
                <Select value={filterFuncionario} onValueChange={setFilterFuncionario}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {funcionarios.map(f => <SelectItem key={f.id} value={f.id?.toString() || ""}>{f.nome}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Brinquedo</label>
                <Select value={filterBrinquedo} onValueChange={setFilterBrinquedo}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {brinquedos.map(b => <SelectItem key={b.id} value={b.id?.toString() || ""}>{b.nome}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="temporal">Análise Temporal</TabsTrigger>
            <TabsTrigger value="assets">Locação / Ativos</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
        </TabsList>

        {/* --- ABA 1: VISÃO GERAL --- */}
        <TabsContent value="overview" className="space-y-6">
            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(kpiData.receitaTotal)}</div>
                    <div className="flex items-center mt-1">
                        <span className="text-xs text-muted-foreground">vs anterior</span>
                        {renderGrowthBadge(kpiData.receitaGrowth)}
                    </div>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Eventos</CardTitle>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpiData.totalEventos}</div>
                    <div className="flex items-center mt-1">
                        <span className="text-xs text-muted-foreground">vs anterior</span>
                        {renderGrowthBadge(kpiData.eventosGrowth)}
                    </div>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(kpiData.ticketMedio)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Por evento realizado</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Média Brinquedos</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{rentalAnalysis.mediaBrinquedosPorEvento.toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Itens por evento</p>
                </CardContent>
                </Card>
            </div>

            {/* Gráfico Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Evolução de Desempenho</CardTitle>
                        <CardDescription>Receita e Eventos por {filterType === 'year' ? 'Mês' : 'Dia'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                                data={timeData}
                                onClick={handleBarClick}
                                style={{ cursor: filterType === 'year' ? 'pointer' : 'default' }}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tickFormatter={(val) => `R$${val/1000}k`} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(value: number, name: string) => [name === 'Receita' ? formatCurrency(value) : value, name]} 
                            />
                            <Legend />
                            <Bar yAxisId="left" dataKey="receita" name="Receita" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            <Line yAxisId="right" type="monotone" dataKey="eventos" name="Eventos" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                            </BarChart>
                        </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Receita Acumulada */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Receita Acumulada no Período</CardTitle>
                        <CardDescription>Crescimento do faturamento ao longo do tempo</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAcumulado" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(val) => `R$${val/1000}k`} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Area type="monotone" dataKey="acumulado" stroke="#10b981" fillOpacity={1} fill="url(#colorAcumulado)" name="Acumulado" />
                            </AreaChart>
                        </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        {/* --- ABA 2: ANÁLISE TEMPORAL --- */}
        <TabsContent value="temporal" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Demanda Semanal */}
                <Card>
                    <CardHeader>
                        <CardTitle>Demanda por Dia da Semana</CardTitle>
                        <CardDescription>Concentração de eventos</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={eventsByDayOfWeek}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Eventos" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Horários Mais Comuns */}
                <Card>
                    <CardHeader>
                        <CardTitle>Horários Mais Comuns</CardTitle>
                        <CardDescription>Início dos eventos</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hoursDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Eventos" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Status dos Eventos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Status dos Eventos</CardTitle>
                        <CardDescription>Visão geral da operação</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={
                                                entry.name === 'CONCLUIDO' ? '#10b981' : 
                                                entry.name === 'CANCELADO' ? '#ef4444' : '#3b82f6'
                                            } />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Antecedência de Reserva */}
                <Card>
                    <CardHeader>
                        <CardTitle>Antecedência de Reserva</CardTitle>
                        <CardDescription>Planejamento dos clientes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={leadTimeDistribution} layout="vertical" margin={{ left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" width={80} tick={{fontSize: 12}} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} name="Eventos" barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Taxa de Cancelamento */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Taxa de Cancelamento</CardTitle>
                        <CardDescription>Percentual de eventos cancelados por período</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={cancellationsOverTime}>
                                    <defs>
                                        <linearGradient id="colorCancel" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" />
                                    <YAxis tickFormatter={(val) => `${val.toFixed(0)}%`} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                                    <Area type="monotone" dataKey="rate" stroke="#ef4444" fillOpacity={1} fill="url(#colorCancel)" name="Taxa Cancelamento" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Heatmap (Apenas Mensal) */}
                {filterType === 'month' && heatmapData && (
                    <Card className="col-span-1 lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Calendário de Faturamento</CardTitle>
                            <CardDescription>Intensidade de receita por dia do mês</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-7 gap-2">
                                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                                    <div key={d} className="text-center text-xs font-bold text-muted-foreground py-2">{d}</div>
                                ))}
                                {(() => {
                                    // Preenchimento dos dias vazios antes do dia 1
                                    const firstDayOfMonth = startOfMonth(currentDate).getDay();
                                    const blanks = Array(firstDayOfMonth).fill(null);
                                    
                                    // Max Receita para escala de cor
                                    const maxRev = Math.max(...heatmapData.map(d => d.receita));

                                    return [
                                        ...blanks.map((_, i) => <div key={`blank-${i}`} className="h-12 bg-transparent" />),
                                        ...heatmapData.map(d => (
                                            <div 
                                                key={d.day} 
                                                className={`h-12 rounded-md border flex flex-col items-center justify-center text-xs transition-all hover:scale-105 ${getHeatmapColor(d.receita, maxRev)}`}
                                                title={`Dia ${d.day}: ${formatCurrency(d.receita)} (${d.eventos} eventos)`}
                                            >
                                                <span className="font-bold opacity-70">{d.day}</span>
                                                {d.receita > 0 && <span className="font-semibold text-[10px] text-white hidden md:block">R${Math.round(d.receita/1000)}k</span>}
                                            </div>
                                        ))
                                    ];
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </TabsContent>

        {/* --- ABA 3: LOCAÇÃO / ATIVOS --- */}
        <TabsContent value="assets" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Top Receita por Ativo</CardTitle>
                        <CardDescription>Brinquedos que geram maior retorno financeiro</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueByToy} layout="vertical" margin={{ left: 100 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" width={150} tick={{fontSize: 12}} />
                                    <Tooltip formatter={(val: number) => formatCurrency(val)} />
                                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} name="Receita Estimada" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Mais Alugados (Volume)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {rentalAnalysis.mostRented.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-2 border-b last:border-0">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="w-6 h-6 flex justify-center items-center rounded-full p-0">
                                            {i + 1}
                                        </Badge>
                                        <span className="font-medium text-sm">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold">{item.count}</span> <span className="text-xs text-muted-foreground">locações</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Maior Retorno (Top 5)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {rentalAnalysis.mostRevenue.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-2 border-b last:border-0">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="w-6 h-6 flex justify-center items-center rounded-full p-0 bg-green-50 text-green-700 border-green-200">
                                            {i + 1}
                                        </Badge>
                                        <span className="font-medium text-sm">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-green-700">{formatCurrency(item.revenue)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        {/* --- ABA 4: RANKINGS --- */}
        <TabsContent value="rankings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Top Clientes (Receita)</CardTitle>
                        <CardDescription>Quem mais investiu no período</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {rankings.topClientsByRevenue.map((cliente, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{cliente.name}</p>
                                            <p className="text-xs text-muted-foreground">{cliente.count} eventos</p>
                                        </div>
                                    </div>
                                    <div className="font-bold text-blue-700">
                                        {formatCurrency(cliente.total)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Clientes Fiéis (Frequência)</CardTitle>
                        <CardDescription>Quem mais contratou eventos</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {rankings.topClientsByEvents.map((cliente, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-xs">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{cliente.name}</p>
                                            <p className="text-xs text-muted-foreground">Ticket Médio: {formatCurrency(cliente.total/cliente.count)}</p>
                                        </div>
                                    </div>
                                    <div className="font-bold text-purple-700">
                                        {cliente.count} <span className="text-xs font-normal">eventos</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Funcionários</CardTitle>
                        <CardDescription>Participação em eventos</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {rankings.topEmployees.map((func, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-700 font-bold text-xs">
                                            {i + 1}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm font-semibold">{func.name}</p>
                                        </div>
                                    </div>
                                    <div className="font-bold text-orange-700">
                                        {func.count} <span className="text-xs font-normal">eventos</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Brinquedos</CardTitle>
                        <CardDescription>Líderes de locação</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {rankings.topToys.map((toy, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{toy.name}</p>
                                        </div>
                                    </div>
                                    <div className="font-bold text-emerald-700">
                                        {toy.count} <span className="text-xs font-normal">locações</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
      </Tabs>

    </div>
  );
}