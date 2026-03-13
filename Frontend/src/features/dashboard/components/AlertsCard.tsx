import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, UserX, PenTool as Tool, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useEventos } from '@/features/eventos/api/use-eventos';
import { useBrinquedos } from '@/features/brinquedos/api/use-brinquedos';
import { Link } from 'react-router-dom';
import { isTomorrow, isToday } from 'date-fns';

export function AlertsCard() {
  const { data: eventos = [] } = useEventos();
  const { data: brinquedos = [] } = useBrinquedos();

  const alerts = [];

  // 1. Events tomorrow without staff
  const tomorrowEvents = eventos.filter((e) => {
    const d = new Date(e.dataInicio);
    return isTomorrow(d) && e.status === 'AGENDADO';
  });

  tomorrowEvents.forEach((e) => {
    if (!e.funcionarios || e.funcionarios.length === 0) {
      alerts.push({
        type: 'warning',
        message: `Amanhã: Evento "${e.titulo}" sem equipe`,
        link: `/eventos?id=${e.id}`,
        icon: UserX
      });
    }
  });

  // 2. Events today without staff (Critical)
  const todayEvents = eventos.filter((e) => {
    const d = new Date(e.dataInicio);
    return isToday(d) && e.status === 'AGENDADO';
  });

  todayEvents.forEach((e) => {
    if (!e.funcionarios || e.funcionarios.length === 0) {
      alerts.push({
        type: 'critical',
        message: `HOJE: Evento "${e.titulo}" sem equipe!`,
        link: `/eventos?id=${e.id}`,
        icon: AlertTriangle
      });
    }
  });

  // 3. Toys in maintenance (inactive)
  const maintenanceToys = brinquedos.filter((b) => !b.ativo);
  if (maintenanceToys.length > 0) {
    alerts.push({
      type: 'info',
      message: `${maintenanceToys.length} brinquedo(s) em manutenção`,
      link: '/brinquedos',
      icon: Tool
    });
  }

  return (
    <Card className="h-full border-l-4 border-l-amber-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Avisos Importantes
            </CardTitle>
            {alerts.length > 0 && (
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-medium">
                    {alerts.length}
                </span>
            )}
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[150px] text-muted-foreground">
            <CheckCircle className="h-8 w-8 text-emerald-500 mb-2 opacity-50" />
            <p className="text-sm">Tudo certo por aqui!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert, idx) => (
              <Link to={alert.link} key={idx} className="block group">
                <div className={`flex items-start gap-3 p-3 rounded-md text-sm transition-colors border ${
                    alert.type === 'critical' ? 'bg-red-50 border-red-100 text-red-800 hover:bg-red-100' :
                    alert.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800 hover:bg-amber-100' :
                    'bg-blue-50 border-blue-100 text-blue-800 hover:bg-blue-100'
                }`}>
                  <alert.icon className={`h-5 w-5 mt-0.5 shrink-0 ${
                      alert.type === 'critical' ? 'text-red-600' :
                      alert.type === 'warning' ? 'text-amber-600' :
                      'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <span className="font-medium block leading-tight">{alert.message}</span>
                    <span className="text-xs opacity-70 group-hover:underline mt-1 block">Resolver agora →</span>
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
