import { 
  Users, 
  Calendar as CalendarIcon, 
  Package,
  FileText,
  Activity,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { WeatherCard } from "@/features/dashboard/components/WeatherCard";
import { StockStatusCard } from "@/features/dashboard/components/StockStatusCard";
import { TodayEventsCard } from "@/features/dashboard/components/TodayEventsCard";
import { AlertsCard } from "@/features/dashboard/components/AlertsCard";
import { EventsMapCard } from "@/features/dashboard/components/EventsMapCard";

export function Home() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Painel Operacional</h2>
          <p className="text-muted-foreground">Visão geral do dia e alertas do sistema</p>
        </div>
      </div>

      {/* Linha 1: Status Críticos e Clima */}
      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-4 lg:col-span-3">
            <WeatherCard />
        </div>
        <div className="md:col-span-8 lg:col-span-9">
            <StockStatusCard />
        </div>
      </div>

      {/* Linha 2: Eventos do Dia e Alertas */}
      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8 lg:col-span-8">
            <TodayEventsCard />
        </div>
        <div className="md:col-span-4 lg:col-span-4">
            <AlertsCard />
        </div>
      </div>

      {/* Linha 3: Mapa */}
      <div className="grid gap-6 md:grid-cols-1">
        <div className="h-[400px]">
              <EventsMapCard />
        </div>
      </div>
    </div>
  );
}
