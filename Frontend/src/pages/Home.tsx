import { 
  Users, 
  Calendar as CalendarIcon, 
  Package,
  FileText,
  Activity,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { WeatherCard } from "@/features/dashboard/components/WeatherCard";
import { StockStatusCard } from "@/features/dashboard/components/StockStatusCard";
import { TodayEventsCard } from "@/features/dashboard/components/TodayEventsCard";
import { AlertsCard } from "@/features/dashboard/components/AlertsCard";
import { EventsMapCard } from "@/features/dashboard/components/EventsMapCard";
import { OperationalInsight } from "@/features/dashboard/components/OperationalInsight";

export function Home() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pt-2">
      {/* BLOCO 1: Resumo Superior (Alinhado com o grid principal) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Lado Esquerdo: Clima + Estoque (Alinhado com TodayEventsCard) */}
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 lg:col-span-3">
              <WeatherCard />
          </div>
          <div className="md:col-span-8 lg:col-span-9">
              <StockStatusCard />
          </div>
        </div>

        {/* Lado Direito: Alertas (Alinhado com a coluna do Mapa) */}
        <div className="w-full lg:w-[400px]">
            <AlertsCard />
        </div>
      </div>

      {/* BLOCO 2 & 3: Foco do Dia e Mapa */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Foco do Dia (Principal) */}
        <div className="flex-1 w-full lg:w-auto">
            <TodayEventsCard />
        </div>
        
        {/* Mapa (Sempre Visível) */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6 sticky top-6">
            <EventsMapCard />
            
            {/* Insight do Dia (Dinamico) */}
            <OperationalInsight />
        </div>
      </div>
    </div>
  );
}
