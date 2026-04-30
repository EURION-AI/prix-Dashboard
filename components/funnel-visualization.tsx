interface FunnelStage {
  name: string;
  count: number;
  conversionRate: number;
}

interface FunnelVisualizationProps {
  stages: FunnelStage[];
  className?: string;
}

export function FunnelVisualization({
  stages,
  className = "",
}: FunnelVisualizationProps) {
  const maxCount = Math.max(...stages.map((s) => s.count));

  return (
    <div className={`space-y-3 ${className}`}>
      {stages.map((stage, index) => {
        const percentage = (stage.count / maxCount) * 100;
        const isLastStage = index === stages.length - 1;

        return (
          <div key={stage.name} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{stage.name}</p>
                <p className="text-xs text-slate-400">
                  {stage.count.toLocaleString()} visitors
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-blue-400">
                  {stage.conversionRate.toFixed(1)}%
                </p>
                {!isLastStage && (
                  <p className="text-xs text-slate-400">
                    {((stage.count / maxCount) * 100).toFixed(0)}% retained
                  </p>
                )}
              </div>
            </div>

            <div className="relative h-8 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500/50 to-blue-400/30 rounded-lg transition-all"
                style={{ width: `${percentage}%` }}
              />
              <div className="absolute inset-0 flex items-center px-3">
                <span className="text-xs font-medium text-white opacity-70">
                  {percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FunnelVisualization;
