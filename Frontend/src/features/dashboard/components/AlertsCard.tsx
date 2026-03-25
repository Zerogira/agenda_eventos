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
    <Card className={`h-full border-slate-200 bg-white transition-all duration-300 border-t-4 border-t-orange-500`}>
      <CardHeader className="pb-1.5 pt-2.5 px-4 bg-slate-50/30">
        <div className="flex items-center justify-between">
            <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <AlertCircle className="h-3 w-3 text-slate-400" />
            Avisos Importantes
            </CardTitle>
            {alerts.length > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded-full font-black">
                    {alerts.length} ALERTAS
                </span>
            )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-2.5">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[120px] text-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200 px-4">
            <CheckCircle className="h-6 w-6 text-emerald-500 mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-600">Nenhum alerta</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">Operação está estável</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert, idx) => (
              <Link to={alert.link} key={idx} className="block group">
                <div className={`flex items-start gap-3 p-2.5 rounded-md text-sm transition-colors border ${
                    alert.type === 'critical' ? 'bg-red-50/50 border-red-100 text-red-900 hover:bg-red-50' :
                    alert.type === 'warning' ? 'bg-amber-50/50 border-amber-100 text-amber-900 hover:bg-amber-50' :
                    'bg-blue-50/50 border-blue-100 text-blue-900 hover:bg-blue-50'
                }`}>
                  <alert.icon className={`h-4 w-4 mt-0.5 shrink-0 ${
                      alert.type === 'critical' ? 'text-red-600' :
                      alert.type === 'warning' ? 'text-amber-600' :
                      'text-blue-600'
                  }`} />
                  <div className="flex-1 overflow-hidden">
                    <span className="font-semibold block leading-tight truncate text-xs">{alert.message}</span>
                    <span className="text-[10px] opacity-70 group-hover:underline mt-1 block uppercase font-bold">Resolver agora →</span>
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
