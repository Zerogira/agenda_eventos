import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Calendar, Users, Briefcase, Package, LayoutDashboard, FileText, User, LogOut, Bell, Plus, CalendarDays } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { mockStorage } from '@/lib/mock-storage';
import { EventoForm } from '@/features/eventos/components/EventoForm';
import { ClienteForm } from '@/features/clientes/components/ClienteForm';
import { FuncionarioForm } from '@/features/funcionarios/components/FuncionarioForm';
import { BrinquedoForm } from '@/features/brinquedos/components/BrinquedoForm';

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Calendar, label: "Eventos", href: "/eventos" },
  { icon: Calendar, label: "Calendário", href: "/calendario" },
  { icon: Users, label: "Clientes", href: "/clientes" },
  { icon: Briefcase, label: "Funcionários", href: "/funcionarios" },
  { icon: Package, label: "Brinquedos", href: "/brinquedos" },
  { icon: FileText, label: "Relatórios", href: "/relatorios" },
  { icon: User, label: "Perfil", href: "/perfil" },
];

type ModalType = 'evento' | 'cliente' | 'funcionario' | 'brinquedo' | null;

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("Usuário");
  const [nextEvent, setNextEvent] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState<ModalType>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || "Usuário");
      } catch (e) {
        // ignore error
      }
    }

    // Carregar próximo evento para o indicador rápido
    const loadNextEvent = async () => {
      const eventos = await mockStorage.getEventos();
      const now = new Date();
      // Filtra eventos futuros e ordena por data
      const upcoming = eventos
        .filter(e => new Date(e.dataInicio) > now && e.status === 'agendado')
        .sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime());
      
      if (upcoming.length > 0) {
        setNextEvent(upcoming[0]);
      }
    };
    loadNextEvent();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSuccess = () => {
    setModalOpen(null);
    // Recarregar próximo evento se necessário
    // Em uma app real, usaríamos query invalidation
  };

  return (
    <div className="flex h-screen w-full bg-muted/40">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="p-6">
          <h1 className="text-xl font-bold">Agenda Eventos</h1>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                location.pathname === item.href
                  ? "bg-muted text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-col flex-1">
        <header className="flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
          {/* Busca Global */}
          <div className="flex-1 max-w-xl">
            <GlobalSearch />
          </div>

          <div className="flex-1"></div>

          {/* Indicador Rápido de Próximo Evento */}
          {nextEvent && (
            <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full mr-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span>Próximo: <span className="font-medium text-foreground">{nextEvent.titulo}</span></span>
              <span className="text-xs">({new Date(nextEvent.dataInicio).toLocaleDateString()})</span>
            </div>
          )}

          {/* Ações do Header */}
          <div className="flex items-center gap-2">
            
            {/* Botão Criar com Modais */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="hidden sm:flex">
                  <Plus className="mr-2 h-4 w-4" /> Criar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Novo Registro</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setModalOpen('evento')}>
                  Evento
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setModalOpen('cliente')}>
                  Cliente
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setModalOpen('funcionario')}>
                  Funcionário
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setModalOpen('brinquedo')}>
                  Brinquedo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Modais de Criação */}
            <Dialog open={modalOpen === 'evento'} onOpenChange={(open) => !open && setModalOpen(null)}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Novo Evento</DialogTitle>
                </DialogHeader>
                <EventoForm onSuccess={handleSuccess} />
              </DialogContent>
            </Dialog>

            <Dialog open={modalOpen === 'cliente'} onOpenChange={(open) => !open && setModalOpen(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Cliente</DialogTitle>
                </DialogHeader>
                <ClienteForm onSuccess={handleSuccess} />
              </DialogContent>
            </Dialog>

            <Dialog open={modalOpen === 'funcionario'} onOpenChange={(open) => !open && setModalOpen(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Funcionário</DialogTitle>
                </DialogHeader>
                <FuncionarioForm onSuccess={handleSuccess} />
              </DialogContent>
            </Dialog>

            <Dialog open={modalOpen === 'brinquedo'} onOpenChange={(open) => !open && setModalOpen(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Brinquedo</DialogTitle>
                </DialogHeader>
                <BrinquedoForm onSuccess={handleSuccess} />
              </DialogContent>
            </Dialog>

            {/* Notificações */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
            </Button>

            {/* Perfil */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="rounded-full h-8 w-8 bg-primary/10 border-border hover:bg-primary/20 transition-colors"
                >
                  <User className="h-4 w-4 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">admin@empresa.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/perfil')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 bg-muted/10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
