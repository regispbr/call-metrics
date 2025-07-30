import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ChartCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard = ({
  title,
  description,
  icon: Icon,
  children,
  className,
}: ChartCardProps) => {
  return (
    <Card className={cn("transition-all hover:shadow-glow", className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-primary" />}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};