import { ReactNode } from "react";

interface KPIGridProps {
  children: ReactNode;
  className?: string;
}

export function KPIGrid({ children, className = "" }: KPIGridProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
    >
      {children}
    </div>
  );
}

export default KPIGrid;
