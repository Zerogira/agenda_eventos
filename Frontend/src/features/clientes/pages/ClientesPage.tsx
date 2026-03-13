import { CrudPage } from "@/components/data-table/crud-page";
import { useClientes } from "../api/use-clientes";
import { ClienteForm } from "../components/ClienteForm";
import { ColumnDef } from "@tanstack/react-table";
import { Cliente } from "../types";

const columns: ColumnDef<Cliente>[] = [
  {
    accessorKey: "nome",
    header: "Nome",
  },
  {
    accessorKey: "telefone",
    header: "Telefone",
  },
  {
    accessorKey: "cidade",
    header: "Cidade",
  },
];

export function ClientesPage() {
  const query = useClientes();

  return (
    <CrudPage
      title="Clientes"
      columns={columns}
      query={query}
      FormComponent={ClienteForm}
    />
  );
}
