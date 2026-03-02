"use client";

import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from "chart.js";
import type { ChartConfig } from "@/types";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

interface ChartRendererProps {
  config: ChartConfig;
}

export default function ChartRenderer({ config }: ChartRendererProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartOptions: any = {
    ...config.options,
    responsive: true,
    maintainAspectRatio: false,
  };

  const chartProps = {
    data: config.data,
    options: chartOptions,
  };

  return (
    <div className="w-full">
      <div className="relative w-full" style={{ height: "220px" }}>
        {config.type === "bar" && <Bar {...chartProps} />}
        {config.type === "line" && <Line {...chartProps} />}
        {config.type === "pie" && <Pie {...chartProps} />}
        {config.type === "doughnut" && <Doughnut {...chartProps} />}
      </div>
    </div>
  );
}
