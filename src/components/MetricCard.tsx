import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: LucideIcon;
  variant?: "default" | "primary" | "success" | "warning" | "info";
  className?: string;
}

export const MetricCard = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  variant = "default",
  className,
}: MetricCardProps) => {
  const variants = {
    default: "border-border",
    primary: "border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10",
    success: "border-success/20 bg-gradient-to-br from-success/5 to-success/10",
    warning: "border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10",
    info: "border-info/20 bg-gradient-to-br from-info/5 to-info/10",
  };

  const changeColors = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <Card className={cn("relative overflow-hidden transition-all hover:shadow-glow", variants[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={cn("text-xs mt-1", changeColors[changeType])}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
};