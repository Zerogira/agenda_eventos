import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Users, 
  Calendar as CalendarIcon, 
  DollarSign, 
  TrendingUp,
  Package,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockStorage } from "@/lib/mock-storage";
import { Evento } from "@/features/eventos/types";
import { format, subMonths, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";

// Cores para gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function Home() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      // Timeout simulado para evitar loading infinito se a promessa nunca resolver
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 10000)
      );
      
      const dataPromise = mockStorage.getEventos();
      
      const data = await Promise.race([dataPromise, timeoutPromise]) as Evento[];
      
      if (!data) throw new Error("Sem dados");
      
      setEventos(data);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- CÁLCULOS DE INDICADORES ---
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const totalEventos = eventos.length;
  
  // Receita Total
  const receitaTotal = eventos.reduce((acc, curr) => {
    return curr.status !== 'cancelado' ? acc + curr.valor : acc;
  }, 0);

  // Eventos este mês
  const eventosMes = eventos.filter(e => {
    const date = new Date(e.dataInicio);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  // Receita este mês
  const receitaMes = eventosMes.reduce((acc, curr) => {
    return curr.status !== 'cancelado' ? acc + curr.valor : acc;
  }, 0);

  // Eventos futuros
  const eventosFuturos = eventos.filter(e => {
    return isAfter(new Date(e.dataInicio), today) && e.status === 'agendado';
  }).length;

  // Novos clientes (mock - assumindo que cada evento com ID diferente é um cliente "ativo")
  const clientesUnicos = new Set(eventos.map(e => e.clienteId)).size;

  // Ticket Médio
  const ticketMedio = totalEventos > 0 ? receitaTotal / totalEventos : 0;

  // --- DADOS PARA GRÁFICOS ---

  // Eventos por mês (últimos 6 meses)
  const eventosPorMesData = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(today, 5 - i);
    const monthName = format(d, 'MMM', { locale: ptBR });
    const year = d.getFullYear();
    const month = d.getMonth();

    const eventosNoMes = eventos.filter(e => {
      const date = new Date(e.dataInicio);
      return date.getMonth() === month && date.getFullYear() === year;
    });

    const receita = eventosNoMes.reduce((acc, curr) => curr.status !== 'cancelado' ? acc + curr.valor : acc, 0);

    return {
      name: monthName,
      eventos: eventosNoMes.length,
      receita: receita
    };
  });

  // Status dos eventos
  const statusData = [
    { name: 'Agendado', value: eventos.filter(e => e.status === 'agendado').length },
    { name: 'Concluído', value: eventos.filter(e => e.status === 'concluido').length },
    { name: 'Cancelado', value: eventos.filter(e => e.status === 'cancelado').length },
  ];

  // Ranking de Clientes (Top 5 por valor gasto)
  const clientesRanking = Object.values(eventos.reduce((acc, curr) => {
    if (!acc[curr.clienteId]) {
      acc[curr.clienteId] = { name: curr.clienteNome, total: 0, eventos: 0 };
    }
    if (curr.status !== 'cancelado') {
      acc[curr.clienteId].total += curr.valor;
      acc[curr.clienteId].eventos += 1;
    }
    return acc;
  }, {} as Record<string, { name: string, total: number, eventos: number }>))
  .sort((a, b) => b.total - a.total)
  .slice(0, 5);


  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-muted-foreground">Carregando dashboard...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col h-[50vh] items-center justify-center space-y-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h3 className="text-lg font-semibold">Não foi possível carregar o dashboard</h3>
        <p className="text-muted-foreground max-w-sm">
          Ocorreu um erro ao buscar os dados ou o tempo limite foi excedido. Verifique sua conexão ou tente novamente.
        </p>
        <Button onClick={loadData} variant="outline">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Analítico</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(receitaTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(receitaMes)} neste mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEventos}</div>
            <p className="text-xs text-muted-foreground">
              {eventosFuturos} agendados futuramente
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(ticketMedio)}</div>
            <p className="text-xs text-muted-foreground">
              Por evento realizado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientesUnicos}</div>
            <p className="text-xs text-muted-foreground">
              Base de clientes com eventos
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Eventos por Mês</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={eventosPorMesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="eventos" fill="#8884d8" name="Qtd Eventos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Status dos Eventos</CardTitle>
                <CardDescription>Distribuição atual</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Receita</CardTitle>
              <CardDescription>Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={eventosPorMesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line type="monotone" dataKey="receita" stroke="#82ca9d" name="Receita (R$)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rankings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Clientes</CardTitle>
                <CardDescription>Por valor total gasto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientesRanking.map((cliente, index) => (
                    <div key={index} className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{cliente.name}</p>
                        <p className="text-sm text-muted-foreground">{cliente.eventos} eventos</p>
                      </div>
                      <div className="ml-auto font-medium">
                        {formatCurrency(cliente.total)}
                      </div>
                    </div>
                  ))}
                  {clientesRanking.length === 0 && (
                     <div className="text-center text-muted-foreground py-4">Nenhum cliente com eventos ainda.</div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Placeholder for Brinquedos Ranking - needs more mock data linking events to toys */}
            <Card>
               <CardHeader>
                 <CardTitle>Top Brinquedos (Simulado)</CardTitle>
                 <CardDescription>Mais alugados no período</CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Package className="h-9 w-9 text-muted-foreground mr-4" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Pula Pula Inflável</p>
                        <p className="text-sm text-muted-foreground">15 locações</p>
                      </div>
                      <div className="ml-auto font-medium">R$ 4.500,00</div>
                    </div>
                    <div className="flex items-center">
                      <Package className="h-9 w-9 text-muted-foreground mr-4" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Piscina de Bolinhas</p>
                        <p className="text-sm text-muted-foreground">12 locações</p>
                      </div>
                      <div className="ml-auto font-medium">R$ 2.400,00</div>
                    </div>
                    <div className="flex items-center">
                      <Package className="h-9 w-9 text-muted-foreground mr-4" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Tobogã Grande</p>
                        <p className="text-sm text-muted-foreground">8 locações</p>
                      </div>
                      <div className="ml-auto font-medium">R$ 3.200,00</div>
                    </div>
                  </div>
               </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
