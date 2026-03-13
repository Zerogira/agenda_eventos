import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Package, Users } from 'lucide-react';
import { useEventos } from '@/features/eventos/api/use-eventos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export function TodayEventsCard() {
  const { data: eventos = [] } = useEventos();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayEvents = eventos.filter(e => {
    const d = new Date(e.dataInicio);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime() && e.status !== 'CANCELADO';
  }).sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime());

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">Eventos de Hoje</CardTitle>
        <Badge variant="outline" className="text-xs font-normal">
            {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </Badge>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {todayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                <Calendar className="h-10 w-10 mb-2 opacity-20" />
                <p>Nenhum evento agendado para hoje.</p>
                <Link to="/eventos" className="mt-4 text-sm text-primary hover:underline">Ver agenda completa</Link>
            </div>
        ) : (
            <div className="space-y-4">
                {todayEvents.map(event => (
                    <Link to={`/eventos?id=${event.id}`} key={event.id} className="block group">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors shadow-sm">
                            {/* Time */}
                            <div className="flex items-center gap-2 min-w-[100px] text-muted-foreground font-medium">
                                <Clock className="h-4 w-4" />
                                <span>{format(new Date(event.dataInicio), "HH:mm")}</span>
                            </div>

                            {/* Main Info */}
                            <div className="flex-1">
                                <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">{event.titulo}</h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <span className="font-medium text-foreground">{event.clienteNome}</span>
                                    {event.clienteNome && <span>•</span>}
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        <span>São José do Rio Preto</span> 
                                        {/* TODO: Add location field to Evento */}
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground border-t md:border-t-0 md:border-l pt-2 md:pt-0 md:pl-4 mt-2 md:mt-0">
                                <div className="flex items-center gap-1" title="Brinquedos">
                                    <Package className="h-4 w-4" />
                                    <span className="font-medium">{event.brinquedos?.reduce((acc: number, b: any) => acc + (b.quantidade || 1), 0) || 0}</span>
                                </div>
                                <div className="flex items-center gap-1" title="Funcionários">
                                    <Users className="h-4 w-4" />
                                    <span className="font-medium">{event.funcionarios?.length || 0}</span>
                                </div>
                                <Badge variant={event.status === 'CONCLUIDO' ? 'secondary' : 'default'} className="ml-auto md:ml-0">
                                    {event.status}
                                </Badge>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
