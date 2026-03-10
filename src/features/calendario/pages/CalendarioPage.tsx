import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EventoForm } from "@/features/eventos/components/EventoForm";
import { Evento } from "@/features/eventos/types";
import { useEventos } from "@/features/eventos/api/use-eventos";
import "@/index.css"; 

export function CalendarioPage() {
  const { data: eventos = [], refetch } = useEventos();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedEvento, setSelectedEvento] = useState<Evento | undefined>(undefined);

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr);
    setSelectedEvento(undefined);
    setIsDialogOpen(true);
  };

  const handleEventClick = (arg: any) => {
    const evento = eventos.find((e) => e.id === arg.event.id);
    if (evento) {
      setSelectedEvento(evento);
      setIsDialogOpen(true);
    }
  };

  const calendarEvents = eventos.map((evento) => ({
    id: evento.id,
    title: evento.titulo,
    start: evento.dataInicio,
    end: evento.dataFim,
    // Cores mais vivas e modernas
    backgroundColor:
      evento.status === "concluido"
        ? "#10b981" // emerald-500
        : evento.status === "cancelado"
        ? "#ef4444" // red-500
        : "#3b82f6", // blue-500
    borderColor: "transparent",
    textColor: "#ffffff",
    classNames: ["cursor-pointer", "font-medium", "text-sm", "px-1", "rounded-sm"]
  }));

  return (
    <div className="space-y-6 h-full flex flex-col calendar-page-wrapper">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Calendário</h2>
      </div>

      <div className="flex-1 bg-card rounded-md border p-4 shadow-sm h-[800px]">
        <style>{`
          /* Estilização personalizada para o FullCalendar */
          .fc-event {
            border-radius: 4px;
            padding: 2px 4px;
            border: none;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }
          
          .fc-daygrid-event-dot {
            display: none; /* Remove o ponto padrão */
          }

          .fc-event-title {
            font-weight: 600;
          }

          .fc-col-header-cell {
            background-color: hsl(var(--muted));
            padding: 8px 0;
            color: hsl(var(--foreground));
            text-transform: uppercase;
            font-size: 0.85rem;
          }
          
          .fc-day-today {
            background-color: hsl(var(--accent) / 0.3) !important;
          }

          /* Melhorar a visualização do "more" link (+2 more) */
          .fc-daygrid-more-link {
            font-weight: bold;
            color: hsl(var(--primary));
            text-decoration: none;
            background: hsl(var(--secondary));
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.8rem;
          }
        `}</style>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          locale="pt-br"
          events={calendarEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="100%"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={3} // Limita a 3 eventos por dia, o resto vai para "+X mais"
          moreLinkContent={(args) => `+${args.num} mais`} // Texto personalizado para o link
          eventContent={(eventInfo) => {
            // Personalização do conteúdo do evento
            return (
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                {eventInfo.event.title}
              </div>
            );
          }}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEvento ? "Editar Evento" : "Novo Evento"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <EventoForm
              initialData={selectedEvento ? selectedEvento : selectedDate ? {
                titulo: "",
                descricao: "",
                dataInicio: new Date(selectedDate).toISOString().slice(0, 16),
                dataFim: new Date(selectedDate).toISOString().slice(0, 16),
                clienteId: "",
                status: "agendado",
                valor: 0,
                brinquedos: [],
                funcionarios: []
              } as any : undefined}
              onSuccess={() => {
                setIsDialogOpen(false);
                refetch();
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
