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
import { Package, Users, DollarSign, Calendar as CalendarIcon, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Calendar, UserCheck, Trophy, Star, Target, Clock, AlertTriangle } from "lucide-react";
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

    // Use ALL events for rankings to ensure consistency, not just filtered ones
    // or at least be very careful about the data source
    eventos.forEach(curr => {
        if (curr.status !== 'CANCELADO') {
            // Client
            const cId = curr.clienteId.toString();
            const cName = curr.clienteNome || `Cliente ${cId}`;
            if (!clientsMap[cId]) {
                clientsMap[cId] = { name: cName, total: 0, count: 0 };
            }
            clientsMap[cId].total += (Number(curr.valor) || 0);
            clientsMap[cId].count += 1;

            // Employees
            curr.funcionarios?.forEach((f: any) => {
                const fId = (f.id || f.funcionarioId || f.funcionario?.id || "unknown").toString();
                const fName = f.nome || f.funcionario?.nome || "Funcionário";
                if (fId !== "unknown") {
                    if (!employeesMap[fId]) {
                        employeesMap[fId] = { name: fName, count: 0 };
                    }
                    employeesMap[fId].count += 1;
                }
            });
        }
    });

    const topClientsByRevenue = Object.values(clientsMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

    const topClientsByEvents = Object.values(clientsMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const topEmployees = Object.values(employeesMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Toys Ranking (Reusing logic from rentalAnalysis for consistency)
    const topToys = rentalAnalysis.mostRented;

    return { topClientsByRevenue, topClientsByEvents, topEmployees, topToys };
  }, [eventos, rentalAnalysis]);

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
      if (value === 0) return <Badge variant="outline" className="ml-2 text-xs border-purple-100 text-purple-600">0%</Badge>;
      const isPositive = value > 0;
      return (
          <Badge 
            className={`ml-2 text-xs border-none shadow-none ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
          >
              {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(value).toFixed(1)}%
          </Badge>
      );
  };

  // Helper for Heatmap Color
  const getHeatmapColor = (receita: number, maxReceita: number) => {
      if (receita === 0) return "bg-gray-50";
      const ratio = receita / (maxReceita || 1);
      if (ratio < 0.25) return "bg-purple-100 text-purple-700";
      if (ratio < 0.5) return "bg-purple-200 text-purple-800";
      if (ratio < 0.75) return "bg-purple-400 text-white";
      return "bg-purple-600 text-white";
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* LINHA 1: FILTROS E NAVEGAÇÃO */}
      <div className="flex flex-col gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Navegação Temporal */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-sm p-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-50 hover:text-purple-600" onClick={handlePrevious}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <span className="min-w-[150px] text-center font-bold text-sm text-slate-700 capitalize px-3">
                        {periodLabel}
                    </span>
                    
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-50 hover:text-purple-600" onClick={handleNext}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleToday} 
                    className="border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                >
                    Hoje
                </Button>

                {filterType === 'month' && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-purple-600 hover:bg-purple-50 font-bold flex items-center gap-2"
                        onClick={() => setFilterType('year')}
                    >
                        <Calendar className="h-4 w-4" />
                        Ver Ano
                    </Button>
                )}
            </div>
            
            {/* Seletor de Tipo de Visualização */}
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Visualização:</span>
                <Select value={filterType} onValueChange={(val: any) => setFilterType(val)}>
                    <SelectTrigger className="w-[160px] bg-white border-slate-200 text-slate-700 font-bold shadow-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="year">Anual</SelectItem>
                        <SelectItem value="month">Mensal</SelectItem>
                        <SelectItem value="week">Semanal</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        {/* Filtros Avançados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-slate-200">
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-9 bg-white border-slate-200 text-slate-700 shadow-sm font-medium"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="AGENDADO">Agendado</SelectItem>
                        <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                        <SelectItem value="CANCELADO">Cancelado</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cliente</label>
                <Select value={filterCliente} onValueChange={setFilterCliente}>
                    <SelectTrigger className="h-9 bg-white border-slate-200 text-slate-700 shadow-sm font-medium"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {clientes.map(c => <SelectItem key={c.id} value={c.id?.toString() || ""}>{c.nome}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Equipe</label>
                <Select value={filterFuncionario} onValueChange={setFilterFuncionario}>
                    <SelectTrigger className="h-9 bg-white border-slate-200 text-slate-700 shadow-sm font-medium"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {funcionarios.map(f => <SelectItem key={f.id} value={f.id?.toString() || ""}>{f.nome}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brinquedo</label>
                <Select value={filterBrinquedo} onValueChange={setFilterBrinquedo}>
                    <SelectTrigger className="h-9 bg-white border-slate-200 text-slate-700 shadow-sm font-medium"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {brinquedos.map(b => <SelectItem key={b.id} value={b.id?.toString() || ""}>{b.nome}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 border border-slate-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-purple-600 px-6 font-bold">Resumo Financeiro</TabsTrigger>
            <TabsTrigger value="temporal" className="data-[state=active]:bg-white data-[state=active]:text-purple-600 px-6 font-bold">Tendências</TabsTrigger>
            <TabsTrigger value="assets" className="data-[state=active]:bg-white data-[state=active]:text-purple-600 px-6 font-bold">Performance de Itens</TabsTrigger>
            <TabsTrigger value="rankings" className="data-[state=active]:bg-white data-[state=active]:text-purple-600 px-6 font-bold">Rankings</TabsTrigger>
        </TabsList>

        {/* --- ABA 1: VISÃO GERAL --- */}
        <TabsContent value="overview" className="space-y-6 outline-none">
            {/* KPIs Secundários do Dashboard */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white border-slate-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket Médio</CardTitle>
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900">{formatCurrency(kpiData.ticketMedio)}</div>
                    <p className="text-xs font-medium text-slate-500 mt-2 italic">Média por contrato</p>
                </CardContent>
                </Card>

                <Card className="bg-white border-slate-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Ativa</CardTitle>
                    <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900">{kpiData.clientesUnicos}</div>
                    <p className="text-xs font-medium text-slate-500 mt-2 italic">Clientes no período</p>
                </CardContent>
                </Card>

                <Card className="bg-white border-slate-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Itens / Evento</CardTitle>
                    <Package className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900">{rentalAnalysis.mediaBrinquedosPorEvento.toFixed(1)}</div>
                    <p className="text-xs font-medium text-slate-500 mt-2 italic">Média de alocação</p>
                </CardContent>
                </Card>

                <Card className="bg-white border-slate-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Crescimento</CardTitle>
                    <div className="h-4 w-4 flex items-center justify-center">
                        {kpiData.receitaGrowth >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-rose-500" />}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${kpiData.receitaGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {kpiData.receitaGrowth.toFixed(1)}%
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-2 italic">Comparado ao anterior</p>
                </CardContent>
                </Card>
            </div>

            {/* Gráfico Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-slate-100 shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-slate-900 text-lg font-bold">Curva de Performance</CardTitle>
                            <CardDescription>Receita (Roxo) vs Eventos (Amarelo)</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                                data={timeData}
                                onClick={handleBarClick}
                                style={{ cursor: filterType === 'year' ? 'pointer' : 'default' }}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                            />
                            <YAxis 
                                yAxisId="left" 
                                orientation="left" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 11 }}
                                tickFormatter={(val) => `R$${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`} 
                            />
                            <YAxis yAxisId="right" orientation="right" hide />
                            <Tooltip 
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ 
                                    borderRadius: '12px', 
                                    border: '1px solid #e2e8f0', 
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    padding: '12px'
                                }}
                                itemStyle={{ fontWeight: 'bold', fontSize: '13px' }}
                                formatter={(value: number, name: string) => [
                                    name === 'Receita' ? formatCurrency(value) : value, 
                                    name
                                ]} 
                            />
                            <Bar yAxisId="left" dataKey="receita" name="Receita" fill="#7c3aed" radius={[6, 6, 0, 0]} maxBarSize={40} />
                            <Line yAxisId="right" type="monotone" dataKey="eventos" name="Eventos" stroke="#eab308" strokeWidth={4} dot={{ r: 4, fill: '#eab308', strokeWidth: 2, stroke: '#fff' }} />
                            </BarChart>
                        </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Pizza */}
                <Card className="border-slate-100 shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-slate-900 text-lg font-bold">Distribuição Operacional</CardTitle>
                        <CardDescription>Status dos eventos no período</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center pt-4">
                        <div className="h-[240px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={[
                                                    '#7c3aed', // CONCLUIDO (Purple)
                                                    '#eab308', // AGENDADO (Yellow)
                                                    '#f43f5e', // CANCELADO (Rose)
                                                    '#3b82f6', // OUTROS (Blue)
                                                    '#10b981'  // OUTROS (Emerald)
                                                ][index % 5]} 
                                                stroke="none"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full mt-6 px-2">
                            {statusData.map((s, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: ['#7c3aed', '#eab308', '#f43f5e', '#3b82f6', '#10b981'][i % 5] }}></div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter truncate">{s.name}</span>
                                    <span className="text-xs font-black text-slate-700 ml-auto">{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        {/* --- ABA 2: ANÁLISE TEMPORAL --- */}
        <TabsContent value="temporal" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Demanda Semanal */}
                <Card className="border-slate-100 shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-slate-900 font-bold flex items-center gap-2">
                            <Target className="h-5 w-5 text-purple-600" />
                            Concentração por Dia
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={eventsByDayOfWeek}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 600}} />
                                    <Tooltip cursor={{fill: '#f8fafc'}} />
                                    <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Eventos" maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Horários Mais Comuns */}
                <Card className="border-slate-100 shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-slate-900 font-bold flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-500" />
                            Janelas de Início
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hoursDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 600}} />
                                    <Tooltip cursor={{fill: '#f8fafc'}} />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Eventos" maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Taxa de Cancelamento */}
                <Card className="col-span-1 lg:col-span-2 border-slate-100 shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-slate-900 font-bold flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-rose-500" />
                            Índice de Cancelamento
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={cancellationsOverTime}>
                                    <defs>
                                        <linearGradient id="colorCancel" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 600}} />
                                    <YAxis tickFormatter={(val) => `${val.toFixed(0)}%`} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                                    <Area type="monotone" dataKey="rate" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorCancel)" name="Taxa Cancelamento" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Heatmap (Apenas Mensal) */}
                {filterType === 'month' && heatmapData && (
                    <Card className="col-span-1 lg:col-span-2 border-slate-100 shadow-sm bg-white">
                        <CardHeader>
                            <CardTitle className="text-slate-900 font-bold">Fluxo de Caixa Diário</CardTitle>
                            <CardDescription>Intensidade de faturamento ao longo do mês</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-7 gap-2">
                                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                                    <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase py-2 tracking-widest">{d}</div>
                                ))}
                                {(() => {
                                    const firstDayOfMonth = startOfMonth(currentDate).getDay();
                                    const blanks = Array(firstDayOfMonth).fill(null);
                                    const maxRev = Math.max(...heatmapData.map(d => d.receita));

                                    return [
                                        ...blanks.map((_, i) => <div key={`blank-${i}`} className="h-14 bg-transparent" />),
                                        ...heatmapData.map(d => (
                                            <div 
                                                key={d.day} 
                                                className={`h-14 rounded-lg border border-slate-50 flex flex-col items-center justify-center text-xs transition-all hover:ring-2 hover:ring-purple-200 ${getHeatmapColor(d.receita, maxRev)}`}
                                                title={`Dia ${d.day}: ${formatCurrency(d.receita)} (${d.eventos} eventos)`}
                                            >
                                                <span className="font-bold opacity-40 text-[9px]">${d.day}</span>
                                                {d.receita > 0 && <span className="font-black text-[10px] mt-1">R$${Math.round(d.receita/1000)}k</span>}
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

        {/* --- ABA 3: PERFORMANCE DE ITENS --- */}
        <TabsContent value="assets" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1 lg:col-span-2 border-slate-100 shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-slate-900 font-bold">Rentabilidade por Ativo</CardTitle>
                        <CardDescription>Faturamento acumulado (R$)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueByToy} layout="vertical" margin={{ left: 40, right: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" width={150} tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} axisLine={false} tickLine={false} />
                                    <Tooltip formatter={(val: number) => formatCurrency(val)} cursor={{fill: '#f8fafc'}} />
                                    <Bar dataKey="value" fill="#7c3aed" radius={[0, 6, 6, 0]} name="Receita" barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-slate-900 font-bold">Mais Requisitados</CardTitle>
                            <CardDescription>Top 5 em volume de locação</CardDescription>
                        </div>
                        <Package className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {rentalAnalysis.mostRented.length > 0 ? rentalAnalysis.mostRented.map((item, i) => (
                                <div key={i} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${i === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-7 h-7 flex justify-center items-center rounded-full text-xs font-black ${i === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-white border border-slate-200 text-slate-400'}`}>
                                            {i + 1}
                                        </div>
                                        <span className={`font-bold text-sm ${i === 0 ? 'text-yellow-900' : 'text-slate-700'}`}>{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className={`font-black ${i === 0 ? 'text-yellow-700' : 'text-slate-900'}`}>{item.count}</span> 
                                        <span className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-tighter">Locações</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="h-40 flex items-center justify-center text-slate-400 italic text-sm">Nenhum dado disponível</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-slate-900 font-bold">Top Rentabilidade</CardTitle>
                            <CardDescription>Top 5 em faturamento</CardDescription>
                        </div>
                        <DollarSign className="h-5 w-5 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {rentalAnalysis.mostRevenue.length > 0 ? rentalAnalysis.mostRevenue.map((item, i) => (
                                <div key={i} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${i === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-7 h-7 flex justify-center items-center rounded-full text-xs font-black ${i === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-white border border-slate-200 text-slate-400'}`}>
                                            {i + 1}
                                        </div>
                                        <span className={`font-bold text-sm ${i === 0 ? 'text-yellow-900' : 'text-slate-700'}`}>{item.name}</span>
                                    </div>
                                    <div className={`text-right font-mono font-black text-sm ${i === 0 ? 'text-yellow-700' : 'text-slate-900'}`}>
                                        {formatCurrency(item.revenue)}
                                    </div>
                                </div>
                            )) : (
                                <div className="h-40 flex items-center justify-center text-slate-400 italic text-sm">Nenhum dado disponível</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        {/* --- ABA 4: RANKINGS --- */}
        <TabsContent value="rankings" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* VIP Clientes */}
                <Card className="border-slate-100 shadow-sm bg-white">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-1">
                            <Trophy className="h-4 w-4 text-purple-600" />
                            <CardTitle className="text-lg font-bold text-slate-900">VIPs (Faturamento)</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {rankings.topClientsByRevenue.length > 0 ? rankings.topClientsByRevenue.map((item, i) => (
                                <div key={i} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${i === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-slate-100 shadow-sm'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-black ${i === 0 ? 'text-yellow-600' : 'text-slate-300'}`}>#0{i+1}</span>
                                        <span className={`font-bold text-sm truncate max-w-[120px] ${i === 0 ? 'text-yellow-900' : 'text-slate-700'}`}>{item.name}</span>
                                    </div>
                                    <span className={`font-mono font-bold text-xs ${i === 0 ? 'text-yellow-700' : 'text-slate-900'}`}>{formatCurrency(item.total)}</span>
                                </div>
                            )) : (
                                <div className="h-40 flex items-center justify-center text-slate-400 italic text-sm">Sem dados</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recorrência Clientes */}
                <Card className="border-slate-100 shadow-sm bg-white">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-1">
                            <Star className="h-4 w-4 text-blue-500" />
                            <CardTitle className="text-lg font-bold text-slate-900">Fidelidade (Volume)</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {rankings.topClientsByEvents.length > 0 ? rankings.topClientsByEvents.map((item, i) => (
                                <div key={i} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${i === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-slate-100 shadow-sm'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-black ${i === 0 ? 'text-yellow-600' : 'text-slate-300'}`}>#0{i+1}</span>
                                        <span className={`font-bold text-sm truncate max-w-[120px] ${i === 0 ? 'text-yellow-900' : 'text-slate-700'}`}>{item.name}</span>
                                    </div>
                                    <Badge className={`${i === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-slate-100 text-slate-600'} border-none shadow-none text-[10px] font-black`}>
                                        {item.count} Eventos
                                    </Badge>
                                </div>
                            )) : (
                                <div className="h-40 flex items-center justify-center text-slate-400 italic text-sm">Sem dados</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Operação Ranking */}
                <Card className="border-slate-100 shadow-sm bg-white">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-1">
                            <UserCheck className="h-4 w-4 text-orange-500" />
                            <CardTitle className="text-lg font-bold text-slate-900">Engajamento Equipe</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {rankings.topEmployees.length > 0 ? rankings.topEmployees.map((item, i) => (
                                <div key={i} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${i === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-slate-100 shadow-sm'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-black ${i === 0 ? 'text-yellow-600' : 'text-slate-300'}`}>#0{i+1}</span>
                                        <span className={`font-bold text-sm truncate max-w-[120px] ${i === 0 ? 'text-yellow-900' : 'text-slate-700'}`}>{item.name}</span>
                                    </div>
                                    <Badge className={`${i === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-slate-100 text-slate-600'} border-none shadow-none text-[10px] font-black`}>
                                        {item.count} Missões
                                    </Badge>
                                </div>
                            )) : (
                                <div className="h-40 flex items-center justify-center text-slate-400 italic text-sm">Sem dados</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
