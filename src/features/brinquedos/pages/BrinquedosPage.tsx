import { CrudPage } from "@/components/data-table/crud-page";
import { useBrinquedos } from "../api/use-brinquedos";
import { BrinquedoForm } from "../components/BrinquedoForm";
import { ColumnDef } from "@tanstack/react-table";
import { Brinquedo } from "../types";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<Brinquedo>[] = [
  {
    accessorKey: "nome",
    header: "Nome",
  },
  {
    accessorKey: "marca",
    header: "Marca",
  },
  {
    accessorKey: "quantidade_total",
    header: "Qtd. Total",
  },
  {
    accessorKey: "necessita_funcionario",
    header: "Monitor?",
    cell: ({ row }) => {
        const needs = row.getValue("necessita_funcionario");
        return needs ? (
            <Badge variant="secondary">Sim</Badge>
        ) : (
            <span className="text-muted-foreground text-sm">Não</span>
        );
    }
  },
  {
    accessorKey: "ativo",
    header: "Status",
    cell: ({ row }) => {
        const isActive = row.getValue("ativo");
        return isActive ? (
            <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>
        ) : (
            <Badge variant="destructive">Inativo</Badge>
        );
    }
  },
];

export function BrinquedosPage() {
  const query = useBrinquedos();

  return (
    <CrudPage
      title="Brinquedos"
      columns={columns}
      query={query}
      FormComponent={BrinquedoForm}
    />
  );
}
