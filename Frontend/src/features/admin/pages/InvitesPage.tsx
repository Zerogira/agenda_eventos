import { useState } from "react";
import { useConvites, useCreateConvite, useEmpresas } from "../api/use-admin";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function InvitesPage() {
  const { data: convites, isLoading: loadingConvites } = useConvites();
  const { data: empresas } = useEmpresas();
  const { mutate: createConvite, isPending } = useCreateConvite();
  const [open, setOpen] = useState(false);
  const [empresaId, setEmpresaId] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("30");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaId) return toast.error("Selecione uma empresa");

    createConvite(
      { empresaId, expiresInDays: parseInt(expiresInDays) },
      {
        onSuccess: () => {
          setOpen(false);
          setEmpresaId("");
          setExpiresInDays("30");
          toast.success("Convite gerado com sucesso!");
        },
        onError: () => toast.error("Erro ao gerar convite"),
      }
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  if (loadingConvites) return <div>Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Gerenciar Convites</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Convite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerar Convite para Empresa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa</Label>
                <Select value={empresaId} onValueChange={setEmpresaId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a empresa" />
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
              <div className="space-y-2">
                <Label htmlFor="expires">Expira em (dias)</Label>
                <Input
                  id="expires"
                  type="number"
                  min="1"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Gerar Código"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Expira em</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {convites?.map((convite) => (
              <TableRow key={convite.id}>
                <TableCell className="font-mono font-medium">{convite.codigo}</TableCell>
                <TableCell>{convite.empresa.nome}</TableCell>
                <TableCell>{format(new Date(convite.createdAt), "dd/MM/yy", { locale: ptBR })}</TableCell>
                <TableCell>{format(new Date(convite.expiresAt), "dd/MM/yy", { locale: ptBR })}</TableCell>
                <TableCell>
                  {convite.usado ? (
                    <span className="text-red-500 text-xs font-medium">Usado</span>
                  ) : new Date(convite.expiresAt) < new Date() ? (
                    <span className="text-orange-500 text-xs font-medium">Expirado</span>
                  ) : (
                    <span className="text-green-500 text-xs font-medium">Ativo</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => copyToClipboard(convite.codigo)}
                    disabled={convite.usado}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {convites?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  Nenhum convite gerado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
