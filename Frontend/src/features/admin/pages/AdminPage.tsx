import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompaniesPage } from "./CompaniesPage";
import { InvitesPage } from "./InvitesPage";
import { SearchPage } from "./SearchPage";
import { AuditPage } from "./AuditPage";

export function AdminPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Administração SaaS</h2>
      <Tabs defaultValue="empresas" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="empresas">Empresas</TabsTrigger>
          <TabsTrigger value="convites">Convites</TabsTrigger>
          <TabsTrigger value="buscador">Buscador</TabsTrigger>
          <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
        </TabsList>
        <div className="bg-white rounded-lg p-6 shadow-sm border min-h-[500px]">
          <TabsContent value="empresas" className="mt-0">
            <CompaniesPage />
          </TabsContent>
          <TabsContent value="convites" className="mt-0">
            <InvitesPage />
          </TabsContent>
          <TabsContent value="buscador" className="mt-0">
            <SearchPage />
          </TabsContent>
          <TabsContent value="auditoria" className="mt-0">
            <AuditPage />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
