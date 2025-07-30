import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, X, ChevronDown } from "lucide-react";

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

  const handleFilterChange = (key: keyof ActiveFilters, value: string) => {
    const newFilters = { ...activeFilters };
    if (key === "dataInicio" || key === "dataFim") {
      if (value === "") {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
    }
    onFiltersChange(newFilters);
  };

  const handleMultiSelectChange = (key: keyof ActiveFilters, value: string, checked: boolean) => {
    const newFilters = { ...activeFilters };
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
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  const getSelectedCount = (key: keyof ActiveFilters) => {
    const values = activeFilters[key] as string[];
    return values?.length || 0;
  };

  const getDisplayText = (key: keyof ActiveFilters, placeholder: string) => {
    const count = getSelectedCount(key);
    if (count === 0) return placeholder;
    if (count === 1) return (activeFilters[key] as string[])[0];
    return `${count} selecionados`;
  };

  const MultiSelectFilter = ({ 
    label, 
    filterKey, 
    options, 
    placeholder 
  }: { 
    label: string;
    filterKey: keyof ActiveFilters;
    options: string[];
    placeholder: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between text-left font-normal"
          >
            <span className="truncate">
              {getDisplayText(filterKey, placeholder)}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <div className="max-h-64 overflow-y-auto p-2">
            {options.map((option) => (
              <div key={option} className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm">
                <Checkbox
                  id={`${filterKey}-${option}`}
                  checked={(activeFilters[filterKey] as string[])?.includes(option) || false}
                  onCheckedChange={(checked) => 
                    handleMultiSelectChange(filterKey, option, checked as boolean)
                  }
                />
                <label 
                  htmlFor={`${filterKey}-${option}`}
                  className="text-sm flex-1 cursor-pointer"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );

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

            <MultiSelectFilter
              label="Empresa"
              filterKey="empresas"
              options={filterOptions.empresas}
              placeholder="Todas as empresas"
            />

            <MultiSelectFilter
              label="Status"
              filterKey="status"
              options={filterOptions.status}
              placeholder="Todos os status"
            />

            <MultiSelectFilter
              label="Prioridade"
              filterKey="prioridades"
              options={filterOptions.prioridades}
              placeholder="Todas as prioridades"
            />

            <MultiSelectFilter
              label="Categoria"
              filterKey="categorias"
              options={filterOptions.categorias}
              placeholder="Todas as categorias"
            />

            <MultiSelectFilter
              label="Equipe"
              filterKey="equipesAtendimento"
              options={filterOptions.equipesAtendimento}
              placeholder="Todas as equipes"
            />

            <MultiSelectFilter
              label="Atendente"
              filterKey="atendentes"
              options={filterOptions.atendentes}
              placeholder="Todos os atendentes"
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
};