import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, AlertTriangle, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { useEventos } from '@/features/eventos/api/use-eventos';
import { useBrinquedos } from '@/features/brinquedos/api/use-brinquedos';
import { parseISO, isAfter, isBefore, differenceInMinutes } from 'date-fns';

export function OperationalInsight() {
  const { data: eventos = [] } = useEventos();
  const { data: brinquedos = [] } = useBrinquedos();

  const insight = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Filtrar eventos de hoje
    const todayEvents = eventos.filter(e => {
      const d = parseISO(e.dataInicio);
      const eventDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return eventDay.getTime() === startOfToday.getTime() && e.status !== 'CANCELADO';
    });

    if (todayEvents.length === 0) {
      return {
        icon: CheckCircle2,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100',
        title: 'Resumo Operacional',
        text: 'Nenhum evento agendado — operação tranquila hoje.'
      };
    }

    // 2. Verificar eventos sem equipe
    const withoutStaff = todayEvents.find(e => !e.funcionarios || e.funcionarios.length === 0);
    if (withoutStaff) {
      return {
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        title: 'Alerta de Equipe',
        text: `Evento "${withoutStaff.titulo}" está sem equipe atribuída.`
      };
    }

    // 3. Verificar eventos em andamento
    const inProgress = todayEvents.filter(e => {
      const start = parseISO(e.dataInicio);
      const end = parseISO(e.dataFim);
      return isAfter(now, start) && isBefore(now, end) && e.status === 'AGENDADO';
    });
    if (inProgress.length > 0) {
      return {
        icon: TrendingUp,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        title: 'Status Atual',
        text: `${inProgress.length} ${inProgress.length === 1 ? 'evento está' : 'eventos estão'} em andamento agora.`
      };
    }

    // 4. Próximo evento (em minutos)
    const nextEvent = todayEvents
      .filter(e => isAfter(parseISO(e.dataInicio), now))
      .sort((a, b) => parseISO(a.dataInicio).getTime() - parseISO(b.dataInicio).getTime())[0];
    
    if (nextEvent) {
      const diff = differenceInMinutes(parseISO(nextEvent.dataInicio), now);
      if (diff <= 60) {
        return {
          icon: Clock,
          color: 'text-amber-600',
          bgColor: 'bg-amber-100',
          title: 'Próxima Ação',
          text: `Próximo evento começa em ${diff} minutos.`
        };
      }
    }

    // 5. Ocupação de Estoque
    const rentedCount = todayEvents.reduce((acc, curr) => {
      return acc + (curr.brinquedos?.length || 0);
    }, 0);
    const totalToys = brinquedos.length || 1;
    const occupancy = Math.round((rentedCount / totalToys) * 100);

    if (occupancy > 70) {
      return {
        icon: TrendingUp,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        title: 'Alta Demanda',
        text: `Hoje você está com ${occupancy}% de ocupação do estoque.`
      };
    }

    // Fallback padrão
    return {
      icon: Lightbulb,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      title: 'Insight do dia',
      text: 'Todos os eventos de hoje estão confirmados e prontos.'
    };
  }, [eventos, brinquedos]);

  const Icon = insight.icon;

  return (
    <Card className="border-slate-200 bg-white shadow-sm overflow-hidden border-t-4 border-t-indigo-500">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${insight.bgColor}`}>
            <Icon className={`h-4 w-4 ${insight.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">{insight.title}</h4>
            <p className="text-xs font-bold text-slate-700 truncate tracking-tight">
              {insight.text}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
