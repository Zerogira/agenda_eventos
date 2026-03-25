import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Search, Eye, Filter } from "lucide-react";
import { useAuditLogs, AuditLog } from "../api/use-audit";
import { cn } from "@/lib/utils";

export function AuditPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    action: "",
    resource: "",
    userId: "",
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data, isLoading, isError } = useAuditLogs(page, filters);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset page on filter change
  };

  const getActionBadge = (action: string) => {
    if (action.includes("CREATE")) return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-black uppercase px-2">Create</Badge>;
    if (action.includes("UPDATE")) return <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[9px] font-black uppercase px-2">Update</Badge>;
    if (action.includes("DELETE")) return <Badge className="bg-red-50 text-red-700 border-red-200 text-[9px] font-black uppercase px-2">Delete</Badge>;
    if (action.includes("LOGIN")) return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[9px] font-black uppercase px-2">Login</Badge>;
    return <Badge variant="outline" className="text-[9px] font-black uppercase px-2">{action}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-xl font-black text-slate-900">Auditoria do Sistema</h3>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Registro de todas as operações e acessos</p>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden border-t-4 border-t-indigo-600">
        <CardHeader className="bg-slate-50/30 border-b border-slate-100 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Filtrar por Recurso (ex: Evento)" 
                className="pl-10 font-bold border-slate-200 focus:border-indigo-500"
                value={filters.resource}
                onChange={(e) => handleFilterChange("resource", e.target.value)}
              />
            </div>
            <div className="flex-1 relative">
              <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Filtrar por Ação (ex: CREATE)" 
                className="pl-10 font-bold border-slate-200 focus:border-indigo-500"
                value={filters.action}
                onChange={(e) => handleFilterChange("action", e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : isError ? (
            <div className="text-center text-red-500 py-12 font-bold uppercase text-xs tracking-widest">
              Erro ao carregar logs de auditoria.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Data/Hora</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Usuário</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Ação</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Recurso</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">IP</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4 text-right">Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                          Nenhum registro encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data?.data.map((log, idx) => (
                        <TableRow key={log.id} className={cn("hover:bg-slate-50/50 border-slate-100 transition-colors", idx % 2 === 0 ? "bg-white" : "bg-slate-50/20")}>
                          <TableCell className="py-4">
                            <div className="flex flex-col">
                              <span className="text-slate-900 font-bold text-xs">{format(new Date(log.createdAt), "dd/MM/yy")}</span>
                              <span className="text-[10px] text-slate-400 font-medium">{format(new Date(log.createdAt), "HH:mm:ss")}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-slate-900 font-bold text-xs">{log.user?.nome || "Sistema"}</span>
                              <span className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">{log.user?.email || "automático"}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getActionBadge(log.action)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-transparent text-[10px] font-black uppercase px-2">{log.resource}</Badge>
                          </TableCell>
                          <TableCell className="text-slate-500 font-mono text-[10px]">{log.ipAddress || "-"}</TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-xl font-black tracking-tight">Detalhes do Log</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6 pt-4">
                                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="space-y-1">
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data e Hora</span>
                                      <p className="text-sm font-bold text-slate-700">{format(new Date(log.createdAt), "PPP 'às' HH:mm:ss", { locale: ptBR })}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID do Log</span>
                                      <p className="text-[10px] font-mono text-slate-500 break-all">{log.id}</p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 px-1">
                                    <div className="space-y-1">
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação</span>
                                      <div>{getActionBadge(log.action)}</div>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recurso</span>
                                      <p className="text-sm font-bold text-slate-700">{log.resource} ({log.resourceId || "N/A"})</p>
                                    </div>
                                  </div>

                                  <div className="space-y-4 px-1">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Endereço IP</span>
                                        <p className="text-sm font-bold text-slate-700 mt-1">{log.ipAddress}</p>
                                      </div>
                                      <div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User Agent</span>
                                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed break-all font-medium">{log.userAgent}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payload de Dados (JSON)</h4>
                                        <code className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">RAW_DATA</code>
                                      </div>
                                      <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap font-mono bg-slate-900 text-indigo-200 p-4 max-h-[300px]">
                                        {JSON.stringify(log.details, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between p-4 bg-slate-50/50 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Página {page} de {data?.meta.lastPage || 1}
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-bold border-slate-200 text-slate-600"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-bold border-slate-200 text-slate-600"
                    onClick={() => setPage(p => Math.min(data?.meta.lastPage || 1, p + 1))}
                    disabled={page === (data?.meta.lastPage || 1)}
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
