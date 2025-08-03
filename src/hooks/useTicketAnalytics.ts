import { useMemo } from "react";

interface TicketData {
  "Tipo de Registro de Serviço": string;
  "#": number;
  "Usuário solicitante": string;
  "Data de requisição": string;
  "Empresa": string;
  "Data de encerramento": string;
  "Prazo de SLA": string;
  "Status": string;
  "Categoria": string;
  "Subcategoria": string;
  "Tempo de Resposta": string;
  "Tempo de Solução": string;
  "Tempo Aguardando Cliente": string;
  "Tempo Aguardando Fabricante": string;
  "Título": string;
  "Equipe de atendimento": string;
  "Atendente atribuído": string;
  "contador de Reabertura": number;
  "Prioridade": string;
}

export const useTicketAnalytics = (data: TicketData[]) => {
  return useMemo(() => {
    // Filter out merged tickets from all calculations
    const filteredData = data?.filter(ticket => ticket.Status !== "Mesclado") || [];
    
    if (!filteredData || filteredData.length === 0) {
      return {
        totalTickets: 0,
        avgRequestsPerDay: 0,
        topDayOfWeek: "N/A",
        reportsPerCompany: [],
        ticketsPerAgent: [],
        ticketsPerTeam: [],
        teamResolutionRate: [],
        avgResponseTime: "00:00",
        avgSolutionTime: "00:00",
        reopenedTickets: 0,
        reopenedPercentage: 0,
        slaBreachPercentage: 0,
        ticketsByPriority: [],
        ticketsByCategory: [],
        avgWaitingClient: "00:00",
        avgWaitingManufacturer: "00:00",
        ticketsByStatus: [],
        responseTimeByTeam: [],
        solutionTimeByTeam: [],
        requestsByDay: [],
        ticketsNearSLA: [],
        nearSLACount: 0,
        filterOptions: {
          empresas: [],
          status: [],
          prioridades: [],
          categorias: [],
          subcategorias: [],
          equipesAtendimento: [],
          atendentes: [],
          tiposRegistro: [],
        }
      };
    }

    // Helper function to parse time strings
    const parseTimeToMinutes = (timeStr: string) => {
      if (!timeStr || timeStr === "00:00") return 0;
      const parts = timeStr.split(":");
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    };

    const formatMinutesToTime = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    // Parse dates
    const parseDate = (dateStr: string) => {
      const [datePart, timePart] = dateStr.split(" ");
      const [day, month, year] = datePart.split("-");
      return new Date(`${year}-${month}-${day}T${timePart}`);
    };

    // Basic metrics
    const totalTickets = filteredData.length;
    
    // Group by day for average requests
    const requestsByDay = filteredData.reduce((acc, ticket) => {
      const date = parseDate(ticket["Data de requisição"]);
      const dayKey = date.toISOString().split('T')[0];
      acc[dayKey] = (acc[dayKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgRequestsPerDay = Object.keys(requestsByDay).length > 0 
      ? Math.round(totalTickets / Object.keys(requestsByDay).length)
      : 0;

    // Day of week analysis
    const dayOfWeekCount = filteredData.reduce((acc, ticket) => {
      const date = parseDate(ticket["Data de requisição"]);
      const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'long' });
      acc[dayOfWeek] = (acc[dayOfWeek] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topDayOfWeek = Object.entries(dayOfWeekCount).reduce((a, b) => 
      dayOfWeekCount[a[0]] > dayOfWeekCount[b[0]] ? a : b
    )?.[0] || "N/A";

    // Reports per company (sorted by count descending)
    const reportsPerCompany = Object.entries(
      filteredData.reduce((acc, ticket) => {
        const company = ticket.Empresa || "Não informado";
        acc[company] = (acc[company] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

    // Tickets per agent (sorted by count descending)
    const ticketsPerAgent = Object.entries(
      filteredData.reduce((acc, ticket) => {
        const agent = ticket["Atendente atribuído"] || "Não atribuído";
        acc[agent] = (acc[agent] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, count]) => ({ 
      name, 
      count, 
      percentage: ((count / totalTickets) * 100).toFixed(1) 
    })).sort((a, b) => b.count - a.count);

    // Tickets per team (sorted by count descending)
    const ticketsPerTeam = Object.entries(
      filteredData.reduce((acc, ticket) => {
        const team = ticket["Equipe de atendimento"] || "Não definido";
        acc[team] = (acc[team] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

    // Team resolution rate - based on total tickets
    const teamResolutionRate = Object.entries(
      filteredData.reduce((acc, ticket) => {
        const team = ticket["Equipe de atendimento"] || "Não definido";
        const status = ticket.Status;
        
        if (!acc[team]) acc[team] = { total: 0, resolved: 0 };
        acc[team].total++;
        if (status === "Resolvido" || status === "Fechado" || status === "Encerrado") {
          acc[team].resolved++;
        }
        return acc;
      }, {} as Record<string, { total: number; resolved: number }>)
    ).map(([team, stats]) => ({
      team,
      resolutionRate: ((stats.resolved / totalTickets) * 100).toFixed(1)
    }));

    // Response and solution times
    const responseTimes = filteredData.map(ticket => parseTimeToMinutes(ticket["Tempo de Resposta"]));
    const solutionTimes = filteredData.map(ticket => parseTimeToMinutes(ticket["Tempo de Solução"]));
    const waitingClientTimes = filteredData.map(ticket => parseTimeToMinutes(ticket["Tempo Aguardando Cliente"]));
    const waitingManufacturerTimes = filteredData.map(ticket => parseTimeToMinutes(ticket["Tempo Aguardando Fabricante"]));

    const avgResponseTime = formatMinutesToTime(
      Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) || 0
    );
    const avgSolutionTime = formatMinutesToTime(
      Math.round(solutionTimes.reduce((a, b) => a + b, 0) / solutionTimes.length) || 0
    );
    const avgWaitingClient = formatMinutesToTime(
      Math.round(waitingClientTimes.reduce((a, b) => a + b, 0) / waitingClientTimes.length) || 0
    );
    const avgWaitingManufacturer = formatMinutesToTime(
      Math.round(waitingManufacturerTimes.reduce((a, b) => a + b, 0) / waitingManufacturerTimes.length) || 0
    );

    // Reopened tickets
    const reopenedTickets = filteredData.filter(ticket => 
      ticket["contador de Reabertura"] > 0
    ).length;
    const reopenedPercentage = Math.round((reopenedTickets / totalTickets) * 100);

    // SLA breach analysis
    const slaBreachCount = filteredData.filter(ticket => {
      if (!ticket["Data de encerramento"] || !ticket["Prazo de SLA"]) return false;
      const closedDate = parseDate(ticket["Data de encerramento"]);
      const slaDate = parseDate(ticket["Prazo de SLA"]);
      return closedDate > slaDate;
    }).length;
    const slaBreachPercentage = Math.round((slaBreachCount / totalTickets) * 100);

    // Priority order helper function
    const getPriorityOrder = (priority: string) => {
      const orderMap: Record<string, number> = {
        'Crítico': 1, 'P1': 1,
        'Alto': 2, 'P2': 2, 
        'Médio': 3, 'P3': 3,
        'Baixo': 4, 'P4': 4,
        'Planejado': 5, 'P5': 5
      };
      return orderMap[priority] || 999;
    };

    // Tickets by priority (sorted by priority order, then by count)
    const ticketsByPriority = Object.entries(
      filteredData.reduce((acc, ticket) => {
        const priority = ticket.Prioridade || "Não definido";
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
      const priorityCompare = getPriorityOrder(a.name) - getPriorityOrder(b.name);
      return priorityCompare !== 0 ? priorityCompare : b.count - a.count;
    });

    // Tickets by category and subcategory (sorted by count descending)
    const ticketsByCategory = Object.entries(
      filteredData.reduce((acc, ticket) => {
        const category = `${ticket.Categoria || "N/A"} > ${ticket.Subcategoria || "N/A"}`;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

    // Tickets by status (sorted by count descending)
    const ticketsByStatus = Object.entries(
      filteredData.reduce((acc, ticket) => {
        const status = ticket.Status || "Não definido";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

    // Response time by team
    const responseTimeByTeam = Object.entries(
      filteredData.reduce((acc, ticket) => {
        const team = ticket["Equipe de atendimento"] || "Não definido";
        if (!acc[team]) acc[team] = [];
        acc[team].push(parseTimeToMinutes(ticket["Tempo de Resposta"]));
        return acc;
      }, {} as Record<string, number[]>)
    ).map(([team, times]) => ({
      team,
      avgTime: formatMinutesToTime(Math.round(times.reduce((a, b) => a + b, 0) / times.length))
    }));

    // Solution time by team
    const solutionTimeByTeam = Object.entries(
      filteredData.reduce((acc, ticket) => {
        const team = ticket["Equipe de atendimento"] || "Não definido";
        if (!acc[team]) acc[team] = [];
        acc[team].push(parseTimeToMinutes(ticket["Tempo de Solução"]));
        return acc;
      }, {} as Record<string, number[]>)
    ).map(([team, times]) => ({
      team,
      avgTime: formatMinutesToTime(Math.round(times.reduce((a, b) => a + b, 0) / times.length))
    }));

    // Tickets próximos ao SLA (2 horas)
    const now = new Date();
    const ticketsNearSLA = filteredData.filter(ticket => {
      if (!ticket["Prazo de SLA"] || ticket.Status === "Resolvido" || ticket.Status === "Fechado") return false;
      const slaDate = parseDate(ticket["Prazo de SLA"]);
      const timeDiff = slaDate.getTime() - now.getTime();
      const hoursUntilSLA = timeDiff / (1000 * 60 * 60);
      return hoursUntilSLA <= 2 && hoursUntilSLA > 0;
    });


    // Filter options with sorting
    const filterOptions = {
      empresas: [...new Set(filteredData.map(d => d.Empresa).filter(Boolean))].sort(),
      status: [...new Set(filteredData.map(d => d.Status).filter(Boolean))].sort(),
      prioridades: [...new Set(filteredData.map(d => d.Prioridade).filter(Boolean))].sort((a, b) => getPriorityOrder(a) - getPriorityOrder(b)),
      categorias: [...new Set(filteredData.map(d => d.Categoria).filter(Boolean))].sort(),
      subcategorias: [...new Set(filteredData.map(d => d.Subcategoria).filter(Boolean))].sort(),
      equipesAtendimento: [...new Set(filteredData.map(d => d["Equipe de atendimento"]).filter(Boolean))].sort(),
      atendentes: [...new Set(filteredData.map(d => d["Atendente atribuído"]).filter(Boolean))].sort(),
      tiposRegistro: [...new Set(filteredData.map(d => d["Tipo de Registro de Serviço"]).filter(Boolean))].sort(),
    };

    return {
      totalTickets,
      avgRequestsPerDay,
      topDayOfWeek,
      reportsPerCompany,
      ticketsPerAgent,
      ticketsPerTeam,
      teamResolutionRate,
      avgResponseTime,
      avgSolutionTime,
      reopenedTickets,
      reopenedPercentage,
      slaBreachPercentage,
      slaBreachCount,
      ticketsByPriority,
      ticketsByCategory,
      avgWaitingClient,
      avgWaitingManufacturer,
      ticketsByStatus,
      responseTimeByTeam,
      solutionTimeByTeam,
      requestsByDay: Object.entries(requestsByDay).map(([date, count]) => ({ date, count })),
      ticketsNearSLA,
      nearSLACount: ticketsNearSLA.length,
      filterOptions,
      rawData: filteredData,
    };
  }, [data]);
};