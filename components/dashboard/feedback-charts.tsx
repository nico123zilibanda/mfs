"use client";

import {
Bar,
BarChart,
CartesianGrid,
Cell,
ResponsiveContainer,
Tooltip,
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
FileBarChart,
TrendingUp,
} from "lucide-react";

interface FeedbackChartsProps {
statusData: {
status: string;
count: number;
}[];

monthlyData: {
month: string;
count: number;
}[];
}

function formatStatus(status: string) {
const labels: Record<string, string> = {
received: "Zimepokelewa",
resolved: "Zimetatuliwa",
in_review: "Zinachunguzwa",
};

return labels[status] ?? status;
}

function getStatusColor(status: string) {
const colors: Record<string, string> = {
received: "var(--purple-500)",
resolved: "var(--purple-700)",
in_review: "var(--purple-400)",
};

return colors[status] ?? "var(--primary)";
}

function ChartTooltip({
active,
payload,
label,
}: {
active?: boolean;
payload?: Array<{
value?: number | string;
}>;
label?: string;
}) {
if (!active || !payload?.length) {
return null;
}

return ( <div
   className="
     min-w-[155px]
     rounded-xl
     border
     border-border/70
     bg-popover
     px-4
     py-3
     shadow-xl
     shadow-black/10
   "
 > <p className="mb-2 text-xs font-medium text-muted-foreground">
{label} </p>

  <div className="flex items-center justify-between gap-6">
    <div className="flex items-center gap-2">
      <span
        className="
          size-2
          rounded-full
          bg-purple-500
        "
      />

      <span className="text-sm text-foreground">
        Taarifa
      </span>
    </div>

    <span className="text-sm font-bold text-primary">
      {Number(payload[0]?.value ?? 0).toLocaleString("sw-TZ")}
    </span>
  </div>
</div>

);
}

