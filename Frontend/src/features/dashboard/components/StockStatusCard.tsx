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

  return (
    <Link to="/brinquedos" className="block h-full group">
      <Card className="h-full border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            <span>Status do Estoque (Hoje)</span>
            <Package className="h-4 w-4 text-emerald-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-center mt-2">
            <div className="flex flex-col items-center p-2 bg-emerald-50 rounded-lg">
              <span className="text-2xl font-bold text-emerald-700">{rentedCount}</span>
              <span className="text-xs text-emerald-600 font-medium">Alugados</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-blue-50 rounded-lg">
              <span className="text-2xl font-bold text-blue-700">{availableCount}</span>
              <span className="text-xs text-blue-600 font-medium">Disponíveis</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-amber-50 rounded-lg">
              <span className="text-2xl font-bold text-amber-700">{maintenanceCount}</span>
              <span className="text-xs text-amber-600 font-medium">Manutenção</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
