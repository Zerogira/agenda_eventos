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
import { Loader2, Search, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function SearchPage() {
  const { data: empresas, isLoading: loadingEmpresas } = useEmpresas();
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>("");
  
  const { data: empresaDetails, isLoading: loadingDetails } = useEmpresaDetails(selectedEmpresaId);

  if (loadingEmpresas) return <div>Carregando empresas...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg border shadow-sm">
        <div className="flex-1">
          <Label htmlFor="empresa-select" className="mb-2 block">Selecione uma empresa para visualizar</Label>
          <Select value={selectedEmpresaId} onValueChange={setSelectedEmpresaId}>
            <SelectTrigger id="empresa-select" className="w-full md:w-[400px]">
              <SelectValue placeholder="Selecione uma empresa..." />
            </SelectTrigger>
            <SelectContent>
              {empresas?.map((empresa) => (
                <SelectItem key={empresa.id} value={empresa.id}>
                  {empresa.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loadingDetails ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : selectedEmpresaId && empresaDetails ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium text-muted-foreground">Total Usuários</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold">{empresaDetails.usuarios?.length || 0}</div>
               </CardContent>
             </Card>
             <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium text-muted-foreground">Total Clientes</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold">{empresaDetails.clientes?.length || 0}</div>
               </CardContent>
             </Card>
             <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium text-muted-foreground">CNPJ</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-xl font-bold">{empresaDetails.cnpj || "Não informado"}</div>
               </CardContent>
             </Card>
          </div>

          {/* Users Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Usuários
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                {empresaDetails.usuarios?.length || 0}
              </span>
            </h3>
            <div className="rounded-md border bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Data Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresaDetails.usuarios?.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.nome}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{format(new Date(user.createdAt), "dd/MM/yy", { locale: ptBR })}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" disabled>Editar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!empresaDetails.usuarios || empresaDetails.usuarios.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Nenhum usuário encontrado.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Clients Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Clientes
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                {empresaDetails.clientes?.length || 0}
              </span>
            </h3>
            <div className="rounded-md border bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresaDetails.clientes?.map((cliente: any) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nome}</TableCell>
                      <TableCell>{cliente.telefone}</TableCell>
                      <TableCell>{cliente.cidade}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" disabled>Editar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!empresaDetails.clientes || empresaDetails.clientes.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Nenhum cliente encontrado.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Employees Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Funcionários
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                {empresaDetails.funcionarios?.length || 0}
              </span>
            </h3>
            <div className="rounded-md border bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresaDetails.funcionarios?.map((func: any) => (
                    <TableRow key={func.id}>
                      <TableCell className="font-medium">{func.nome}</TableCell>
                      <TableCell>{func.cpf}</TableCell>
                      <TableCell>{func.telefone}</TableCell>
                      <TableCell>{func.ativo ? "Sim" : "Não"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" disabled>Editar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!empresaDetails.funcionarios || empresaDetails.funcionarios.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Nenhum funcionário encontrado.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Toys Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Brinquedos
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                {empresaDetails.brinquedos?.length || 0}
              </span>
            </h3>
            <div className="rounded-md border bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Qtd Total</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresaDetails.brinquedos?.map((brinquedo: any) => (
                    <TableRow key={brinquedo.id}>
                      <TableCell className="font-medium">{brinquedo.nome}</TableCell>
                      <TableCell>{brinquedo.marca || "-"}</TableCell>
                      <TableCell>{brinquedo.quantidade_total}</TableCell>
                      <TableCell>{brinquedo.ativo ? "Sim" : "Não"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" disabled>Editar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!empresaDetails.brinquedos || empresaDetails.brinquedos.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Nenhum brinquedo encontrado.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
          <Search className="h-12 w-12 mb-4 opacity-20" />
          <p className="text-lg font-medium">Nenhuma empresa selecionada</p>
          <p className="text-sm">Selecione uma empresa acima para visualizar seus detalhes.</p>
        </div>
      )}
    </div>
  );
}
