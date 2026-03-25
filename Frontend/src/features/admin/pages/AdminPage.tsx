import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompaniesPage } from "./CompaniesPage";
import { InvitesPage } from "./InvitesPage";
import { SearchPage } from "./SearchPage";
import { AuditPage } from "./AuditPage";

export function AdminPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pt-2">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black tracking-tight text-slate-900">Administração SaaS</h2>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Gestão global da plataforma e auditoria</p>
      </div>

      <Tabs defaultValue="empresas" className="w-full">
        <TabsList className="flex w-full lg:w-fit bg-slate-100/50 p-1 rounded-xl border border-slate-200/60 mb-6">
          <TabsTrigger 
            value="empresas" 
            className="flex-1 lg:px-8 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-b-indigo-600 text-slate-500 hover:text-slate-700"
          >
            Empresas
          </TabsTrigger>
          <TabsTrigger 
            value="convites" 
            className="flex-1 lg:px-8 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-b-indigo-600 text-slate-500 hover:text-slate-700"
          >
            Convites
          </TabsTrigger>
          <TabsTrigger 
            value="buscador" 
            className="flex-1 lg:px-8 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-b-indigo-600 text-slate-500 hover:text-slate-700"
          >
            Buscador
          </TabsTrigger>
          <TabsTrigger 
            value="auditoria" 
            className="flex-1 lg:px-8 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-b-indigo-600 text-slate-500 hover:text-slate-700"
          >
            Auditoria
          </TabsTrigger>
        </TabsList>

        <div className="mt-0">
          <TabsContent value="empresas" className="mt-0 focus-visible:outline-none">
            <CompaniesPage />
          </TabsContent>
          <TabsContent value="convites" className="mt-0 focus-visible:outline-none">
            <InvitesPage />
          </TabsContent>
          <TabsContent value="buscador" className="mt-0 focus-visible:outline-none">
            <SearchPage />
          </TabsContent>
          <TabsContent value="auditoria" className="mt-0 focus-visible:outline-none">
            <AuditPage />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