export default function FeedbackCharts({
statusData,
monthlyData,
}: FeedbackChartsProps) {
const statusChartData = statusData.map((item) => ({
...item,
label: formatStatus(item.status),
}));

const totalStatusFeedback = statusData.reduce(
(total, item) => total + item.count,
0
);

const totalMonthlyFeedback = monthlyData.reduce(
(total, item) => total + item.count,
0
);

return ( <div className="grid gap-6 lg:grid-cols-2">
{/* =====================================================
FEEDBACK BY STATUS
====================================================== */} 
<Card
     className="
       overflow-hidden
       border-border/70
       bg-card
       shadow-sm
       transition-all
       duration-300
       hover:-translate-y-0.5
       hover:shadow-lg
       hover:shadow-purple-500/5
     "
   > <CardHeader
       className="
         border-b
         border-border/60
         bg-gradient-to-r
         from-purple-50/70
         via-card
         to-card
         pb-5
         dark:from-purple-950/20
       "
     > <div className="flex items-start justify-between gap-4">
        {/* Title */} 
        <div className="flex min-w-0 items-start gap-3"> <div
             className="
               flex
               size-11
               shrink-0
               items-center
               justify-center
               rounded-xl
               bg-purple-100
               text-purple-700
               shadow-sm
               shadow-purple-500/10
               dark:bg-purple-900/40
               dark:text-purple-300
             "
           > <FileBarChart className="size-5" /> </div>

          <div className="min-w-0">
            <CardTitle className="text-base font-semibold">
              Taarifa kwa Hali
            </CardTitle>

            <CardDescription className="mt-1 max-w-md text-xs leading-relaxed">
              Mgawanyo wa taarifa za wananchi kulingana
              na hali yake.
            </CardDescription>
          </div>
        </div>

        {/* Total */}
        <div className="shrink-0 text-right">
          <p className="text-2xl font-bold tracking-tight text-purple-700 dark:text-purple-300">
            {totalStatusFeedback.toLocaleString("sw-TZ")}
          </p>

          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Jumla
          </p>
        </div>
      </div>
    </CardHeader>

    <CardContent className="pt-6">
      <div className="h-[310px] w-full">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart
            data={statusChartData}
            margin={{
              top: 12,
              right: 8,
              left: -18,
              bottom: 8,
            }}
            barCategoryGap="22%"
          >
            <CartesianGrid
              stroke="currentColor"
              strokeOpacity={0.07}
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tick={{
                fill: "currentColor",
                fontSize: 11,
              }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />

            <YAxis
              allowDecimals={false}
              tick={{
                fill: "currentColor",
                fontSize: 11,
              }}
              tickLine={false}
              axisLine={false}
              width={42}
            />

            <Tooltip
              content={<ChartTooltip />}
              cursor={{
                fill: "var(--purple-500)",
                opacity: 0.05,
              }}
            />

            <Bar
              dataKey="count"
              name="Taarifa"
              radius={[9, 9, 3, 3]}
              maxBarSize={62}
              minPointSize={5}
            >
              {statusChartData.map((item) => (
                <Cell
                  key={item.status}
                  fill={getStatusColor(item.status)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Status summary */}
      {statusChartData.length > 0 && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {statusChartData.map((item) => (
            <div
              key={item.status}
              className="
                rounded-xl
                border
                border-border/50
                bg-muted/30
                px-3
                py-3
                transition-colors
                hover:bg-muted/50
              "
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      getStatusColor(item.status),
                  }}
                />

                <span className="truncate text-[11px] font-medium text-muted-foreground">
                  {item.label}
                </span>
              </div>

              <p className="mt-1.5 text-base font-bold text-foreground">
                {item.count.toLocaleString("sw-TZ")}
              </p>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>

  {/* =====================================================
      MONTHLY FEEDBACK
  ====================================================== */}
  <Card
    className="
      overflow-hidden
      border-border/70
      bg-card
      shadow-sm
      transition-all
      duration-300
      hover:-translate-y-0.5
      hover:shadow-lg
      hover:shadow-purple-500/5
    "
  >
    <CardHeader
      className="
        border-b
        border-border/60
        bg-gradient-to-r
        from-purple-50/70
        via-card
        to-card
        pb-5
        dark:from-purple-950/20
      "
    >
      <div className="flex items-start justify-between gap-4">
        {/* Title */}
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="
              flex
              size-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-purple-100
              text-purple-700
              shadow-sm
              shadow-purple-500/10
              dark:bg-purple-900/40
              dark:text-purple-300
            "
          >
            <TrendingUp className="size-5" />
          </div>

          <div className="min-w-0">
            <CardTitle className="text-base font-semibold">
              Taarifa kwa Miezi
            </CardTitle>

            <CardDescription className="mt-1 max-w-md text-xs leading-relaxed">
              Mwenendo wa taarifa zilizopokelewa kwa
              miezi 6 iliyopita.
            </CardDescription>
          </div>
        </div>

        {/* Total */}
        <div className="shrink-0 text-right">
          <p className="text-2xl font-bold tracking-tight text-purple-700 dark:text-purple-300">
            {totalMonthlyFeedback.toLocaleString("sw-TZ")}
          </p>

          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Miezi 6
          </p>
        </div>
      </div>
    </CardHeader>

    <CardContent className="pt-6">
      <div className="h-[310px] w-full">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart
            data={monthlyData}
            margin={{
              top: 12,
              right: 8,
              left: -18,
              bottom: 8,
            }}
            barCategoryGap="25%"
          >
            <CartesianGrid
              stroke="currentColor"
              strokeOpacity={0.07}
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tick={{
                fill: "currentColor",
                fontSize: 11,
              }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />

            <YAxis
              allowDecimals={false}
              tick={{
                fill: "currentColor",
                fontSize: 11,
              }}
              tickLine={false}
              axisLine={false}
              width={42}
            />

            <Tooltip
              content={<ChartTooltip />}
              cursor={{
                fill: "var(--purple-500)",
                opacity: 0.05,
              }}
            />

            <Bar
              dataKey="count"
              name="Taarifa"
              fill="var(--purple-500)"
              radius={[9, 9, 3, 3]}
              maxBarSize={62}
              minPointSize={5}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly summary */}
      <div
        className="
          mt-3
          flex
          items-center
          justify-between
          rounded-xl
          border
          border-border/50
          bg-muted/30
          px-4
          py-3
        "
      >
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Kipindi
          </p>

          <p className="mt-0.5 text-sm font-semibold text-foreground">
            Miezi 6 iliyopita
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="
              size-2.5
              rounded-full
              bg-purple-500
              shadow-sm
              shadow-purple-500/40
            "
          />

          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Jumla
            </p>

            <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
              {totalMonthlyFeedback.toLocaleString("sw-TZ")}
            </p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</div>

);
}
