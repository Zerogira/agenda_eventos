import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { mockStorage } from "@/lib/mock-storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function DetailsPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let result;
        // Simulação de busca por ID
        // Na implementação real, usaria useQuery com o ID específico
        switch (type) {
          case "eventos":
            const eventos = await mockStorage.getEventos();
            result = eventos.find((e) => e.id.toString() === id);
            break;
          case "clientes":
            const clientes = await mockStorage.getClientes();
            result = clientes.find((c) => c.id.toString() === id);
            break;
          case "funcionarios":
            const funcionarios = await mockStorage.getFuncionarios();
            result = funcionarios.find((f) => f.id.toString() === id);
            break;
          case "brinquedos":
            const brinquedos = await mockStorage.getBrinquedos();
            result = brinquedos.find((b) => b.id.toString() === id);
            break;
        }
        setData(result);
      } catch (error) {
        console.error("Failed to load details", error);
      } finally {
        setLoading(false);
      }
    };

    if (type && id) {
      loadData();
    }
  }, [type, id]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!data) {
    return <div>Item não encontrado.</div>;
  }

  // Renderiza campos dinamicamente baseado no objeto (apenas visualização)
  const renderFields = () => {
    return Object.entries(data).map(([key, value]) => {
      if (key === "id" || typeof value === "object") return null; // Pula ID e objetos complexos por enquanto
      return (
        <div key={key} className="space-y-2">
          <Label className="capitalize">{key.replace(/_/g, " ")}</Label>
          <Input value={String(value)} readOnly className="bg-muted" />
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight capitalize">
          Detalhes de {type?.slice(0, -1)}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{data.nome || data.titulo || "Detalhes"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {renderFields()}
          
          {/* Tratamento especial para arrays ou objetos se necessário */}
          {data.descricao && (
             <div className="col-span-2 space-y-2">
                <Label>Descrição</Label>
                <Textarea value={data.descricao} readOnly className="bg-muted" />
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
