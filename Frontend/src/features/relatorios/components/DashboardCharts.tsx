import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Evento } from "@/features/eventos/types";
import { 
  format, 
} from "date-fns";
import { Package, Users, DollarSign, TrendingUp, Target, Clock, Trophy, Star, UserCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface DashboardChartsProps {
  eventos: Evento[];
}

export function DashboardCharts({ eventos }: DashboardChartsProps) {
  // --- KPI CALCULATIONS ---
  const kpiData = useMemo(() => {
    const totalEventos = eventos.length;
    const receitaTotal = eventos.reduce((acc, curr) => curr.status !== 'CANCELADO' ? acc + (Number(curr.valor) || 0) : acc, 0);
    const ticketMedio = totalEventos > 0 ? receitaTotal / totalEventos : 0;
    const clientesUnicos = new Set(eventos.map(e => e.clienteId)).size;
    
    return { totalEventos, receitaTotal, ticketMedio, clientesUnicos };
  }, [eventos]);

  // --- RENTAL ANALYSIS ---
  const rentalAnalysis = useMemo(() => {
    const toyStats: Record<string, { count: number, revenue: number }> = {};
    let totalBrinquedosAlugados = 0;
    
    eventos.forEach(e => {
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
    
    const mediaBrinquedosPorEvento = eventos.length > 0 ? totalBrinquedosAlugados / eventos.length : 0;

    return {
        mostRented: sortedByCount.slice(0, 5).map(([name, stats]) => ({ name, ...stats })),
        mostRevenue: sortedByRevenue.slice(0, 5).map(([name, stats]) => ({ name, ...stats })),
        mediaBrinquedosPorEvento
    };
  }, [eventos]);

  // --- RANKINGS ---
  const rankings = useMemo(() => {
    const clientsMap: Record<string, { name: string, total: number, count: number }> = {};
    const employeesMap: Record<string, { name: string, count: number }> = {};

    eventos.forEach(curr => {
        if (curr.status !== 'CANCELADO') {
            const cId = curr.clienteId.toString();
            const cName = curr.clienteNome || `Cliente ${cId}`;
            if (!clientsMap[cId]) {
                clientsMap[cId] = { name: cName, total: 0, count: 0 };
            }
            clientsMap[cId].total += (Number(curr.valor) || 0);
            clientsMap[cId].count += 1;

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

    const topClientsByRevenue = Object.values(clientsMap).sort((a, b) => b.total - a.total).slice(0, 5);
    const topClientsByEvents = Object.values(clientsMap).sort((a, b) => b.count - a.count).slice(0, 5);
    const topEmployees = Object.values(employeesMap).sort((a, b) => b.count - a.count).slice(0, 5);

    return { topClientsByRevenue, topClientsByEvents, topEmployees };
  }, [eventos]);

  // --- CHARTS DATA ---
  const timeData = useMemo(() => {
    const daysMap = new Map<string, { receita: number, eventos: number, date: Date }>();
    
    eventos.forEach(e => {
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
  }, [eventos]);

  const statusData = useMemo(() => {
    const statusCount: Record<string, number> = {};
    eventos.forEach((e) => {
        const s = e.status;
        statusCount[s] = (statusCount[s] || 0) + 1;
    });
    return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
  }, [eventos]);

  const revenueByToy = useMemo(() => {
      const toyMap: Record<string, number> = {};
      eventos.forEach(e => {
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
      return Object.entries(toyMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [eventos]);

  const eventsByDayOfWeek = useMemo(() => {
      const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const counts = Array(7).fill(0);
      eventos.forEach(e => {
          const day = new Date(e.dataInicio).getDay();
          counts[day]++;
      });
      return days.map((day, i) => ({ name: day, value: counts[i] }));
  }, [eventos]);

  const hoursDistribution = useMemo(() => {
      const hours = Array(24).fill(0);
      eventos.forEach(e => {
          if (e.status !== 'CANCELADO') {
              const hour = new Date(e.dataInicio).getHours();
              hours[hour]++;
          }
      });
      return hours.map((count, hour) => ({ name: `${hour}h`, value: count })).filter(h => h.value > 0);
  }, [eventos]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 border border-slate-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-purple-600 px-6 font-bold">Resumo Financeiro</TabsTrigger>
            <TabsTrigger value="temporal" className="data-[state=active]:bg-white data-[state=active]:text-purple-600 px-6 font-bold">Tendências</TabsTrigger>
            <TabsTrigger value="assets" className="data-[state=active]:bg-white data-[state=active]:text-purple-600 px-6 font-bold">Performance de Itens</TabsTrigger>
            <TabsTrigger value="rankings" className="data-[state=active]:bg-white data-[state=active]:text-purple-600 px-6 font-bold">Rankings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 outline-none">
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
                        <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Eventos</CardTitle>
                        <Target className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{kpiData.totalEventos}</div>
                        <p className="text-xs font-medium text-slate-500 mt-2 italic">No período selecionado</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-slate-100 shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-slate-900 text-lg font-bold">Curva de Performance</CardTitle>
                        <CardDescription>Receita (Roxo) vs Eventos (Amarelo)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={timeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(val) => `R$${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`} />
                                    <YAxis yAxisId="right" orientation="right" hide />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '12px' }} itemStyle={{ fontWeight: 'bold', fontSize: '13px' }} formatter={(value: number, name: string) => [name === 'Receita' ? formatCurrency(value) : value, name]} />
                                    <Bar yAxisId="left" dataKey="receita" name="Receita" fill="#7c3aed" radius={[6, 6, 0, 0]} maxBarSize={40} />
                                    <Line yAxisId="right" type="monotone" dataKey="eventos" name="Eventos" stroke="#eab308" strokeWidth={4} dot={{ r: 4, fill: '#eab308', strokeWidth: 2, stroke: '#fff' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-100 shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-slate-900 text-lg font-bold">Distribuição Operacional</CardTitle>
                        <CardDescription>Status dos eventos no período</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center pt-4">
                        <div className="h-[240px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                                        {statusData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={['#7c3aed', '#eab308', '#f43f5e', '#3b82f6', '#10b981'][index % 5]} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
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

        <TabsContent value="temporal" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            </div>
        </TabsContent>

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

        <TabsContent value="rankings" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
