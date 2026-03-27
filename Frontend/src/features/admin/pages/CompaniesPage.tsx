import { useState } from "react";
import { useEmpresas, useCreateEmpresa, useUpdateEmpresa, useDeleteEmpresa } from "../api/use-admin";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, Copy, Pencil, Trash2 } from "lucide-react";
import { feedback } from "@/lib/toast-utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import InputMask from "react-input-mask";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CompaniesPage() {
  const { data: empresas, isLoading, isError } = useEmpresas();
  const { mutate: createEmpresa, isPending: isCreating } = useCreateEmpresa();
  const { mutate: updateEmpresa, isPending: isUpdating } = useUpdateEmpresa();
  const { mutate: deleteEmpresa, isPending: isDeleting } = useDeleteEmpresa();
  
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  
  const [selectedEmpresa, setSelectedEmpresa] = useState<any>(null);
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createEmpresa(
      { nome, cnpj },
      {
        onSuccess: (data: any) => {
          setOpenCreate(false);
          setNome("");
          setCnpj("");
          feedback.createSuccess("Empresa");
          if (data.convite) {
             feedback.copySuccess("Código de convite: " + data.convite.codigo);
          }
        },
        onError: () => feedback.apiError("Erro ao criar empresa"),
      }
    );
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpresa) return;
    updateEmpresa(
      { id: selectedEmpresa.id, data: { nome, cnpj } },
      {
        onSuccess: () => {
          setOpenEdit(false);
          setSelectedEmpresa(null);
          setNome("");
          setCnpj("");
          feedback.updateSuccess("Empresa");
        },
        onError: () => feedback.apiError("Erro ao atualizar empresa"),
      }
    );
  };

  const handleDelete = () => {
    if (!selectedEmpresa) return;
    deleteEmpresa(selectedEmpresa.id, {
      onSuccess: () => {
        setOpenDelete(false);
        setSelectedEmpresa(null);
        feedback.deleteSuccess("Empresa");
      },
      onError: () => feedback.apiError("Erro ao remover empresa"),
    });
  };

  const openEditModal = (empresa: any) => {
    setSelectedEmpresa(empresa);
    setNome(empresa.nome);
    setCnpj(empresa.cnpj || "");
    setOpenEdit(true);
  };

  const openDeleteModal = (empresa: any) => {
    setSelectedEmpresa(empresa);
    setOpenDelete(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    feedback.copySuccess("Código");
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-[#734ebd]" />
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center h-[400px] gap-4">
      <p className="text-red-500 font-bold uppercase text-xs tracking-widest">Erro ao carregar empresas</p>
      <Button onClick={() => window.location.reload()} variant="outline" size="sm">Tentar Novamente</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-xl font-black text-slate-900">Gerenciar Empresas</h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Listagem e controle de organizações ativas</p>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="bg-[#734ebd] hover:bg-[#5e3fbd] text-white font-black text-xs uppercase tracking-widest px-6 shadow-lg shadow-purple-100">
              <Plus className="mr-2 h-4 w-4 stroke-[3px]" /> Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tight">Criar Nova Empresa</DialogTitle>
              <DialogDescription className="font-medium text-slate-500">Cadastre uma nova organização e gere um convite automático.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="create-nome" className="text-xs font-black uppercase text-slate-500">Nome da Empresa</Label>
                <Input
                  id="create-nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  placeholder="Ex: Eventos Ltda"
                  className="font-bold border-slate-200 focus:border-[#734ebd]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-cnpj" className="text-xs font-black uppercase text-slate-500">CNPJ (Opcional)</Label>
                <InputMask
                  mask="99.999.999/9999-99"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                >
                  {(inputProps: any) => (
                    <Input id="create-cnpj" placeholder="00.000.000/0000-00" className="font-bold border-slate-200 focus:border-[#734ebd]" {...inputProps} />
                  )}
                </InputMask>
              </div>
              <Button type="submit" className="w-full bg-[#734ebd] hover:bg-[#5e3fbd] font-black uppercase text-xs tracking-widest h-11" disabled={isCreating}>
                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Criar Empresa"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden border-t-4 border-t-[#734ebd]">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Nome</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">CNPJ</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4 text-center">Usuários</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4 text-center">Eventos</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Convite Ativo</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empresas?.map((empresa, idx) => {
              const hasUsers = (empresa._count?.usuarios || 0) > 0;

              return (
                <TableRow key={empresa.id} className={cn("hover:bg-slate-50/50 border-slate-100 transition-colors", idx % 2 === 0 ? "bg-white" : "bg-slate-50/20")}>
                  <TableCell className="font-bold text-slate-900 py-4">{empresa.nome}</TableCell>
                  <TableCell className="text-slate-500 font-medium">{empresa.cnpj || "-"}</TableCell>
                  <TableCell>
                    {!hasUsers ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-black uppercase px-2">Sem Usuários</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-black uppercase px-2">Ativa</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-bold text-slate-700">{empresa._count?.usuarios || 0}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-bold text-slate-700">{empresa._count?.eventos || 0}</span>
                  </TableCell>
                  <TableCell>
                      {empresa.convites && empresa.convites.length > 0 ? (
                          <div className="flex items-center gap-2">
                              <code className="bg-purple-50 text-[#734ebd] px-2 py-0.5 rounded text-[10px] font-black border border-purple-100">{empresa.convites[0].codigo}</code>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-purple-400 hover:text-[#734ebd] hover:bg-purple-50" onClick={() => copyToClipboard(empresa.convites![0].codigo)}>
                                  <Copy className="h-3.5 w-3.5" />
                              </Button>
                          </div>
                      ) : (
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter italic">Nenhum ativo</span>
                      )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={() => openEditModal(empresa)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-300 hover:text-red-500 hover:bg-red-50" onClick={() => openDeleteModal(empresa)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {empresas?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                  Nenhuma empresa cadastrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight">Editar Empresa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nome" className="text-xs font-black uppercase text-slate-500">Nome da Empresa</Label>
              <Input
                id="edit-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="font-bold border-slate-200 focus:border-[#734ebd]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cnpj" className="text-xs font-black uppercase text-slate-500">CNPJ (Opcional)</Label>
              <InputMask
                mask="99.999.999/9999-99"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
              >
                {(inputProps: any) => (
                  <Input id="edit-cnpj" placeholder="00.000.000/0000-00" className="font-bold border-slate-200 focus:border-[#734ebd]" {...inputProps} />
                )}
              </InputMask>
            </div>
            <DialogFooter className="gap-2">
               <Button type="button" variant="outline" onClick={() => setOpenEdit(false)} className="font-bold uppercase text-[10px] tracking-widest">Cancelar</Button>
               <Button type="submit" disabled={isUpdating} className="bg-[#734ebd] hover:bg-[#5e3fbd] font-black uppercase text-[10px] tracking-widest">
                 {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar Alterações"}
               </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight">Confirmar Exclusão</DialogTitle>
            <DialogDescription className="font-medium text-slate-500">
              Tem certeza que deseja excluir a empresa <strong>{selectedEmpresa?.nome}</strong>? 
              Essa ação não pode ser desfeita e removerá todos os dados associados (usuários, eventos, clientes, etc).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpenDelete(false)} className="font-bold uppercase text-[10px] tracking-widest">Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-100">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Deletar Empresa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
