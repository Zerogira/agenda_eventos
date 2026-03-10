import { CrudPage } from "@/components/data-table/crud-page";
import { useFuncionarios } from "../api/use-funcionarios";
import { FuncionarioForm } from "../components/FuncionarioForm";
import { ColumnDef } from "@tanstack/react-table";
import { Funcionario } from "../types";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<Funcionario>[] = [
  {
    accessorKey: "nome",
    header: "Nome",
  },
  {
    accessorKey: "cpf",
    header: "CPF",
  },
  {
    accessorKey: "telefone",
    header: "Telefone",
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

export function FuncionariosPage() {
  const query = useFuncionarios();

  return (
    <CrudPage
      title="Funcionários"
      columns={columns}
      query={query}
      FormComponent={FuncionarioForm}
    />
  );
}
