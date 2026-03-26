import { useState, useEffect } from "react";
import { useEmpresas, useEmpresaDetails } from "../api/use-admin";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Users, User, Package, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SearchPage() {
  const { data: empresas, isLoading: loadingEmpresas, isError } = useEmpresas();
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>("");
  
  const { data: empresaDetails, isLoading: loadingDetails, isError: isErrorDetails } = useEmpresaDetails(selectedEmpresaId);

  if (loadingEmpresas) return (
    <div className="flex items-center justify-center h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-[#734ebd]" />
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center h-[400px] gap-4">
      <p className="text-red-500 font-bold uppercase text-xs tracking-widest">Erro ao carregar lista de empresas</p>
      <Button onClick={() => window.location.reload()} variant="outline" size="sm">Tentar Novamente</Button>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 p-6 bg-white rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-[#734ebd]">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Search className="h-5 w-5 text-[#734ebd]" />
            Buscador de Organizações
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Selecione uma empresa para auditar seus dados internos</p>
        </div>
        <div className="max-w-md w-full">
          <Select value={selectedEmpresaId} onValueChange={setSelectedEmpresaId}>
            <SelectTrigger id="empresa-select" className="w-full font-bold border-slate-200 focus:ring-[#734ebd] h-11">
              <SelectValue placeholder="Escolha uma empresa para detalhar..." />
            </SelectTrigger>
            <SelectContent>
              {empresas?.map((empresa) => (
                <SelectItem key={empresa.id} value={empresa.id} className="font-medium">
                  {empresa.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loadingDetails ? (
        <div className="flex justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-[#734ebd]" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carregando detalhes...</span>
          </div>
        </div>
      ) : selectedEmpresaId && empresaDetails ? (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <Card className="border-slate-200 shadow-sm bg-white overflow-hidden border-t-2 border-t-[#734ebd]">
               <CardHeader className="pb-2 pt-4 px-4 bg-slate-50/30">
                 <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuários</CardTitle>
               </CardHeader>
               <CardContent className="px-4 pb-4">
                 <div className="text-2xl font-black text-slate-900">{empresaDetails.usuarios?.length || 0}</div>
               </CardContent>
             </Card>
             <Card className="border-slate-200 shadow-sm bg-white overflow-hidden border-t-2 border-t-[#734ebd]">
               <CardHeader className="pb-2 pt-4 px-4 bg-slate-50/30">
                 <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clientes</CardTitle>
               </CardHeader>
               <CardContent className="px-4 pb-4">
                 <div className="text-2xl font-black text-slate-900">{empresaDetails.clientes?.length || 0}</div>
               </CardContent>
             </Card>
             <Card className="border-slate-200 shadow-sm bg-white overflow-hidden border-t-2 border-t-[#734ebd]">
               <CardHeader className="pb-2 pt-4 px-4 bg-slate-50/30">
                 <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Funcionários</CardTitle>
               </CardHeader>
               <CardContent className="px-4 pb-4">
                 <div className="text-2xl font-black text-slate-900">{empresaDetails.funcionarios?.length || 0}</div>
               </CardContent>
             </Card>
             <Card className="border-slate-200 shadow-sm bg-white overflow-hidden border-t-2 border-t-[#734ebd]">
               <CardHeader className="pb-2 pt-4 px-4 bg-slate-50/30">
                 <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CNPJ</CardTitle>
               </CardHeader>
               <CardContent className="px-4 pb-4">
                 <div className="text-sm font-black text-slate-900 truncate">{empresaDetails.cnpj || "N/A"}</div>
               </CardContent>
             </Card>
          </div>

          {/* Users Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Users className="h-4 w-4 text-[#734ebd]" />
                Usuários do Sistema
              </h4>
              <Badge variant="outline" className="bg-purple-50 text-[#734ebd] border-purple-100 font-black text-[10px] uppercase px-2">
                {empresaDetails.usuarios?.length || 0} Total
              </Badge>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-3">Nome</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-3">Email</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-3">Função</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-3">Cadastro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresaDetails.usuarios?.map((user: any, idx: number) => (
                    <TableRow key={user.id} className={cn("hover:bg-slate-50/50 border-slate-100 transition-colors", idx % 2 === 0 ? "bg-white" : "bg-slate-50/20")}>
                      <TableCell className="font-bold text-slate-900 py-3">{user.nome}</TableCell>
                      <TableCell className="text-slate-500 font-medium text-xs">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-[9px] font-black uppercase px-2">{user.role}</Badge>
                      </TableCell>
                      <TableCell className="text-slate-400 font-bold text-[10px]">{format(new Date(user.createdAt), "dd/MM/yy", { locale: ptBR })}</TableCell>
                    </TableRow>
                  ))}
                  {(!empresaDetails.usuarios || empresaDetails.usuarios.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Nenhum usuário encontrado.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Clients Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-500" />
                Clientes Cadastrados
              </h4>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black text-[10px] uppercase px-2">
                {empresaDetails.clientes?.length || 0} Total
              </Badge>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-3">Nome</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-3">Telefone</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-3">Cidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresaDetails.clientes?.map((cliente: any, idx: number) => (
                    <TableRow key={cliente.id} className={cn("hover:bg-slate-50/50 border-slate-100 transition-colors", idx % 2 === 0 ? "bg-white" : "bg-slate-50/20")}>
                      <TableCell className="font-bold text-slate-900 py-3">{cliente.nome}</TableCell>
                      <TableCell className="text-slate-500 font-medium text-xs">{cliente.telefone}</TableCell>
                      <TableCell className="text-slate-700 font-bold text-[10px] uppercase tracking-tighter">{cliente.cidade || "-"}</TableCell>
                    </TableRow>
                  ))}
                  {(!empresaDetails.clientes || empresaDetails.clientes.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Nenhum cliente encontrado.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Employees Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-amber-500" />
                Funcionários
              </h4>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 font-black text-[10px] uppercase px-2">
                {empresaDetails.funcionarios?.length || 0} Total
              </Badge>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-3">Nome</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-3">CPF</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-3">Telefone</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-3">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresaDetails.funcionarios?.map((func: any, idx: number) => (
                    <TableRow key={func.id} className={cn("hover:bg-slate-50/50 border-slate-100 transition-colors", idx % 2 === 0 ? "bg-white" : "bg-slate-50/20")}>
                      <TableCell className="font-bold text-slate-900 py-3">{func.nome}</TableCell>
                      <TableCell className="text-slate-500 font-medium text-xs">{func.cpf}</TableCell>
                      <TableCell className="text-slate-500 font-medium text-xs">{func.telefone}</TableCell>
                      <TableCell>
                        {func.ativo ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-black uppercase px-2">Ativo</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[9px] font-black uppercase px-2">Inativo</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!empresaDetails.funcionarios || empresaDetails.funcionarios.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Nenhum funcionário encontrado.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Toys Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-500" />
                Estoque de Brinquedos
              </h4>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 font-black text-[10px] uppercase px-2">
                {empresaDetails.brinquedos?.length || 0} Total
              </Badge>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-3">Nome</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-3">Marca</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-3">Quantidade</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-3">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresaDetails.brinquedos?.map((brinquedo: any, idx: number) => (
                    <TableRow key={brinquedo.id} className={cn("hover:bg-slate-50/50 border-slate-100 transition-colors", idx % 2 === 0 ? "bg-white" : "bg-slate-50/20")}>
                      <TableCell className="font-bold text-slate-900 py-3">{brinquedo.nome}</TableCell>
                      <TableCell className="text-slate-500 font-medium text-xs">{brinquedo.marca || "-"}</TableCell>
                      <TableCell className="font-bold text-slate-700 text-xs">{brinquedo.quantidade_total}</TableCell>
                      <TableCell>
                        {brinquedo.ativo ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-black uppercase px-2">Ativo</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] font-black uppercase px-2">Manutenção</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!empresaDetails.brinquedos || empresaDetails.brinquedos.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Nenhum brinquedo encontrado.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl">
          <div className="p-4 bg-white rounded-full shadow-sm mb-4 border border-slate-100">
            <Search className="h-8 w-8 text-slate-300" />
          </div>
          <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">Nenhuma empresa selecionada</h4>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">Escolha uma organização acima para ver seus dados internos.</p>
        </div>
      )}
    </div>
  );
}
