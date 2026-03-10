import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { Plus, Loader2, Search } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { UseQueryResult } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CrudPageProps<TData, TValue> {
  title: string;
  columns: ColumnDef<TData, TValue>[];
  query: UseQueryResult<TData[], Error>;
  FormComponent: React.ComponentType<{ onSuccess: () => void; initialData?: TData }>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDelete?: (id: string | number) => void;
  filterColumn?: string;
}

export function CrudPage<TData, TValue>({
  title,
  columns,
  query,
  FormComponent,
  filterColumn = "nome",
}: CrudPageProps<TData, TValue>) {
  const [selectedItem, setSelectedItem] = useState<TData | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");

  const handleEdit = (item: TData) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedItem(undefined);
    setIsDialogOpen(true);
  };

  if (query.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (query.isError) {
    return <div>Erro ao carregar dados.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight whitespace-nowrap">{title}</h2>
        
        <div className="flex items-center gap-2 flex-1 justify-end max-w-md">
           {filterColumn && (
             <div className="relative flex-1 max-w-sm">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input
                 placeholder={`Filtrar ${title.toLowerCase()}...`}
                 value={filterValue}
                 onChange={(e) => setFilterValue(e.target.value)}
                 className="pl-8 bg-background"
               />
             </div>
           )}
           <Button onClick={handleCreate}>
             <Plus className="mr-2 h-4 w-4" /> Novo
           </Button>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedItem ? `Editar ${title}` : `Criar ${title}`}</DialogTitle>
          </DialogHeader>
          <FormComponent 
            onSuccess={() => setIsDialogOpen(false)} 
            initialData={selectedItem}
          />
        </DialogContent>
      </Dialog>

      <DataTable 
        columns={columns} 
        data={query.data || []} 
        onRowClick={handleEdit}
        filterColumn={filterColumn}
        filterValue={filterValue}
      />
    </div>
  );
}
