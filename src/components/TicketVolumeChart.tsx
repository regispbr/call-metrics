import { useState, useMemo } from "react";
import { ChartCard } from "@/components/ChartCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
  ReferenceLine
} from "recharts";
import { BarChart3, ZoomOut, Calendar, Clock } from "lucide-react";
import { format, startOfHour, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TicketVolumeChartProps {
  data: any[];
}

interface ChartDataPoint {
  date: string;
  tickets: number;
  displayDate: string;
}

export const TicketVolumeChart = ({ data }: TicketVolumeChartProps) => {
  const [viewMode, setViewMode] = useState<"day" | "hour">("day");
  const [brushStartIndex, setBrushStartIndex] = useState<number | undefined>();
  const [brushEndIndex, setBrushEndIndex] = useState<number | undefined>();

  // Parse date from string format "dd-mm-yyyy hh:mm:ss"
  const parseDate = (dateStr: string) => {
    const [datePart, timePart] = dateStr.split(" ");
    const [day, month, year] = datePart.split("-");
    return new Date(`${year}-${month}-${day}T${timePart || "00:00:00"}`);
  };

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!data || data.length === 0) return [];

    const grouped: Record<string, ChartDataPoint> = {};

    data.forEach((ticket) => {
      try {
        const date = parseDate(ticket["Data de requisição"]);
        
        let key: string;
        let displayDate: string;
        
        if (viewMode === "day") {
          key = format(startOfDay(date), "yyyy-MM-dd");
          displayDate = format(date, "dd/MM", { locale: ptBR });
        } else {
          key = format(startOfHour(date), "yyyy-MM-dd HH:00");
          displayDate = format(date, "dd/MM HH:mm", { locale: ptBR });
        }

        if (!grouped[key]) {
          grouped[key] = {
            date: key,
            tickets: 0,
            displayDate: displayDate
          };
        }
        grouped[key].tickets++;
      } catch (error) {
        console.warn("Error parsing date:", ticket["Data de requisição"]);
      }
    });

    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }, [data, viewMode]);

  const handleBrushChange = (brushData: any) => {
    if (brushData && brushData.startIndex !== undefined && brushData.endIndex !== undefined) {
      setBrushStartIndex(brushData.startIndex);
      setBrushEndIndex(brushData.endIndex);
    }
  };

  const resetZoom = () => {
    setBrushStartIndex(undefined);
    setBrushEndIndex(undefined);
  };

  const maxTickets = chartData.length > 0 ? Math.max(...chartData.map(d => d.tickets)) : 0;
  const totalTickets = chartData.reduce((sum, d) => sum + d.tickets, 0);
  const avgTickets = chartData.length > 0 ? totalTickets / chartData.length : 0;

  return (
    <ChartCard 
      title={`Volume de Tickets por ${viewMode === "day" ? "Dia" : "Hora"}`}
      description={`Análise temporal com ${chartData.length} períodos`}
      icon={BarChart3}
      className="col-span-full"
    >
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(value: "day" | "hour") => setViewMode(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Por Dia
                  </div>
                </SelectItem>
                <SelectItem value="hour">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Por Hora
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            {(brushStartIndex !== undefined || brushEndIndex !== undefined) && (
              <Button onClick={resetZoom} variant="outline" size="sm">
                <ZoomOut className="h-4 w-4 mr-2" />
                Reset Zoom
              </Button>
            )}
            <div className="text-sm text-muted-foreground">
              Média: {avgTickets.toFixed(1)} | Máximo: {maxTickets}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="displayDate"
                tick={{ fontSize: 12 }}
                angle={viewMode === "hour" ? -45 : 0}
                textAnchor={viewMode === "hour" ? "end" : "middle"}
                height={viewMode === "hour" ? 80 : 60}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ 
                  value: 'Quantidade de Tickets', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{viewMode === "day" ? "Data" : "Data/Hora"}: {label}</p>
                        <p className="text-primary">
                          Tickets: <span className="font-bold">{payload[0].value}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine 
                y={avgTickets} 
                stroke="hsl(var(--warning))" 
                strokeDasharray="5 5"
                label={{ value: "Média", position: "top" }}
              />
              <Line
                type="monotone"
                dataKey="tickets"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4, fill: "hsl(var(--primary))" }}
                activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                connectNulls={false}
              />
              {chartData.length > 10 && (
                <Brush
                  dataKey="displayDate"
                  height={30}
                  stroke="hsl(var(--primary))"
                  onChange={handleBrushChange}
                  startIndex={brushStartIndex}
                  endIndex={brushEndIndex}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-primary">{chartData.length}</div>
            <div className="text-sm text-muted-foreground">
              {viewMode === "day" ? "Dias" : "Horas"} com Atividade
            </div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-success">{avgTickets.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Média por Período</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-warning">{maxTickets}</div>
            <div className="text-sm text-muted-foreground">Pico Máximo</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-info">
              {totalTickets}
            </div>
            <div className="text-sm text-muted-foreground">Total de Tickets</div>
          </div>
        </div>
      </div>
    </ChartCard>
  );
};