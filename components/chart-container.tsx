import { ReactNode } from "react";

interface ChartContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function ChartContainer({
  title,
  description,
  children,
  className = "",
}: ChartContainerProps) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 ${className}`}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description && (
          <p className="text-sm text-slate-400 mt-1">{description}</p>
        )}
      </div>

      <div className="w-full">{children}</div>
    </div>
  );
}

export default ChartContainer;
