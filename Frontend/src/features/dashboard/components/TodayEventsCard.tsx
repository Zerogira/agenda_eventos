import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Package, Users, AlertCircle, PlayCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useEventos } from '@/features/eventos/api/use-eventos';
import { format, isAfter, isBefore, addHours, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export function TodayEventsCard() {
  const { data: eventos = [] } = useEventos();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const todayEvents = eventos.filter(e => {
    const d = parseISO(e.dataInicio);
    const eventDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return eventDay.getTime() === startOfToday.getTime() && e.status !== 'CANCELADO';
  }).sort((a, b) => parseISO(a.dataInicio).getTime() - parseISO(b.dataInicio).getTime());

  const getEventStatus = (event: any) => {
    if (event.status === 'CONCLUIDO') return { label: 'Concluído', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
    
    const start = parseISO(event.dataInicio);
    const end = parseISO(event.dataFim);
    
    if (isBefore(now, start) && isAfter(addHours(now, 2), start)) {
      return { label: 'Inicia em breve', color: 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse', icon: Clock };
    }
    
    if (isAfter(now, start) && isBefore(now, end)) {
      return { label: 'Em andamento', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: PlayCircle };
    }
    
    if (isAfter(now, start) && event.status === 'AGENDADO') {
      return { label: 'Atrasado', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle };
    }
    
    return { label: 'Agendado', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: Calendar };
  };

  return (
    <Card className="h-full border-slate-200 shadow-sm flex flex-col bg-white overflow-hidden border-t-4 border-t-indigo-600" style={{ height: '600px' }}>
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-6 border-b border-slate-50 bg-slate-50/30 shrink-0">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold text-slate-900">Agenda de Hoje</CardTitle>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            {format(now, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white text-slate-600 border-slate-200 font-bold px-3">
                {todayEvents.length} EVENTOS
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden bg-white flex flex-col min-h-0">
        {todayEvents.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 px-6 bg-slate-50/20">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                    <Calendar className="h-8 w-8 opacity-20" />
                </div>
                <p className="font-semibold text-slate-600">Nenhum evento para hoje</p>
                <p className="text-sm text-slate-400 mt-1">Sua agenda está livre por enquanto.</p>
                <Button variant="outline" className="mt-6 border-indigo-200 text-indigo-600 hover:bg-indigo-50" asChild>
                    <Link to="/eventos">Ver agenda completa</Link>
                </Button>
            </div>
        ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 bg-slate-50/30 min-h-0">
                {todayEvents.map(event => {
                    const status = getEventStatus(event);
                    const StatusIcon = status.icon;
                    
                    return (
                        <Link to={`/eventos?id=${event.id}`} key={event.id} className="block group transition-all duration-200">
                            <div className="p-4 flex items-start gap-4 bg-[#f8f9fb] border border-slate-100 rounded-xl group-hover:bg-[#f1f3f7] group-hover:border-slate-200 group-hover:shadow-sm transition-all">
                                {/* Time Column */}
                                <div className="flex flex-col items-center justify-center min-w-[65px] py-1 border-r border-slate-200/60 pr-4">
                                    <span className="text-lg font-black text-slate-900 leading-none">
                                        {format(parseISO(event.dataInicio), "HH:mm")}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">Início</span>
                                </div>

                                {/* Content Column */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <h4 className="font-bold text-slate-900 truncate text-base group-hover:text-indigo-600 transition-colors">
                                            {event.titulo}
                                        </h4>
                                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border shrink-0 ${status.color}`}>
                                            <StatusIcon className="h-3 w-3" />
                                            {status.label}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                                        <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                                            <Users className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                            <span className="font-bold text-slate-700 truncate">{event.clienteNome || 'Cliente não informado'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                                            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                            <span className="truncate font-medium">{event.cidade || 'BOTUCATU'}</span>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center gap-4 border-t border-slate-200/40 pt-2.5">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                            <Package className="h-3 w-3" />
                                            <span className="text-slate-500">{event.brinquedos?.length || 0} Itens</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                            <Users className="h-3 w-3" />
                                            <span className="text-slate-500">{event.funcionarios?.length || 0} Equipe</span>
                                        </div>
                                        <div className="ml-auto flex items-center text-indigo-500 font-black text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                                            Abrir <ChevronRight className="h-3 w-3 ml-0.5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        )}
      </CardContent>
    </Card>
  );
}

