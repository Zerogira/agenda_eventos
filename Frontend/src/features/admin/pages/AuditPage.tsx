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

  const getActionColor = (action: string) => {
    if (action.includes("CREATE")) return "default"; // black/white
    if (action.includes("UPDATE")) return "secondary"; // gray
    if (action.includes("DELETE")) return "destructive"; // red
    return "outline";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Auditoria do Sistema</h2>
        <p className="text-muted-foreground">
          Registro de todas as operações realizadas no sistema.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Filtrar por Recurso (ex: Evento)" 
                className="pl-8"
                value={filters.resource}
                onChange={(e) => handleFilterChange("resource", e.target.value)}
              />
            </div>
            <div className="flex-1 relative">
              <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Filtrar por Ação (ex: CREATE)" 
                className="pl-8"
                value={filters.action}
                onChange={(e) => handleFilterChange("action", e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center text-destructive py-8">
              Erro ao carregar logs de auditoria.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Recurso</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                          Nenhum registro encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data?.data.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium text-xs">
                            {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{log.user?.nome || "Sistema/Desconhecido"}</span>
                              <span className="text-xs text-muted-foreground">{log.user?.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getActionColor(log.action) as any}>
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                                <span className="font-medium">{log.resource}</span>
                                <span className="text-xs text-muted-foreground">{log.resourceId}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {log.ipAddress}
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedLog(log)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Detalhes da Auditoria</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-semibold">ID:</span> {log.id}
                                    </div>
                                    <div>
                                      <span className="font-semibold">Data:</span> {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss")}
                                    </div>
                                    <div>
                                      <span className="font-semibold">Usuário:</span> {log.user?.nome} ({log.user?.email})
                                    </div>
                                    <div>
                                      <span className="font-semibold">IP:</span> {log.ipAddress}
                                    </div>
                                    <div>
                                      <span className="font-semibold">User Agent:</span>
                                      <p className="text-xs text-muted-foreground mt-1 break-all">{log.userAgent}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="border rounded-md p-4 bg-muted/30">
                                    <h4 className="text-sm font-semibold mb-2">Dados (JSON)</h4>
                                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap font-mono bg-background p-2 rounded border">
                                      {JSON.stringify(log.details, null, 2)}
                                    </pre>
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
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                >
                  Anterior
                </Button>
                <div className="text-sm text-muted-foreground">
                  Página {page} de {data?.meta.lastPage || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= (data?.meta.lastPage || 1) || isLoading}
                >
                  Próxima
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
