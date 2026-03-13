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
  
  // Usar ref para controlar o foco e evitar loop de renderização
  const inputRef = React.useRef<HTMLInputElement>(null);

  const { data: eventos = [] } = useEventos();
  const { data: clientes = [] } = useClientes();
  const { data: funcionarios = [] } = useFuncionarios();
  const { data: brinquedos = [] } = useBrinquedos();

  const safeEventos = Array.isArray(eventos) ? eventos : [];
  const safeClientes = Array.isArray(clientes) ? clientes : [];
  const safeFuncionarios = Array.isArray(funcionarios) ? funcionarios : [];
  const safeBrinquedos = Array.isArray(brinquedos) ? brinquedos : [];

  // Filtragem manual para o dropdown
  const filteredResults = React.useMemo(() => {
    if (!search) return { eventos: [], clientes: [], funcionarios: [], brinquedos: [] };

    const lowerSearch = search.toLowerCase();

    return {
      eventos: safeEventos.filter(e => e.titulo.toLowerCase().includes(lowerSearch) || e.clienteNome?.toLowerCase().includes(lowerSearch)).slice(0, 3),
      clientes: safeClientes.filter(c => c.nome.toLowerCase().includes(lowerSearch)).slice(0, 3),
      funcionarios: safeFuncionarios.filter(f => f.nome.toLowerCase().includes(lowerSearch)).slice(0, 3),
      brinquedos: safeBrinquedos.filter(b => b.nome.toLowerCase().includes(lowerSearch)).slice(0, 3),
    };
  }, [search, safeEventos, safeClientes, safeFuncionarios, safeBrinquedos]);

  const hasResults = Object.values(filteredResults).some(arr => arr.length > 0);

  const handleSelect = (path: string) => {
    setOpen(false);
    setSearch("");
    // Redireciona para a página de detalhes genérica
    // O path já virá formatado como /tipo/id
    navigate(`/detalhes${path}`);
  };

  // Handler para quando o input mudar
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (value.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  // Handler para garantir foco ao clicar
  const handleFocus = () => {
    if (search.length > 0) {
      setOpen(true);
    }
  };

  // Efeito para manter o foco no input se o popover abrir/fechar sem querer
  React.useEffect(() => {
    if (open && inputRef.current) {
       inputRef.current.focus();
    }
  }, [open]);

  return (
    <div className="relative w-full max-w-sm">
      <Popover open={open && hasResults} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Buscar eventos, clientes..."
              className="pl-8 w-full bg-background"
              value={search}
              onChange={handleInputChange}
              onFocus={handleFocus}
              // Importante: impedir que o clique feche o popover imediatamente
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </PopoverTrigger>
        
        {/* onOpenAutoFocus evita que o foco saia do input e vá para o conteúdo do popover */}
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-0" 
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
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
                      onClick={() => handleSelect(`/eventos/${evento.id}`)}
                    >
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col items-start overflow-hidden w-full">
                        <span className="truncate w-full font-medium">{evento.titulo}</span>
                        <span className="text-xs text-muted-foreground truncate w-full flex justify-between">
                          <span>{new Date(evento.dataInicio).toLocaleDateString()}</span>
                          <span>{evento.clienteNome}</span>
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
                      onClick={() => handleSelect(`/clientes/${cliente.id}`)}
                    >
                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col items-start w-full">
                        <span className="font-medium">{cliente.nome}</span>
                        <span className="text-xs text-muted-foreground truncate w-full">{cliente.cidade}</span>
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
                      onClick={() => handleSelect(`/funcionarios/${func.id}`)}
                    >
                      <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{func.nome}</span>
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
                      onClick={() => handleSelect(`/brinquedos/${brinquedo.id}`)}
                    >
                      <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{brinquedo.nome}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
