"use client";

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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const CONFIG_DISTRIBUCION = {
  presentes: {
    label: "Presentes",
    color: "var(--chart-1)",
  },
  justificadas: {
    label: "Justificadas",
    color: "var(--chart-2)",
  },
  ausentes: {
    label: "Ausentes sin motivo",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const CONFIG_TENDENCIA = {
  tasa: {
    label: "Tasa de asistencia (%)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface GraficosDashboardProps {
  presentes: number;
  justificadas: number;
  ausentesSinMotivo: number;
  tendencia: Array<{
    jornadaId: string;
    titulo: string;
    fechaCorta: string;
    presentes: number;
    ausencias: number;
    tasa: number;
  }>;
}

export function GraficosDashboard({
  presentes,
  justificadas,
  ausentesSinMotivo,
  tendencia,
}: GraficosDashboardProps) {
  const datosDistribucion = [
    {
      categoria: "Totales del período",
      presentes,
      justificadas,
      ausentes: ausentesSinMotivo,
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Distribución de asistencias
          </CardTitle>
          <CardDescription>
            Totales acumulados sincronizados con el reporte de participación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={CONFIG_DISTRIBUCION}
            className="h-[250px] w-full"
          >
            <BarChart
              data={datosDistribucion}
              layout="vertical"
              margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="categoria"
                hide
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="presentes"
                stackId="total"
                fill="var(--color-presentes)"
                radius={[4, 0, 0, 4]}
              />
              <Bar
                dataKey="justificadas"
                stackId="total"
                fill="var(--color-justificadas)"
              />
              <Bar
                dataKey="ausentes"
                stackId="total"
                fill="var(--color-ausentes)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tendencia por jornada</CardTitle>
          <CardDescription>
            Porcentaje de asistencia en cada jornada contabilizada del período.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={CONFIG_TENDENCIA}
            className="h-[250px] w-full"
          >
            <AreaChart
              data={tendencia}
              margin={{ left: 0, right: 12, top: 8, bottom: 8 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="fechaCorta"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
                width={42}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.titulo ?? ""
                    }
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="tasa"
                stroke="var(--color-tasa)"
                fill="var(--color-tasa)"
                fillOpacity={0.18}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
