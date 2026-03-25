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

import { differenceInDays, isBefore } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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

  const copyToClipboard = (text: string, isFullLink = false) => {
    const content = isFullLink ? `${window.location.origin}/register?code=${text}` : text;
    navigator.clipboard.writeText(content);
    toast.success(isFullLink ? "Link completo copiado!" : "Código copiado!");
  };

  if (loadingConvites) return (
    <div className="flex items-center justify-center h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-xl font-black text-slate-900">Gerenciar Convites</h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Códigos de acesso para novas organizações</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest px-6 shadow-lg shadow-indigo-100">
              <Plus className="mr-2 h-4 w-4 stroke-[3px]" /> Novo Convite
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tight">Gerar Convite para Empresa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="empresa" className="text-xs font-black uppercase text-slate-500">Empresa Destino</Label>
                <Select value={empresaId} onValueChange={setEmpresaId} required>
                  <SelectTrigger className="font-bold border-slate-200 focus:ring-indigo-500">
                    <SelectValue placeholder="Selecione a empresa" />
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
              <div className="space-y-2">
                <Label htmlFor="expires" className="text-xs font-black uppercase text-slate-500">Expira em (dias)</Label>
                <Input
                  id="expires"
                  type="number"
                  min="1"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  className="font-bold border-slate-200 focus:border-indigo-500"
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 font-black uppercase text-xs tracking-widest h-11" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Gerar Código"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden border-t-4 border-t-indigo-600">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Código</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Empresa</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Criado em</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Expiração</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {convites?.map((convite, idx) => {
              const expiresDate = new Date(convite.expiresAt);
              const isExpired = isBefore(expiresDate, new Date());
              const daysLeft = differenceInDays(expiresDate, new Date());

              return (
                <TableRow key={convite.id} className={cn("hover:bg-slate-50/50 border-slate-100 transition-colors", idx % 2 === 0 ? "bg-white" : "bg-slate-50/20")}>
                  <TableCell className="py-4">
                    <code className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[11px] font-black border border-indigo-100">{convite.codigo}</code>
                  </TableCell>
                  <TableCell className="font-bold text-slate-900">{convite.empresa.nome}</TableCell>
                  <TableCell className="text-slate-500 font-medium text-xs">{format(new Date(convite.createdAt), "dd/MM/yy", { locale: ptBR })}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-slate-700 font-bold text-xs">{format(expiresDate, "dd/MM/yy", { locale: ptBR })}</span>
                      {!convite.usado && !isExpired && (
                        <span className={cn("text-[9px] font-black uppercase", daysLeft <= 5 ? "text-red-500" : "text-slate-400")}>
                          {daysLeft <= 0 ? "Expira hoje" : `Expira em ${daysLeft} dias`}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {convite.usado ? (
                      <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 text-[10px] font-black uppercase px-2">Usado</Badge>
                    ) : isExpired ? (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] font-black uppercase px-2">Expirado</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-black uppercase px-2">Ativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50"
                        onClick={() => copyToClipboard(convite.codigo)}
                        title="Copiar Código"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50"
                        onClick={() => copyToClipboard(convite.codigo, true)}
                        title="Copiar Link de Registro"
                      >
                        <Plus className="h-4 w-4 rotate-45" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {convites?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
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
