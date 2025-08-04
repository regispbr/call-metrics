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
  Line,
  Legend
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  Activity,
  Filter,
  Search,
  Download,
  FileText
} from "lucide-react";

const Index = () => {
  const [ticketData, setTicketData] = useState<any[]>([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [tableFilters, setTableFilters] = useState({
    id: "",
    tipo: "",
    dataRequisicao: "",
    titulo: "",
    empresa: "",
    equipe: "",
    atendente: "",
    status: ""
  });

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

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(16);
    doc.text('Relatório de Tickets - Dashboard Estratégico', 14, 20);
    
    // Date
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
    
    // Summary metrics
    doc.setFontSize(12);
    doc.text('Resumo Executivo:', 14, 45);
    doc.setFontSize(10);
    doc.text(`Total de Tickets: ${analytics.totalTickets}`, 14, 55);
    doc.text(`Média por Dia: ${analytics.avgRequestsPerDay}`, 14, 65);
    doc.text(`Tickets Reabertos: ${analytics.reopenedTickets} (${analytics.reopenedPercentage}%)`, 14, 75);
    doc.text(`Descumprimento SLA: ${analytics.slaBreachCount} (${analytics.slaBreachPercentage}%)`, 14, 85);
    
    // Tickets table
    const tableData = filteredTableData.slice(0, 50).map(ticket => [
      ticket["#"],
      ticket["Tipo de Registro de Serviço"],
      ticket["Data de requisição"],
      ticket["Título"].substring(0, 30) + (ticket["Título"].length > 30 ? '...' : ''),
      ticket.Empresa,
      ticket.Status
    ]);

    autoTable(doc, {
      head: [['ID', 'Tipo', 'Data', 'Título', 'Empresa', 'Status']],
      body: tableData,
      startY: 100,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [139, 92, 246] },
    });

    doc.save(`relatorio-tickets-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#8b5cf6'];

  // Filter table data based on table filters
  const filteredTableData = useMemo(() => {
    if (!analytics.rawData || analytics.rawData.length === 0) {
      return [];
    }
    
    return analytics.rawData.filter(ticket => {
      return (
        // For active tickets, exclude additional statuses
        !["Deletado", "Mesclado", "Encerrado", "Mesclado e deletado", "Mesclado e Encerrado"].includes(ticket.Status) &&
        (!tableFilters.id || ticket["#"].toString().includes(tableFilters.id)) &&
        (!tableFilters.tipo || ticket["Tipo de Registro de Serviço"].toLowerCase().includes(tableFilters.tipo.toLowerCase())) &&
        (!tableFilters.dataRequisicao || ticket["Data de requisição"].includes(tableFilters.dataRequisicao)) &&
        (!tableFilters.titulo || ticket["Título"].toLowerCase().includes(tableFilters.titulo.toLowerCase())) &&
        (!tableFilters.empresa || ticket.Empresa.toLowerCase().includes(tableFilters.empresa.toLowerCase())) &&
        (!tableFilters.equipe || ticket["Equipe de atendimento"].toLowerCase().includes(tableFilters.equipe.toLowerCase())) &&
        (!tableFilters.atendente || ticket["Atendente atribuído"].toLowerCase().includes(tableFilters.atendente.toLowerCase())) &&
        (!tableFilters.status || ticket.Status.toLowerCase().includes(tableFilters.status.toLowerCase()))
      );
    });
  }, [analytics.rawData, tableFilters]);

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
          <div className="flex gap-2">
            <Button onClick={exportToPDF} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <DataImport onDataImport={handleDataImport} />
          </div>
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
            title="% Tickets Reabertos"
            value={`${analytics.reopenedTickets} (${analytics.reopenedPercentage}%)`}
            icon={RotateCcw}
            variant="warning"
          />
          <MetricCard
            title="Tickets Encerrados"
            value={analytics.closedTickets}
            icon={CheckCircle}
            variant="success"
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
            value={`${analytics.slaBreachCount} (${analytics.slaBreachPercentage}%)`}
            icon={AlertTriangle}
            variant={analytics.slaBreachPercentage > 20 ? "warning" : "success"}
          />
          <MetricCard
            title="Tickets Próximos ao SLA"
            value={`${analytics.nearSLACount}`}
            icon={Clock}
            variant={analytics.nearSLACount > 0 ? "warning" : "success"}
          />
        </div>

        {/* Tickets Near SLA */}
        {analytics.nearSLACount > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Tickets Próximos ao Vencimento do SLA (próximas 2 horas)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {analytics.ticketsNearSLA.map((ticket, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-muted rounded-md">
                    <div>
                      <span className="font-medium">#{ticket["#"]}</span> - {ticket["Título"]}
                      <div className="text-xs text-muted-foreground">
                        {ticket.Empresa} | {ticket["Equipe de atendimento"]}
                      </div>
                    </div>
                    <div className="text-xs text-right">
                      <div>SLA: {ticket["Prazo de SLA"]}</div>
                      <div className="text-warning">Próximo ao vencimento</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Resolution Rate */}
        <ChartCard title="Taxa de Resolução por Equipe (%)" icon={CheckCircle}>
          <div className="space-y-3">
            {analytics.teamResolutionRate.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm font-medium">{item.team}</span>
                <span className="text-sm text-muted-foreground">{item.resolutionRate}%</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tickets by Priority */}
          <ChartCard title="Tickets por Prioridade" icon={AlertTriangle}>
            <div className="flex">
              <ResponsiveContainer width="60%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.ticketsByPriority}
                    cx="50%"
                    cy="50%"
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
              <div className="w-40% p-4">
                <h4 className="text-sm font-medium mb-2">Legenda</h4>
                <div className="space-y-1">
                  {analytics.ticketsByPriority.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span>{item.name}: {item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ChartCard>

          {/* Tickets by Status */}
          <ChartCard title="Tickets por Status" icon={Activity}>
            <div className="flex">
              <ResponsiveContainer width="60%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.ticketsByStatus}
                    cx="50%"
                    cy="50%"
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
              <div className="w-40% p-4">
                <h4 className="text-sm font-medium mb-2">Legenda</h4>
                <div className="space-y-1">
                  {analytics.ticketsByStatus.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span>{item.name}: {item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ChartCard>

          {/* Tickets by Team */}
          <ChartCard title="Tickets por Equipe" icon={Users}>
            <div className="flex">
              <ResponsiveContainer width="60%" height={300}>
                <BarChart data={analytics.ticketsPerTeam}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count">
                    {analytics.ticketsPerTeam.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="w-40% p-4">
                <h4 className="text-sm font-medium mb-2">Equipes</h4>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {analytics.ticketsPerTeam.map((item, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="truncate">{item.name}</span>
                      <span>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ChartCard>

          {/* Top Agents */}
          <ChartCard title="Top 10 Atendentes" icon={UserCheck}>
            <div className="flex">
              <ResponsiveContainer width="60%" height={300}>
                <BarChart data={analytics.ticketsPerAgent.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip formatter={(value, name, props) => [
                    `${value} tickets (${props.payload.percentage}%)`,
                    'Tickets'
                  ]} />
                  <Bar dataKey="count">
                    {analytics.ticketsPerAgent.slice(0, 10).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="w-40% p-4">
                <h4 className="text-sm font-medium mb-2">Atendentes</h4>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {analytics.ticketsPerAgent.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="truncate">{item.name}</span>
                      <span>{item.count} ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ChartCard>

          {/* Categories */}
          <ChartCard title="Tickets por Categoria" icon={BarChart3}>
            <div className="flex">
              <ResponsiveContainer width="60%" height={300}>
                <BarChart data={analytics.ticketsByCategory.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count">
                    {analytics.ticketsByCategory.slice(0, 10).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="w-40% p-4">
                <h4 className="text-sm font-medium mb-2">Categorias</h4>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {analytics.ticketsByCategory.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="truncate">{item.name}</span>
                      <span>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ChartCard>

          {/* Companies */}
          <ChartCard title="Tickets por Empresa" icon={Building}>
            <div className="flex">
              <ResponsiveContainer width="60%" height={300}>
                <BarChart data={analytics.reportsPerCompany.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count">
                    {analytics.reportsPerCompany.slice(0, 10).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="w-40% p-4">
                <h4 className="text-sm font-medium mb-2">Empresas</h4>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {analytics.reportsPerCompany.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="truncate">{item.name}</span>
                      <span>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ChartCard>

          {/* Service Types */}
          <ChartCard title="Tickets por Tipo de Registro" icon={FileText}>
            <div className="flex">
              <ResponsiveContainer width="60%" height={300}>
                <BarChart data={analytics.ticketsByServiceType.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count">
                    {analytics.ticketsByServiceType.slice(0, 10).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="w-40% p-4">
                <h4 className="text-sm font-medium mb-2">Tipos de Registro</h4>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {analytics.ticketsByServiceType.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="truncate">{item.name}</span>
                      <span>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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

        {/* Tickets Table */}
        <ChartCard title={`Chamados Ativos (${filteredTableData.length})`} icon={TicketIcon}>
          <div className="space-y-4">
            {/* Table Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
              <Input
                placeholder="Filtrar ID"
                value={tableFilters.id}
                onChange={(e) => setTableFilters({...tableFilters, id: e.target.value})}
                className="text-xs"
              />
              <Input
                placeholder="Filtrar Tipo"
                value={tableFilters.tipo}
                onChange={(e) => setTableFilters({...tableFilters, tipo: e.target.value})}
                className="text-xs"
              />
              <Input
                placeholder="Filtrar Data"
                value={tableFilters.dataRequisicao}
                onChange={(e) => setTableFilters({...tableFilters, dataRequisicao: e.target.value})}
                className="text-xs"
              />
              <Input
                placeholder="Filtrar Título"
                value={tableFilters.titulo}
                onChange={(e) => setTableFilters({...tableFilters, titulo: e.target.value})}
                className="text-xs"
              />
              <Input
                placeholder="Filtrar Empresa"
                value={tableFilters.empresa}
                onChange={(e) => setTableFilters({...tableFilters, empresa: e.target.value})}
                className="text-xs"
              />
              <Input
                placeholder="Filtrar Equipe"
                value={tableFilters.equipe}
                onChange={(e) => setTableFilters({...tableFilters, equipe: e.target.value})}
                className="text-xs"
              />
              <Input
                placeholder="Filtrar Atendente"
                value={tableFilters.atendente}
                onChange={(e) => setTableFilters({...tableFilters, atendente: e.target.value})}
                className="text-xs"
              />
              <Input
                placeholder="Filtrar Status"
                value={tableFilters.status}
                onChange={(e) => setTableFilters({...tableFilters, status: e.target.value})}
                className="text-xs"
              />
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[60px]">ID</TableHead>
                    <TableHead className="min-w-[120px]">Tipo</TableHead>
                    <TableHead className="min-w-[120px]">Data Solicitação</TableHead>
                    <TableHead className="min-w-[200px]">Título</TableHead>
                    <TableHead className="min-w-[120px]">Empresa</TableHead>
                    <TableHead className="min-w-[120px]">Equipe</TableHead>
                    <TableHead className="min-w-[80px]">T. Resposta</TableHead>
                    <TableHead className="min-w-[80px]">T. Solução</TableHead>
                    <TableHead className="min-w-[120px]">Prazo SLA</TableHead>
                    <TableHead className="min-w-[80px]">SLA %</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTableData.slice(0, 200).map((ticket, index) => {
                    const slaPercentage = ticket["Data de encerramento"] && ticket["Prazo de SLA"] 
                      ? (() => {
                          const closedDate = new Date(ticket["Data de encerramento"].split(" ")[0].split("-").reverse().join("-"));
                          const slaDate = new Date(ticket["Prazo de SLA"].split(" ")[0].split("-").reverse().join("-"));
                          const timeDiff = slaDate.getTime() - closedDate.getTime();
                          return timeDiff >= 0 ? 100 : Math.max(0, 100 - Math.abs(timeDiff) / (1000 * 60 * 60 * 24) * 10);
                        })()
                      : "N/A";
                    
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-xs">{ticket["#"]}</TableCell>
                        <TableCell className="text-xs">{ticket["Tipo de Registro de Serviço"]}</TableCell>
                        <TableCell className="text-xs">{ticket["Data de requisição"]}</TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate" title={ticket["Título"]}>
                          {ticket["Título"]}
                        </TableCell>
                        <TableCell className="text-xs">{ticket.Empresa}</TableCell>
                        <TableCell className="text-xs">{ticket["Equipe de atendimento"]}</TableCell>
                        <TableCell className="text-xs">{ticket["Tempo de Resposta"]}</TableCell>
                        <TableCell className="text-xs">{ticket["Tempo de Solução"]}</TableCell>
                        <TableCell className="text-xs">{ticket["Prazo de SLA"]}</TableCell>
                        <TableCell className="text-xs">
                          {typeof slaPercentage === 'number' ? `${slaPercentage.toFixed(1)}%` : slaPercentage}
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            ticket.Status === 'Resolvido' || ticket.Status === 'Fechado' 
                              ? 'bg-green-100 text-green-800' 
                              : ticket.Status === 'Em andamento' 
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {ticket.Status}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default Index;