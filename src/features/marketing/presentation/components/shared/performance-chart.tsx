import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface PerformanceAreaChartProps {
  data: { label: string; value: number; value2?: number }[];
  dataKey?: string;
  dataKey2?: string;
  color?: string;
  color2?: string;
  className?: string;
}

export function PerformanceAreaChart({
  data,
  dataKey = "value",
  dataKey2,
  color = "hsl(var(--chart-1))",
  color2 = "hsl(var(--chart-2))",
  className,
}: PerformanceAreaChartProps) {
  const chartConfig: ChartConfig = {
    value: { label: dataKey, color },
    ...(dataKey2 ? { value2: { label: dataKey2, color: color2 } } : {}),
  };

  return (
    <ChartContainer config={chartConfig} className={className ?? "h-[280px] w-full"}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
        <YAxis tickLine={false} axisLine={false} fontSize={11} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          fill={color}
          fillOpacity={0.15}
          strokeWidth={2}
        />
        {dataKey2 ? (
          <Area
            type="monotone"
            dataKey={dataKey2}
            stroke={color2}
            fill={color2}
            fillOpacity={0.1}
            strokeWidth={2}
          />
        ) : null}
      </AreaChart>
    </ChartContainer>
  );
}

interface PerformanceBarChartProps {
  data: { label: string; value: number; value2?: number }[];
  dataKey?: string;
  dataKey2?: string;
  className?: string;
}

export function PerformanceBarChart({
  data,
  dataKey = "value",
  dataKey2,
  className,
}: PerformanceBarChartProps) {
  const chartConfig: ChartConfig = {
    value: { label: dataKey, color: "hsl(var(--chart-1))" },
    ...(dataKey2 ? { value2: { label: dataKey2, color: "hsl(var(--chart-2))" } } : {}),
  };

  return (
    <ChartContainer config={chartConfig} className={className ?? "h-[280px] w-full"}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
        <YAxis tickLine={false} axisLine={false} fontSize={11} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey={dataKey} fill="var(--color-value)" radius={[4, 4, 0, 0]} />
        {dataKey2 ? (
          <Bar dataKey={dataKey2} fill="var(--color-value2)" radius={[4, 4, 0, 0]} />
        ) : null}
      </BarChart>
    </ChartContainer>
  );
}
