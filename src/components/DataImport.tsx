import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, AlertCircle, FileUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";

interface DataImportProps {
  onDataImport: (data: any[]) => void;
}

export const DataImport = ({ onDataImport }: DataImportProps) => {
  const [jsonData, setJsonData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleJsonImport = () => {
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione apenas arquivos CSV.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleCsvImport = () => {
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo CSV antes de importar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      complete: (results) => {
        try {
          if (results.errors.length > 0) {
            console.warn("CSV parsing warnings:", results.errors);
          }

          const data = results.data;
          
          if (!data || data.length === 0) {
            toast({
              title: "Arquivo vazio",
              description: "O arquivo CSV não contém dados válidos.",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }

          // Convert numeric strings to numbers where appropriate
          const processedData = data.map((row: any) => {
            const processedRow = { ...row };
            
            // Convert specific fields to numbers
            if (processedRow["#"]) {
              processedRow["#"] = parseInt(processedRow["#"]);
            }
            if (processedRow["contador de Reabertura"]) {
              processedRow["contador de Reabertura"] = parseInt(processedRow["contador de Reabertura"]);
            }
            
            return processedRow;
          });

          onDataImport(processedData);
          toast({
            title: "Sucesso!",
            description: `${processedData.length} registro(s) importado(s) do CSV com sucesso.`,
          });
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } catch (error) {
          toast({
            title: "Erro de processamento",
            description: "Erro ao processar o arquivo CSV.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        toast({
          title: "Erro de leitura",
          description: "Erro ao ler o arquivo CSV.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    });
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
          Importe seus dados através de arquivo CSV ou colando JSON diretamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="csv" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="csv" className="flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              Upload CSV
            </TabsTrigger>
            <TabsTrigger value="json" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Colar JSON
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="csv" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-file">Selecionar arquivo CSV</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  className="cursor-pointer"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Arquivo selecionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
              
              <Button 
                onClick={handleCsvImport} 
                disabled={isLoading || !selectedFile}
                className="bg-gradient-primary hover:opacity-90"
              >
                {isLoading ? "Importando..." : "Importar CSV"}
              </Button>
            </div>

            <div className="flex items-start gap-2 p-3 bg-success-light rounded-lg">
              <AlertCircle className="h-4 w-4 text-success mt-0.5" />
              <div className="text-sm text-success-foreground">
                <p className="font-medium">Formato CSV esperado:</p>
                <p>Primeira linha deve conter os cabeçalhos das colunas. Use a mesma estrutura das colunas do seu sistema de tickets.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="json" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="json-data">Dados JSON</Label>
                <Textarea
                  id="json-data"
                  placeholder="Cole seus dados JSON aqui..."
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleJsonImport} 
                  disabled={isLoading}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  {isLoading ? "Importando..." : "Importar JSON"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setJsonData(sampleData)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Usar Exemplo
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-info-light rounded-lg">
              <AlertCircle className="h-4 w-4 text-info mt-0.5" />
              <div className="text-sm text-info-foreground">
                <p className="font-medium">Formato JSON esperado:</p>
                <p>Array JSON ou objeto único com as colunas do seu sistema de tickets.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};