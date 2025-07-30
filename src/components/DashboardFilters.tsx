import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, X } from "lucide-react";

interface FilterOptions {
  empresas: string[];
  status: string[];
  prioridades: string[];
  categorias: string[];
  subcategorias: string[];
  equipesAtendimento: string[];
  atendentes: string[];
  tiposRegistro: string[];
}

interface ActiveFilters {
  empresa?: string;
  status?: string;
  prioridade?: string;
  categoria?: string;
  subcategoria?: string;
  equipeAtendimento?: string;
  atendente?: string;
  tipoRegistro?: string;
  dataInicio?: string;
  dataFim?: string;
}

interface DashboardFiltersProps {
  filterOptions: FilterOptions;
  onFiltersChange: (filters: ActiveFilters) => void;
  activeFilters: ActiveFilters;
}

export const DashboardFilters = ({ 
  filterOptions, 
  onFiltersChange, 
  activeFilters 
}: DashboardFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof ActiveFilters, value: string) => {
    const newFilters = { ...activeFilters };
    if (value === "all" || value === "") {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
            {hasActiveFilters && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                {Object.keys(activeFilters).length}
              </span>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Ocultar" : "Expandir"}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Período */}
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={activeFilters.dataInicio || ""}
                onChange={(e) => handleFilterChange("dataInicio", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={activeFilters.dataFim || ""}
                onChange={(e) => handleFilterChange("dataFim", e.target.value)}
              />
            </div>

            {/* Empresa */}
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select value={activeFilters.empresa || "all"} onValueChange={(value) => handleFilterChange("empresa", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as empresas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as empresas</SelectItem>
                  {filterOptions.empresas.map((empresa) => (
                    <SelectItem key={empresa} value={empresa}>{empresa}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={activeFilters.status || "all"} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {filterOptions.status.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={activeFilters.prioridade || "all"} onValueChange={(value) => handleFilterChange("prioridade", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as prioridades</SelectItem>
                  {filterOptions.prioridades.map((prioridade) => (
                    <SelectItem key={prioridade} value={prioridade}>{prioridade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={activeFilters.categoria || "all"} onValueChange={(value) => handleFilterChange("categoria", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {filterOptions.categorias.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Equipe de Atendimento */}
            <div className="space-y-2">
              <Label>Equipe</Label>
              <Select value={activeFilters.equipeAtendimento || "all"} onValueChange={(value) => handleFilterChange("equipeAtendimento", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as equipes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as equipes</SelectItem>
                  {filterOptions.equipesAtendimento.map((equipe) => (
                    <SelectItem key={equipe} value={equipe}>{equipe}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Atendente */}
            <div className="space-y-2">
              <Label>Atendente</Label>
              <Select value={activeFilters.atendente || "all"} onValueChange={(value) => handleFilterChange("atendente", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os atendentes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os atendentes</SelectItem>
                  {filterOptions.atendentes.map((atendente) => (
                    <SelectItem key={atendente} value={atendente}>{atendente}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};