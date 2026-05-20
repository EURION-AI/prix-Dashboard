"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Users, Package } from "lucide-react";
import { TimeRangeFilter } from "@/components/time-range-filter";
import { MetricCard } from "@/components/metric-card";
import { KPIGrid } from "@/components/kpi-grid";
import { ChartContainer } from "@/components/chart-container";
import { Leaderboard } from "@/components/leaderboard";
import { fetchDashboardData, DashboardSubscription, TimeRange } from "@/lib/api-config";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function SubscriptionsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24H");
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<DashboardSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const d = await fetchDashboardData<DashboardSubscription>("subscriptions", timeRange);
        setData(d);
      } catch (error) {
        console.error("Failed to load subscriptions:", error);
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
          <h1 className="text-3xl font-bold text-white">Subscriptions</h1>
          <p className="text-slate-400 mt-1">User plans and revenue metrics</p>
        </div>
        <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <KPIGrid>
          <MetricCard label="Total Users" value={data.totalUsers.toLocaleString()} icon={<Users className="w-8 h-8" />} />
          <MetricCard label="Paying Users" value={data.payingUsers.toLocaleString()} icon={<DollarSign className="w-8 h-8" />} />
          <MetricCard label="Free Users" value={data.freeUsers.toLocaleString()} icon={<Users className="w-8 h-8" />} />
          <MetricCard label="MRR" value={`$${(data.mrr / 1000).toFixed(1)}k`} icon={<DollarSign className="w-8 h-8" />} />
        </KPIGrid>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <ChartContainer title="Plan Distribution" description="Users grouped by plan">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.planDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="plan" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip contentStyle={{ backgroundColor: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ChartContainer title="Revenue by Tier" description="Revenue distribution across subscription tiers">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.revenueByTier} dataKey="revenue" nameKey="subscription_tier" cx="50%" cy="50%" outerRadius={100} label>
                  {data.revenueByTier.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </motion.div>
      </div>

      {data.razorpayPlans.length > 0 && (
        <motion.div variants={itemVariants}>
          <ChartContainer title="Pricing Plans" description="Available subscription plans">
            <Leaderboard
              items={data.razorpayPlans}
              columns={[
                { key: "internal_plan_id", label: "Plan", sortable: true },
                { key: "amount", label: "Price", format: (v) => `$${((v as number) / 100).toFixed(2)}`, align: "right", sortable: true },
                { key: "currency", label: "Currency", align: "right" },
              ]}
            />
          </ChartContainer>
        </motion.div>
      )}
    </motion.div>
  );
}
