import { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    direction: "up" | "down";
    value: number;
  };
  unit?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  icon,
  trend,
  unit,
  className = "",
}: MetricCardProps) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-400 mb-2">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-white">{value}</p>
            {unit && <span className="text-sm text-slate-400">{unit}</span>}
          </div>

          {trend && (
            <div
              className={`mt-2 flex items-center gap-1 text-sm ${
                trend.direction === "up" ? "text-green-400" : "text-red-400"
              }`}
            >
              <span>{trend.direction === "up" ? "↑" : "↓"}</span>
              <span>{trend.value.toFixed(1)}% from last period</span>
            </div>
          )}
        </div>

        {icon && (
          <div className="text-blue-400/30 flex-shrink-0">{icon}</div>
        )}
      </div>
    </div>
  );
}

export default MetricCard;
