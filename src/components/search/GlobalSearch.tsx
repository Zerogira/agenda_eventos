import * as React from "react";
import {
  Calendar,
  Package,
  Briefcase,
  Users,
  Search,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEventos } from "@/features/eventos/api/use-eventos";
import { useClientes } from "@/features/clientes/api/use-clientes";
import { useFuncionarios } from "@/features/funcionarios/api/use-funcionarios";
import { useBrinquedos } from "@/features/brinquedos/api/use-brinquedos";

export function GlobalSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const { data: eventos = [] } = useEventos();
  const { data: clientes = [] } = useClientes();
  const { data: funcionarios = [] } = useFuncionarios();
  const { data: brinquedos = [] } = useBrinquedos();

  const safeEventos = Array.isArray(eventos) ? eventos : [];
  const safeClientes = Array.isArray(clientes) ? clientes : [];
  const safeFuncionarios = Array.isArray(funcionarios) ? funcionarios : [];
  const safeBrinquedos = Array.isArray(brinquedos) ? brinquedos : [];

  const filteredResults = React.useMemo(() => {
    if (!search) return { eventos: [], clientes: [], funcionarios: [], brinquedos: [] };

    const lowerSearch = search.toLowerCase();

    return {
      eventos: safeEventos.filter(e => e.titulo.toLowerCase().includes(lowerSearch) || e.clienteNome.toLowerCase().includes(lowerSearch)).slice(0, 3),
      clientes: safeClientes.filter(c => c.nome.toLowerCase().includes(lowerSearch)).slice(0, 3),
      funcionarios: safeFuncionarios.filter(f => f.nome.toLowerCase().includes(lowerSearch)).slice(0, 3),
      brinquedos: safeBrinquedos.filter(b => b.nome.toLowerCase().includes(lowerSearch)).slice(0, 3),
    };
  }, [search, safeEventos, safeClientes, safeFuncionarios, safeBrinquedos]);

  const hasResults = Object.values(filteredResults).some(arr => arr.length > 0);

  const handleSelect = (path: string) => {
    setOpen(false);
    setSearch("");
    navigate(path);
  };

  return (
    <Popover open={open && hasResults} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar eventos, clientes..."
            className="pl-8 w-full bg-background"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value.length > 0) setOpen(true);
              else setOpen(false);
            }}
            onFocus={() => {
                if(search.length > 0) setOpen(true);
            }}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <ScrollArea className="max-h-[300px]">
          <div className="grid gap-1 p-2">
            {filteredResults.eventos.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-muted-foreground px-2 py-1">Eventos</h4>
                {filteredResults.eventos.map((evento) => (
                  <Button
                    key={evento.id}
                    variant="ghost"
                    className="w-full justify-start h-auto py-2 px-2 font-normal"
                    onClick={() => handleSelect('/eventos')}
                  >
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col items-start overflow-hidden">
                      <span className="truncate w-full">{evento.titulo}</span>
                      <span className="text-xs text-muted-foreground truncate w-full">
                        {new Date(evento.dataInicio).toLocaleDateString()} - {evento.clienteNome}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {filteredResults.clientes.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-muted-foreground px-2 py-1">Clientes</h4>
                {filteredResults.clientes.map((cliente) => (
                  <Button
                    key={cliente.id}
                    variant="ghost"
                    className="w-full justify-start h-auto py-2 px-2 font-normal"
                    onClick={() => handleSelect('/clientes')}
                  >
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col items-start">
                      <span>{cliente.nome}</span>
                      <span className="text-xs text-muted-foreground">{cliente.cidade}</span>
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {filteredResults.funcionarios.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-muted-foreground px-2 py-1">Funcionários</h4>
                {filteredResults.funcionarios.map((func) => (
                  <Button
                    key={func.id}
                    variant="ghost"
                    className="w-full justify-start h-auto py-2 px-2 font-normal"
                    onClick={() => handleSelect('/funcionarios')}
                  >
                    <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{func.nome}</span>
                  </Button>
                ))}
              </div>
            )}

            {filteredResults.brinquedos.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-muted-foreground px-2 py-1">Brinquedos</h4>
                {filteredResults.brinquedos.map((brinquedo) => (
                  <Button
                    key={brinquedo.id}
                    variant="ghost"
                    className="w-full justify-start h-auto py-2 px-2 font-normal"
                    onClick={() => handleSelect('/brinquedos')}
                  >
                    <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{brinquedo.nome}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
