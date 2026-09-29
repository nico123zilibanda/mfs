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
  FileBarChart,
  TrendingUp,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { cn } from "@/lib/utils";

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

const STATUS_LABELS: Record<string, string> = {
  received: "Zimepokelewa",
  resolved: "Zimetatuliwa",
  in_review: "Zinachunguzwa",
};

const STATUS_COLORS: Record<string, string> = {
  received: "#8b5cf6",
  resolved: "#6d28d9",
  in_review: "#a78bfa",
};

const DEFAULT_CHART_COLOR = "#8b5cf6";

function formatStatus(status: string) {
  return STATUS_LABELS[status] ?? status;
}

function getStatusColor(status: string) {
  return STATUS_COLORS[status] ?? DEFAULT_CHART_COLOR;
}

function formatNumber(value: number) {
  return value.toLocaleString("sw-TZ");
}

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{
    value?: number | string;
  }>;
  label?: string;
};

function ChartTooltip({
  active,
  payload,
  label,
}: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const value = Number(payload[0]?.value ?? 0);

  return (
    <div
      className="
        min-w-40
        rounded-xl
        border
        border-slate-200
        bg-white
        px-4
        py-3
        shadow-xl
        shadow-slate-950/10
        dark:border-slate-700
        dark:bg-slate-900
        dark:shadow-black/30
      "
    >
      <p
        className="
          mb-2
          text-[10px]
          font-bold
          uppercase
          tracking-widest
          text-slate-400
          dark:text-slate-500
        "
      >
        {label}
      </p>

      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span
            className="
              h-2
              w-2
              rounded-full
              bg-purple-500
            "
          />

          <span
            className="
              text-xs
              font-medium
              text-slate-600
              dark:text-slate-300
            "
          >
            Taarifa
          </span>
        </div>

        <span
          className="
            text-sm
            font-bold
            text-[#6d28d9]
            dark:text-purple-300
          "
        >
          {formatNumber(value)}
        </span>
      </div>
    </div>
  );
}

type ChartHeaderProps = {
  icon: typeof FileBarChart;
  title: string;
  description: string;
  total: number;
  totalLabel: string;
};

function ChartHeader({
  icon: Icon,
  title,
  description,
  total,
  totalLabel,
}: ChartHeaderProps) {
  return (
    <CardHeader className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        {/* Section identity */}
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-purple-50
              text-[#6d28d9]
              ring-1
              ring-purple-100
              dark:bg-purple-950/40
              dark:text-purple-300
              dark:ring-purple-900/50
            "
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <CardTitle
              className="
                text-base
                font-bold
                text-slate-900
                dark:text-white
              "
            >
              {title}
            </CardTitle>

            <CardDescription
              className="
                mt-1
                text-xs
                leading-5
                text-slate-500
                dark:text-slate-400
              "
            >
              {description}
            </CardDescription>
          </div>
        </div>

        {/* Total */}
        <div className="shrink-0 text-right">
          <p
            className="
              text-2xl
              font-bold
              tracking-tight
              text-[#6d28d9]
              dark:text-purple-300
            "
          >
            {formatNumber(total)}
          </p>

          <p
            className="
              mt-0.5
              text-[10px]
              font-bold
              uppercase
              tracking-widest
              text-slate-400
              dark:text-slate-500
            "
          >
            {totalLabel}
          </p>
        </div>
      </div>
    </CardHeader>
  );
}

function ChartEmptyState() {
  return (
    <div
      className="
        flex
        h-full
        items-center
        justify-center
        rounded-xl
        border
        border-dashed
        border-slate-200
        bg-slate-50/70
        dark:border-slate-800
        dark:bg-slate-800/20
      "
    >
      <p
        className="
          text-sm
          text-slate-400
          dark:text-slate-500
        "
      >
        Hakuna taarifa za kuonyesha.
      </p>
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

  return (
    <section
      aria-label="Michoro ya takwimu za taarifa"
      className="grid gap-5 lg:grid-cols-2"
    >
      {/* =====================================================
          FEEDBACK BY STATUS
      ====================================================== */}
      <Card
        className="
          group
          relative
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:border-purple-200
          hover:shadow-md
          dark:border-slate-800
          dark:bg-slate-900
          dark:hover:border-purple-900/70
        "
      >
        {/* Government Accent */}
        <div
          className="
            absolute
            inset-x-0
            top-0
            h-0.5
            bg-linear-to-r
            from-purple-500
            via-[#6d28d9]
            to-indigo-500
            opacity-70
            transition-opacity
            duration-300
            group-hover:opacity-100
          "
        />

        <ChartHeader
          icon={FileBarChart}
          title="Taarifa kwa Hali"
          description="Mgawanyo wa taarifa za wananchi kulingana na hali yake."
          total={totalStatusFeedback}
          totalLabel="Jumla"
        />

        <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
          {statusChartData.length > 0 ? (
            <>
              <div
                className="h-72 w-full sm:h-80"
                aria-label="Mchoro wa taarifa kwa hali"
              >
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
                      stroke="#94a3b8"
                      strokeOpacity={0.14}
                      strokeDasharray="4 4"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="label"
                      tick={{
                        fill: "#94a3b8",
                        fontSize: 11,
                      }}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fill: "#94a3b8",
                        fontSize: 11,
                      }}
                      tickLine={false}
                      axisLine={false}
                      width={42}
                    />

                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{
                        fill: "#8b5cf6",
                        opacity: 0.05,
                      }}
                    />

                    <Bar
                      dataKey="count"
                      name="Taarifa"
                      radius={[8, 8, 3, 3]}
                      maxBarSize={58}
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

              {/* Status Summary */}
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {statusChartData.map((item) => (
                  <div
                    key={item.status}
                    className="
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50/70
                      px-3
                      py-3
                      transition-colors
                      hover:border-purple-100
                      hover:bg-purple-50/40
                      dark:border-slate-800
                      dark:bg-slate-800/30
                      dark:hover:border-purple-900/50
                      dark:hover:bg-purple-950/20
                    "
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: getStatusColor(
                            item.status
                          ),
                        }}
                      />

                      <span
                        className="
                          truncate
                          text-[11px]
                          font-semibold
                          text-slate-500
                          dark:text-slate-400
                        "
                      >
                        {item.label}
                      </span>
                    </div>

                    <p
                      className="
                        mt-1.5
                        text-base
                        font-bold
                        text-slate-900
                        dark:text-white
                      "
                    >
                      {formatNumber(item.count)}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-72 sm:h-80">
              <ChartEmptyState />
            </div>
          )}
        </CardContent>
      </Card>

      {/* =====================================================
          MONTHLY FEEDBACK
      ====================================================== */}
      <Card
        className="
          group
          relative
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:border-purple-200
          hover:shadow-md
          dark:border-slate-800
          dark:bg-slate-900
          dark:hover:border-purple-900/70
        "
      >
        {/* Government Accent */}
        <div
          className="
            absolute
            inset-x-0
            top-0
            h-0.5
            bg-linear-to-r
            from-purple-500
            via-[#6d28d9]
            to-indigo-500
            opacity-70
            transition-opacity
            duration-300
            group-hover:opacity-100
          "
        />

        <ChartHeader
          icon={TrendingUp}
          title="Taarifa kwa Miezi"
          description="Mwenendo wa taarifa zilizopokelewa kwa miezi 6 iliyopita."
          total={totalMonthlyFeedback}
          totalLabel="Miezi 6"
        />

        <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
          {monthlyData.length > 0 ? (
            <>
              <div
                className="h-72 w-full sm:h-80"
                aria-label="Mchoro wa taarifa kwa miezi"
              >
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
                      stroke="#94a3b8"
                      strokeOpacity={0.14}
                      strokeDasharray="4 4"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fill: "#94a3b8",
                        fontSize: 11,
                      }}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fill: "#94a3b8",
                        fontSize: 11,
                      }}
                      tickLine={false}
                      axisLine={false}
                      width={42}
                    />

                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{
                        fill: "#8b5cf6",
                        opacity: 0.05,
                      }}
                    />

                    <Bar
                      dataKey="count"
                      name="Taarifa"
                      fill="#8b5cf6"
                      radius={[8, 8, 3, 3]}
                      maxBarSize={58}
                      minPointSize={5}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Summary */}
              <div
                className="
                  mt-4
                  flex
                  items-center
                  justify-between
                  gap-4
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50/70
                  px-4
                  py-3
                  dark:border-slate-800
                  dark:bg-slate-800/30
                "
              >
                <div className="min-w-0">
                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-widest
                      text-slate-400
                      dark:text-slate-500
                    "
                  >
                    Kipindi
                  </p>

                  <p
                    className="
                      mt-0.5
                      truncate
                      text-sm
                      font-semibold
                      text-slate-800
                      dark:text-slate-200
                    "
                  >
                    Miezi 6 iliyopita
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className="
                      h-2.5
                      w-2.5
                      rounded-full
                      bg-purple-500
                    "
                  />

                  <div className="text-right">
                    <p
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-widest
                        text-slate-400
                        dark:text-slate-500
                      "
                    >
                      Jumla
                    </p>

                    <p
                      className="
                        text-sm
                        font-bold
                        text-[#6d28d9]
                        dark:text-purple-300
                      "
                    >
                      {formatNumber(totalMonthlyFeedback)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-72 sm:h-80">
              <ChartEmptyState />
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
