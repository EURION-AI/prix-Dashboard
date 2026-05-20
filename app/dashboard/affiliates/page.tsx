"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, DollarSign, TrendingUp, MousePointerClick, GitBranch } from "lucide-react";
import { TimeRangeFilter } from "@/components/time-range-filter";
import { MetricCard } from "@/components/metric-card";
import { KPIGrid } from "@/components/kpi-grid";
import { ChartContainer } from "@/components/chart-container";
import { Leaderboard } from "@/components/leaderboard";
import { fetchDashboardData, DashboardAffiliate, TimeRange } from "@/lib/api-config";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AffiliatesPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24H");
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<DashboardAffiliate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const d = await fetchDashboardData<DashboardAffiliate>("affiliates", timeRange);
        setData(d);
      } catch (error) {
        console.error("Failed to load affiliates:", error);
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
      <motion.div className="flex items-end justify-between gap-4" variants={itemVariants}>
        <div>
          <h1 className="text-3xl font-bold text-white">Affiliate Performance</h1>
          <p className="text-slate-400 mt-1">Track your affiliate network performance</p>
        </div>
        <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <KPIGrid>
          <MetricCard label="Total Clicks" value={data.totalClicks.toLocaleString()} icon={<MousePointerClick className="w-8 h-8" />} />
          <MetricCard label="Conversions" value={data.totalConversions.toLocaleString()} icon={<Users className="w-8 h-8" />} />
          <MetricCard label="Conv. Rate" value={`${data.conversionRate.toFixed(1)}%`} icon={<TrendingUp className="w-8 h-8" />} />
          <MetricCard label="Commission Owed" value={`$${(data.totalCommission / 1000).toFixed(1)}k`} icon={<DollarSign className="w-8 h-8" />} />
        </KPIGrid>
      </motion.div>

      <motion.div variants={itemVariants}>
        <KPIGrid>
          <MetricCard label="Total Referrals" value={data.total.toLocaleString()} icon={<GitBranch className="w-8 h-8" />} />
          <MetricCard label="Converted Referrals" value={data.converted.toLocaleString()} icon={<Users className="w-8 h-8" />} />
          <MetricCard label="Referral Revenue" value={`$${(data.total_revenue / 1000).toFixed(1)}k`} icon={<DollarSign className="w-8 h-8" />} />
          <MetricCard label="Rev. per Affiliate" value={`$${data.revenuePerAffiliate.toFixed(0)}`} icon={<DollarSign className="w-8 h-8" />} />
        </KPIGrid>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <ChartContainer title="Clicks by Affiliate" description="Total clicks per affiliate">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.affiliates}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip contentStyle={{ backgroundColor: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                <Bar dataKey="clicks" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ChartContainer title="Conversions by Affiliate" description="Total conversions per affiliate">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.affiliates}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip contentStyle={{ backgroundColor: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                <Bar dataKey="conversions" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <ChartContainer title="Affiliate Leaderboard" description="Top performing affiliates">
          <Leaderboard
            items={data.affiliates.map((aff) => ({
              ...aff,
              revenue: `$${aff.commission.toFixed(0)}`,
              "Conv. Rate": `${aff.conversionRate.toFixed(1)}%`,
            }))}
            columns={[
              { key: "name", label: "Affiliate", sortable: true },
              { key: "tier", label: "Tier", sortable: true },
              { key: "clicks", label: "Clicks", format: (v) => (v as number).toLocaleString(), align: "right", sortable: true },
              { key: "conversions", label: "Conversions", format: (v) => (v as number).toLocaleString(), align: "right", sortable: true },
              { key: "Conv. Rate", label: "Conv. Rate", align: "right" },
              { key: "revenue", label: "Commission", align: "right", sortable: true },
            ]}
          />
        </ChartContainer>
      </motion.div>
    </motion.div>
  );
}
