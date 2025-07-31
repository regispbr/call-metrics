
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  empresas?: string[];
  status?: string[];
  prioridades?: string[];
  categorias?: string[];
  subcategorias?: string[];
  equipesAtendimento?: string[];
  atendentes?: string[];
  tiposRegistro?: string[];
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
  const [pendingFilters, setPendingFilters] = useState<ActiveFilters>(activeFilters);

  const handleFilterChange = (key: keyof ActiveFilters, value: string) => {
    const newFilters = { ...pendingFilters };
    if (key === "dataInicio" || key === "dataFim") {
      if (value === "") {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
    }
    setPendingFilters(newFilters);
  };

  const handleMultiSelectChange = (key: keyof ActiveFilters, value: string, checked: boolean) => {
    const newFilters = { ...pendingFilters };
    const currentValues = (newFilters[key] as string[]) || [];
    
    if (checked) {
      newFilters[key] = [...currentValues, value] as any;
    } else {
      const filteredValues = currentValues.filter(v => v !== value);
      if (filteredValues.length === 0) {
        delete newFilters[key];
      } else {
        newFilters[key] = filteredValues as any;
      }
    }
    
    setPendingFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(pendingFilters);
  };

  const clearAllFilters = () => {
    setPendingFilters({});
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  const getSelectedCount = (key: keyof ActiveFilters) => {
    const values = pendingFilters[key] as string[];
    return values?.length || 0;
  };

  const CheckboxFilter = ({ 
    label, 
    filterKey, 
    options 
  }: { 
    label: string;
    filterKey: keyof ActiveFilters;
    options: string[];
  }) => {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="max-h-32 overflow-y-auto space-y-2 border rounded-md p-2">
          {options.map((option) => {
            const isSelected = (pendingFilters[filterKey] as string[])?.includes(option) || false;
            return (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${filterKey}-${option}`}
                  checked={isSelected}
                  onCheckedChange={(checked) => 
                    handleMultiSelectChange(filterKey, option, checked as boolean)
                  }
                />
                <label 
                  htmlFor={`${filterKey}-${option}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {option}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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
            <Button 
              onClick={applyFilters}
              size="sm"
            >
              Aplicar Filtros
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
                value={pendingFilters.dataInicio || ""}
                onChange={(e) => handleFilterChange("dataInicio", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={pendingFilters.dataFim || ""}
                onChange={(e) => handleFilterChange("dataFim", e.target.value)}
              />
            </div>

            <CheckboxFilter
              label="Empresa"
              filterKey="empresas"
              options={filterOptions.empresas}
            />

            <CheckboxFilter
              label="Status"
              filterKey="status"
              options={filterOptions.status}
            />

            <CheckboxFilter
              label="Prioridade"
              filterKey="prioridades"
              options={filterOptions.prioridades}
            />

            <CheckboxFilter
              label="Categoria"
              filterKey="categorias"
              options={filterOptions.categorias}
            />

            <CheckboxFilter
              label="Equipe"
              filterKey="equipesAtendimento"
              options={filterOptions.equipesAtendimento}
            />

            <CheckboxFilter
              label="Atendente"
              filterKey="atendentes"
              options={filterOptions.atendentes}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
};
