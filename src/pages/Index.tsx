import { useState, useMemo } from "react";
import { MetricCard } from "@/components/MetricCard";
import { DataImport } from "@/components/DataImport";
import { DashboardFilters } from "@/components/DashboardFilters";
import { ChartCard } from "@/components/ChartCard";
import { useTicketAnalytics } from "@/hooks/useTicketAnalytics";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  TicketIcon, 
  TrendingUp, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Building,
  UserCheck,
  Timer,
  RotateCcw,
  TrendingDown,
  Activity
} from "lucide-react";

const Index = () => {
  const [ticketData, setTicketData] = useState<any[]>([]);
  const [activeFilters, setActiveFilters] = useState({});

  // Filter data based on active filters
  const filteredData = useMemo(() => {
    if (!ticketData.length || !Object.keys(activeFilters).length) {
      return ticketData;
    }

    return ticketData.filter(ticket => {
      for (const [key, value] of Object.entries(activeFilters)) {
        if (!value) continue;
        
        switch (key) {
          case 'empresas':
            if (Array.isArray(value) && value.length && !value.includes(ticket.Empresa)) return false;
            break;
          case 'status':
            if (Array.isArray(value) && value.length && !value.includes(ticket.Status)) return false;
            break;
          case 'prioridades':
            if (Array.isArray(value) && value.length && !value.includes(ticket.Prioridade)) return false;
            break;
          case 'categorias':
            if (Array.isArray(value) && value.length && !value.includes(ticket.Categoria)) return false;
            break;
          case 'equipesAtendimento':
            if (Array.isArray(value) && value.length && !value.includes(ticket["Equipe de atendimento"])) return false;
            break;
          case 'atendentes':
            if (Array.isArray(value) && value.length && !value.includes(ticket["Atendente atribuído"])) return false;
            break;
          case 'dataInicio':
            const ticketDate = new Date(ticket["Data de requisição"].split(" ")[0].split("-").reverse().join("-"));
            const startDate = new Date(value as string);
            if (ticketDate < startDate) return false;
            break;
          case 'dataFim':
            const ticketEndDate = new Date(ticket["Data de requisição"].split(" ")[0].split("-").reverse().join("-"));
            const endDate = new Date(value as string);
            if (ticketEndDate > endDate) return false;
            break;
        }
      }
      return true;
    });
  }, [ticketData, activeFilters]);

  const analytics = useTicketAnalytics(filteredData);

  const handleDataImport = (data: any[]) => {
    setTicketData(data);
    setActiveFilters({});
  };

  const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (!ticketData.length) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Dashboard de Indicadores
            </h1>
            <p className="text-lg text-muted-foreground">
              Sistema estratégico de análise de tickets de suporte
            </p>
          </div>
          <DataImport onDataImport={handleDataImport} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Dashboard Estratégico
            </h1>
            <p className="text-muted-foreground mt-1">
              Análise completa de {analytics.totalTickets} tickets
            </p>
          </div>
          <DataImport onDataImport={handleDataImport} />
        </div>

        {/* Filters */}
        <DashboardFilters
          filterOptions={analytics.filterOptions}
          onFiltersChange={setActiveFilters}
          activeFilters={activeFilters}
        />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total de Tickets"
            value={analytics.totalTickets.toLocaleString()}
            icon={TicketIcon}
            variant="primary"
          />
          <MetricCard
            title="Média/Dia"
            value={analytics.avgRequestsPerDay}
            icon={TrendingUp}
            variant="info"
          />
          <MetricCard
            title="Dia Mais Ativo"
            value={analytics.topDayOfWeek}
            icon={Calendar}
            variant="success"
          />
          <MetricCard
            title="Tickets Reabertos"
            value={`${analytics.reopenedTickets} (${analytics.reopenedPercentage}%)`}
            icon={RotateCcw}
            variant="warning"
          />
        </div>

        {/* Time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Tempo Médio de Resposta"
            value={analytics.avgResponseTime}
            icon={Timer}
          />
          <MetricCard
            title="Tempo Médio de Solução"
            value={analytics.avgSolutionTime}
            icon={CheckCircle}
          />
          <MetricCard
            title="Aguardando Cliente"
            value={analytics.avgWaitingClient}
            icon={Users}
          />
          <MetricCard
            title="Aguardando Fabricante"
            value={analytics.avgWaitingManufacturer}
            icon={Building}
          />
        </div>

        {/* SLA Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard
            title="% Descumprimento SLA"
            value={`${analytics.slaBreachPercentage}%`}
            icon={AlertTriangle}
            variant={analytics.slaBreachPercentage > 20 ? "warning" : "success"}
          />
          <MetricCard
            title="% Tickets Reabertos"
            value={`${analytics.reopenedPercentage}%`}
            icon={TrendingDown}
            variant={analytics.reopenedPercentage > 10 ? "warning" : "success"}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tickets by Priority */}
          <ChartCard title="Tickets por Prioridade" icon={AlertTriangle}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.ticketsByPriority}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.ticketsByPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Tickets by Status */}
          <ChartCard title="Tickets por Status" icon={Activity}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.ticketsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.ticketsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Tickets by Team */}
          <ChartCard title="Tickets por Equipe" icon={Users}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.ticketsPerTeam}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Top Agents */}
          <ChartCard title="Top 10 Atendentes" icon={UserCheck}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.ticketsPerAgent.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Categories */}
          <ChartCard title="Tickets por Categoria" icon={BarChart3}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.ticketsByCategory.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Companies */}
          <ChartCard title="Tickets por Empresa" icon={Building}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.reportsPerCompany.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Response Time by Team */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Tempo de Resposta por Equipe" icon={Timer}>
            <div className="space-y-3">
              {analytics.responseTimeByTeam.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.team}</span>
                  <span className="text-sm text-muted-foreground">{item.avgTime}</span>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Tempo de Solução por Equipe" icon={CheckCircle}>
            <div className="space-y-3">
              {analytics.solutionTimeByTeam.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.team}</span>
                  <span className="text-sm text-muted-foreground">{item.avgTime}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default Index;