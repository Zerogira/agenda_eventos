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
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import InputMask from "react-input-mask";

export function CompaniesPage() {
  const { data: empresas, isLoading } = useEmpresas();
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
          toast.success("Empresa criada com sucesso!");
          if (data.convite) {
             toast("Código de convite gerado: " + data.convite.codigo, {
                 duration: 10000,
                 action: {
                     label: "Copiar",
                     onClick: () => navigator.clipboard.writeText(data.convite.codigo)
                 }
             });
          }
        },
        onError: () => toast.error("Erro ao criar empresa"),
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
          toast.success("Empresa atualizada com sucesso!");
        },
        onError: () => toast.error("Erro ao atualizar empresa"),
      }
    );
  };

  const handleDelete = () => {
    if (!selectedEmpresa) return;
    deleteEmpresa(selectedEmpresa.id, {
      onSuccess: () => {
        setOpenDelete(false);
        setSelectedEmpresa(null);
        toast.success("Empresa removida com sucesso!");
      },
      onError: () => toast.error("Erro ao remover empresa"),
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
    toast.success("Código copiado!");
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Gerenciar Empresas</h3>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Empresa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-nome">Nome da Empresa</Label>
                <Input
                  id="create-nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-cnpj">CNPJ (Opcional)</Label>
                <InputMask
                  mask="99.999.999/9999-99"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                >
                  {(inputProps: any) => (
                    <Input id="create-cnpj" placeholder="00.000.000/0000-00" {...inputProps} />
                  )}
                </InputMask>
              </div>
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Criar Empresa"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Criada em</TableHead>
              <TableHead className="text-center">Usuários</TableHead>
              <TableHead className="text-center">Eventos</TableHead>
              <TableHead>Convite Ativo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empresas?.map((empresa) => (
              <TableRow key={empresa.id}>
                <TableCell className="font-medium">{empresa.nome}</TableCell>
                <TableCell>{empresa.cnpj || "-"}</TableCell>
                <TableCell>{format(new Date(empresa.createdAt), "dd/MM/yy", { locale: ptBR })}</TableCell>
                <TableCell className="text-center">{empresa._count?.usuarios || 0}</TableCell>
                <TableCell className="text-center">{empresa._count?.eventos || 0}</TableCell>
                <TableCell>
                    {empresa.convites && empresa.convites.length > 0 ? (
                        <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-1 rounded text-xs">{empresa.convites[0].codigo}</code>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(empresa.convites![0].codigo)}>
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                    ) : (
                        <span className="text-muted-foreground text-xs">Nenhum ativo</span>
                    )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(empresa)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => openDeleteModal(empresa)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {empresas?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
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
            <DialogTitle>Editar Empresa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome da Empresa</Label>
              <Input
                id="edit-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cnpj">CNPJ (Opcional)</Label>
              <InputMask
                mask="99.999.999/9999-99"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
              >
                {(inputProps: any) => (
                  <Input id="edit-cnpj" placeholder="00.000.000/0000-00" {...inputProps} />
                )}
              </InputMask>
            </div>
            <DialogFooter>
               <Button type="button" variant="outline" onClick={() => setOpenEdit(false)}>Cancelar</Button>
               <Button type="submit" disabled={isUpdating}>
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
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a empresa <strong>{selectedEmpresa?.nome}</strong>? 
              Essa ação não pode ser desfeita e removerá todos os dados associados (usuários, eventos, clientes, etc).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Deletar Empresa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
