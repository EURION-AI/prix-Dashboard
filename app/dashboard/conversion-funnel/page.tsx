"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingDown } from "lucide-react";
import { TimeRangeFilter } from "@/components/time-range-filter";
import { ChartContainer } from "@/components/chart-container";
import { FunnelVisualization } from "@/components/funnel-visualization";
import { fetchDashboardData, DashboardFunnel, TimeRange } from "@/lib/api-config";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ConversionFunnelPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24H");
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<DashboardFunnel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const d = await fetchDashboardData<DashboardFunnel>("conversion-funnel", timeRange);
        setData(d);
      } catch (error) {
        console.error("Failed to load funnel data:", error);
      } finally {
        setLoading(false);
      }
    }
    if (mounted) loadData();
  }, [timeRange, mounted]);

  if (!mounted) return null;
  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="flex items-center justify-between" variants={itemVariants}>
        <div>
          <h1 className="text-3xl font-bold text-white">Conversion Funnel</h1>
          <p className="text-slate-400 mt-1">Track users from signup to paying customer</p>
        </div>
        <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
      </motion.div>

      <motion.div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-8" variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 mb-2">Overall Conversion Rate</p>
            <p className="text-5xl font-bold text-blue-400">
              {(data.overallConversionRate * 100).toFixed(2)}%
            </p>
          </div>
          <TrendingDown className="w-12 h-12 text-slate-600" />
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <ChartContainer title="Conversion Funnel" description="User journey stages">
          <FunnelVisualization stages={data.stages} />
        </ChartContainer>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.stages.map((stage, index) => (
            <div key={stage.name} className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Stage {index + 1}</p>
              <p className="text-lg font-semibold text-white mb-1">{stage.name}</p>
              <p className="text-2xl font-bold text-blue-400 mb-3">{stage.count.toLocaleString()}</p>
              <div className="flex items-baseline gap-1">
                <p className="text-sm text-green-400 font-medium">{stage.conversionRate.toFixed(1)}%</p>
                <p className="text-xs text-slate-400">conversion</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Referral Chart */}
      <motion.div variants={itemVariants}>
        <ChartContainer title="Referral Conversion" description="Referred vs Purchased users">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.referralChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </motion.div>
    </motion.div>
  );
}
