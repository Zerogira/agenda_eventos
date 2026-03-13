import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
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
      console.log(`🔍 Buscando detalhes na API para Type: ${type}, ID: ${id}`);
      try {
        let endpoint = "";
        switch (type) {
          case "eventos":
            endpoint = `/eventos/${id}`;
            break;
          case "clientes":
            endpoint = `/clientes/${id}`;
            break;
          case "funcionarios":
            endpoint = `/funcionarios/${id}`;
            break;
          case "brinquedos":
            endpoint = `/brinquedos/${id}`;
            break;
        }

        if (endpoint) {
           const { data } = await api.get(endpoint);
           console.log("✅ Dados recebidos da API:", data);
           setData(data);
        } else {
            console.warn("Tipo desconhecido:", type);
        }

      } catch (error) {
        console.error("Failed to load details from API", error);
        setData(null);
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
