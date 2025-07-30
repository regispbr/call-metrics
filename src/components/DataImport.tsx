import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataImportProps {
  onDataImport: (data: any[]) => void;
}

export const DataImport = ({ onDataImport }: DataImportProps) => {
  const [jsonData, setJsonData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImport = () => {
    if (!jsonData.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, cole os dados JSON antes de importar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Parse JSON data - expect array or single object
      let parsedData = JSON.parse(jsonData);
      
      // If single object, convert to array
      if (!Array.isArray(parsedData)) {
        parsedData = [parsedData];
      }

      onDataImport(parsedData);
      toast({
        title: "Sucesso!",
        description: `${parsedData.length} registro(s) importado(s) com sucesso.`,
      });
      setJsonData("");
    } catch (error) {
      toast({
        title: "Erro de formato",
        description: "Os dados não estão em um formato JSON válido.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sampleData = `[
  {
    "Tipo de Registro de Serviço": "Incidente",
    "#": 133343,
    "Usuário solicitante": "usuario@empresa.com",
    "Data de requisição": "22-07-2025 00:02",
    "Empresa": "Empresa A",
    "Data de encerramento": "22-07-2025 00:14",
    "Prazo de SLA": "01-08-2025 00:02",
    "Status": "Encerrado",
    "Categoria": "SOC",
    "Subcategoria": "SIEM",
    "Tempo de Resposta": "00:00",
    "Tempo de Solução": "00:12",
    "Tempo Aguardando Cliente": "00:00",
    "Tempo Aguardando Fabricante": "00:00",
    "Equipe de atendimento": "[FOR]SOC_N1",
    "Atendente atribuído": "Ana Carla de Souza Araújo",
    "contador de Reabertura": 0,
    "Prioridade": "Baixa (P4)"
  }
]`;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Dados
        </CardTitle>
        <CardDescription>
          Cole seus dados JSON aqui para gerar os indicadores do dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Cole seus dados JSON aqui..."
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleImport} 
            disabled={isLoading}
            className="bg-gradient-primary hover:opacity-90"
          >
            {isLoading ? "Importando..." : "Importar Dados"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setJsonData(sampleData)}
          >
            <FileText className="h-4 w-4 mr-2" />
            Usar Exemplo
          </Button>
        </div>

        <div className="flex items-start gap-2 p-3 bg-info-light rounded-lg">
          <AlertCircle className="h-4 w-4 text-info mt-0.5" />
          <div className="text-sm text-info-foreground">
            <p className="font-medium">Formato esperado:</p>
            <p>Array JSON ou objeto único com as colunas do seu sistema de tickets.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};