import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  Users, 
  Briefcase, 
  Package, 
  LayoutDashboard, 
  FileText, 
  User, 
  LogOut, 
  Bell, 
  Plus, 
  CalendarDays, 
  Shield,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { EventoForm } from '@/features/eventos/components/EventoForm';
import { ClienteForm } from '@/features/clientes/components/ClienteForm';
import { FuncionarioForm } from '@/features/funcionarios/components/FuncionarioForm';
import { BrinquedoForm } from '@/features/brinquedos/components/BrinquedoForm';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Início", href: "/" },
  { icon: Calendar, label: "Eventos", href: "/eventos" },
  { icon: CalendarDays, label: "Calendário", href: "/calendario" },
  { icon: Users, label: "Clientes", href: "/clientes" },
  { icon: Briefcase, label: "Funcionários", href: "/funcionarios" },
  { icon: Package, label: "Brinquedos", href: "/brinquedos" },
  { icon: FileText, label: "Relatórios", href: "/relatorios" },
];

type ModalType = 'evento' | 'cliente' | 'funcionario' | 'brinquedo' | null;

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("Usuário");
  const [userRole, setUserRole] = useState<string>("");
  const [nextEvent, setNextEvent] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || "Usuário");
        setUserRole(user.role || "");
      } catch (e) {
        // ignore error
      }
    }

    const fetchNextEvent = async () => {
      try {
        const { api } = await import('@/lib/api');
        const { data } = await api.get<any>('/eventos');
        
        let eventos: any[] = [];
        if (data && Array.isArray(data)) {
            eventos = data;
        } else if (data && data.success && Array.isArray(data.data)) {
            eventos = data.data;
        } else if (data && data.data && Array.isArray(data.data)) {
            eventos = data.data;
        }
        
        const now = new Date();
        const upcoming = eventos
          .map((e: any) => ({
            ...e,
            dataInicio: e.start || e.dataInicio,
            status: e.status
          }))
          .filter((e: any) => {
            const dataInicio = new Date(e.dataInicio);
            return dataInicio > now && e.status === 'AGENDADO';
          })
          .sort((a: any, b: any) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime());
        
        if (upcoming.length > 0) {
          setNextEvent(upcoming[0]);
        } else {
          setNextEvent(null);
        }
      } catch (e) {
        console.error("Erro ao carregar próximo evento:", e);
      }
    };
    fetchNextEvent();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSuccess = () => {
    setModalOpen(null);
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full bg-slate-50">
        {/* Sidebar */}
        <aside 
          className={cn(
            "hidden flex-col border-r bg-white transition-all duration-300 ease-in-out sm:flex relative shadow-sm group",
            collapsed ? "w-20" : "w-64"
          )}
        >
          {/* Collapse Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "absolute -right-4 top-12 h-8 w-8 rounded-full bg-[#734ebd] text-white shadow-xl z-[1001] border-2 border-white",
              "flex items-center justify-center hover:bg-[#5e3fbd] hover:scale-110 transition-all duration-300 active:scale-95",
              "opacity-0 group-hover:opacity-100"
            )}
          >
            {collapsed ? <ChevronRight className="h-4 w-4 stroke-[3px]" /> : <ChevronLeft className="h-4 w-4 stroke-[3px]" />}
          </Button>

          <div className={cn("p-6 flex items-center", collapsed ? "justify-center" : "justify-start")}>
            {collapsed ? (
              <div className="h-8 w-8 bg-[#734ebd] rounded-lg flex items-center justify-center text-white font-black text-xs shadow-md shadow-purple-200">
                AE
              </div>
            ) : (
              <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <span className="h-8 w-8 bg-[#734ebd] rounded-lg flex items-center justify-center text-white font-black text-xs shadow-md shadow-purple-200 shrink-0">AE</span>
                <span className="truncate">Agenda Eventos</span>
              </h1>
            )}
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.href;
              const content = (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-all group/item relative",
                    isActive
                      ? "bg-purple-50/50 text-[#734ebd] border-l-4 border-[#734ebd] rounded-l-none"
                      : "text-slate-500 hover:text-[#734ebd] hover:bg-slate-50"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-[#734ebd]" : "text-slate-400 group-hover/item:text-[#734ebd]"
                  )} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );

              return collapsed ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    {content}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-bold">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              ) : content;
            })}

            {userRole === 'SUPER_ADMIN' && (
              <>
                <div className="my-4 h-px bg-slate-100 mx-3" />
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to="/admin"
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-all group/item relative",
                          location.pathname.startsWith("/admin")
                            ? "bg-purple-50/50 text-[#734ebd] border-l-4 border-[#734ebd] rounded-l-none"
                            : "text-slate-500 hover:text-[#734ebd] hover:bg-slate-50"
                        )}
                      >
                        <Shield className={cn(
                          "h-5 w-5 shrink-0 transition-colors",
                          location.pathname.startsWith("/admin") ? "text-[#734ebd]" : "text-slate-400 group-hover/item:text-[#734ebd]"
                        )} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-bold">
                      Administração
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Link
                    to="/admin"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-all group/item relative",
                      location.pathname.startsWith("/admin")
                        ? "bg-purple-50/50 text-[#734ebd] border-l-4 border-[#734ebd] rounded-l-none"
                        : "text-slate-500 hover:text-[#734ebd] hover:bg-slate-50"
                    )}
                  >
                    <Shield className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      location.pathname.startsWith("/admin") ? "text-[#734ebd]" : "text-slate-400 group-hover/item:text-[#734ebd]"
                    )} />
                    <span className="truncate">Administração</span>
                  </Link>
                )}
              </>
            )}
          </nav>
        </aside>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex h-16 items-center justify-between gap-4 border-b bg-white px-6 shadow-sm z-20">
            {/* GRUPO 1: Busca Global */}
            <div className="w-full max-w-md">
              <GlobalSearch />
            </div>

            {/* GRUPO 2: Próximo Evento (Centralizado) */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-[#734ebd]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none mb-0.5">Próximo Evento</span>
                {nextEvent ? (
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-xs font-bold text-slate-700 truncate">{nextEvent.titulo}</span>
                    <span className="text-[10px] font-black text-[#734ebd] shrink-0 bg-purple-50 px-1.5 py-0.5 rounded">
                      {new Date(nextEvent.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-400">Nenhum agendado</span>
                )}
              </div>
            </div>

            {/* GRUPO 3: Ações */}
            <div className="flex items-center gap-3">
              {/* Botão Criar com Modais */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    className="bg-[#734ebd] hover:bg-[#5e3fbd] text-white font-black text-[11px] uppercase tracking-wider px-4 h-9 shadow-lg shadow-purple-200 transition-all active:scale-95"
                  >
                    <Plus className="mr-1.5 h-4 w-4 stroke-[3px]" /> Criar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Novo Registro</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="font-bold text-sm py-2 cursor-pointer" onSelect={() => setModalOpen('evento')}>
                    <Calendar className="mr-2 h-4 w-4 text-[#734ebd]" /> Evento
                  </DropdownMenuItem>
                  <DropdownMenuItem className="font-bold text-sm py-2 cursor-pointer" onSelect={() => setModalOpen('cliente')}>
                    <Users className="mr-2 h-4 w-4 text-[#734ebd]" /> Cliente
                  </DropdownMenuItem>
                  <DropdownMenuItem className="font-bold text-sm py-2 cursor-pointer" onSelect={() => setModalOpen('funcionario')}>
                    <Briefcase className="mr-2 h-4 w-4 text-[#734ebd]" /> Funcionário
                  </DropdownMenuItem>
                  <DropdownMenuItem className="font-bold text-sm py-2 cursor-pointer" onSelect={() => setModalOpen('brinquedo')}>
                    <Package className="mr-2 h-4 w-4 text-[#734ebd]" /> Brinquedo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notificações */}
              <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </Button>

              <div className="h-6 w-px bg-slate-100 mx-1" />

              {/* Perfil */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="p-0.5 rounded-full hover:bg-indigo-50 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-100 border-2 border-white">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-black text-slate-900 leading-none">{userName}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">{userRole}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="font-bold py-2 cursor-pointer" onClick={() => navigate('/perfil')}>
                    <User className="mr-2 h-4 w-4 text-slate-400" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 font-bold py-2 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6 bg-slate-50/50">
            <Outlet />
          </main>
        </div>

        {/* Modais de Criação */}
        <Dialog open={modalOpen === 'evento'} onOpenChange={(open) => !open && setModalOpen(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tight">Novo Evento</DialogTitle>
            </DialogHeader>
            <EventoForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>

        <Dialog open={modalOpen === 'cliente'} onOpenChange={(open) => !open && setModalOpen(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tight">Novo Cliente</DialogTitle>
            </DialogHeader>
            <ClienteForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>

        <Dialog open={modalOpen === 'funcionario'} onOpenChange={(open) => !open && setModalOpen(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tight">Novo Funcionário</DialogTitle>
            </DialogHeader>
            <FuncionarioForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>

        <Dialog open={modalOpen === 'brinquedo'} onOpenChange={(open) => !open && setModalOpen(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tight">Novo Brinquedo</DialogTitle>
            </DialogHeader>
            <BrinquedoForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
