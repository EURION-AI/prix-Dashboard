"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, DollarSign, Activity, GitPullRequest, UserCheck, UserPlus } from "lucide-react";
import { TimeRangeFilter } from "@/components/time-range-filter";
import { MetricCard } from "@/components/metric-card";
import { KPIGrid } from "@/components/kpi-grid";
import { ChartContainer } from "@/components/chart-container";
import { fetchDashboardData, DashboardOverview, TimeRange } from "@/lib/api-config";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24H");
  const [mounted, setMounted] = useState(false);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchDashboardData<DashboardOverview>("overview", timeRange);
        setOverview(data);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    if (mounted) {
      loadData();
    }
  }, [timeRange, mounted]);

  if (!mounted) return null;
  if (loading || !overview) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Global Overview</h1>
          <p className="text-slate-400 mt-1">
            All metrics across your entire platform
          </p>
        </div>
        <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
      </motion.div>

      {/* Users & PRs */}
      <motion.div variants={itemVariants}>
        <KPIGrid>
          <MetricCard
            label="Total Users"
            value={overview.totalUsers.toLocaleString()}
            icon={<Users className="w-8 h-8" />}
            trend={{ direction: "up", value: 0 }}
          />
          <MetricCard
            label="Total PRs Reviewed"
            value={overview.totalPrsReviewed.toLocaleString()}
            icon={<GitPullRequest className="w-8 h-8" />}
            trend={{ direction: "up", value: 0 }}
          />
          <MetricCard
            label="MRR"
            value={`$${(overview.mrr / 1000).toFixed(1)}k`}
            icon={<DollarSign className="w-8 h-8" />}
            trend={{ direction: "up", value: 0 }}
          />
          <MetricCard
            label="ARR"
            value={`$${(overview.arr / 1000000).toFixed(1)}M`}
            icon={<DollarSign className="w-8 h-8" />}
            trend={{ direction: "up", value: 0 }}
          />
        </KPIGrid>
      </motion.div>

      {/* Plan Distribution & Affiliates */}
      <motion.div variants={itemVariants}>
        <KPIGrid>
          <MetricCard
            label="Active Affiliates"
            value={overview.activeAffiliates.toLocaleString()}
            icon={<Users className="w-8 h-8" />}
            trend={{ direction: "up", value: 0 }}
          />
          <MetricCard
            label="Affiliate Revenue"
            value={`$${(overview.affiliateRevenue / 1000).toFixed(1)}k`}
            icon={<DollarSign className="w-8 h-8" />}
            trend={{ direction: "up", value: 0 }}
          />
          <MetricCard
            label="Total Referrals"
            value={overview.referrals.toLocaleString()}
            icon={<Activity className="w-8 h-8" />}
            trend={{ direction: "up", value: 0 }}
          />
          <MetricCard
            label="Referral Conv. Rate"
            value={`${overview.referralConversionRate.toFixed(1)}%`}
            icon={<UserPlus className="w-8 h-8" />}
            trend={{ direction: "up", value: 0 }}
          />
        </KPIGrid>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <ChartContainer
            title="Trends"
            description="Metrics over time"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={overview.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "white" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ChartContainer
            title="Users by Plan"
            description="Plan distribution across all users"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={overview.planDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="plan" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "white" }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </motion.div>
      </div>
    </motion.div>
  );
}
