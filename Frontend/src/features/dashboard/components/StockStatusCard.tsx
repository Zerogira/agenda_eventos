import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { useBrinquedos } from '@/features/brinquedos/api/use-brinquedos';
import { useEventos } from '@/features/eventos/api/use-eventos';
import { Link } from 'react-router-dom';

export function StockStatusCard() {
  const { data: brinquedos = [] } = useBrinquedos();
  const { data: eventos = [] } = useEventos();

  // 1. Calculate stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayEvents = eventos.filter(e => {
    const d = new Date(e.dataInicio);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime() && e.status !== 'CANCELADO';
  });

  const rentedCount = todayEvents.reduce((acc, curr) => {
    if (curr.brinquedos) {
        return acc + curr.brinquedos.reduce((sum: number, b: any) => sum + (b.quantidade || 1), 0);
    }
    return acc;
  }, 0);

  const totalToys = brinquedos.reduce((acc, curr) => acc + (curr.quantidade_total || 1), 0);
  const maintenanceCount = brinquedos.filter(b => !b.ativo).length;
  const availableCount = Math.max(0, totalToys - rentedCount - maintenanceCount);
  const occupancyRate = totalToys > 0 ? Math.round((rentedCount / totalToys) * 100) : 0;

  return (
    <Link to="/brinquedos" className="block h-full group">
      <Card className="h-full border-slate-200 hover:shadow-md transition-all duration-200 bg-white border-t-4 border-t-emerald-500">
        <CardHeader className="pb-1.5 pt-2.5 px-4 bg-slate-50/30">
          <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
            <span>Status do Estoque</span>
            <Package className="h-3 w-3 text-slate-400" />
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-2.5">
          <div className="flex items-end justify-between mb-2.5">
            <div>
              <div className="text-2xl font-bold text-slate-900 leading-none">{rentedCount} <span className="text-sm font-normal text-slate-400">/ {totalToys}</span></div>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">Brinquedos Alugados</p>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${occupancyRate > 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {occupancyRate}%
              </div>
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Ocupação</p>
            </div>
          </div>
          
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-4">
            <div 
              className={`h-full transition-all duration-500 ${occupancyRate > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${occupancyRate}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700 leading-none">{availableCount}</span>
                <span className="text-[10px] text-slate-400 uppercase">Livres</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700 leading-none">{maintenanceCount}</span>
                <span className="text-[10px] text-slate-400 uppercase">Manutenção</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
