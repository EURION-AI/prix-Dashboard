"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, DollarSign, Activity } from "lucide-react";
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
      {/* Header */}
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

      {/* KPI Grid */}
      <motion.div variants={itemVariants}>
        <KPIGrid>
          <MetricCard
            label="Visitors"
            value={overview.visitors.toLocaleString()}
            icon={<Users className="w-8 h-8" />}
            trend={{ direction: "up", value: 12.5 }}
          />
          <MetricCard
            label="Sessions"
            value={overview.sessions.toLocaleString()}
            icon={<Activity className="w-8 h-8" />}
            trend={{ direction: "up", value: 8.3 }}
          />
          <MetricCard
            label="Page Views"
            value={overview.pageViews.toLocaleString()}
            icon={<TrendingUp className="w-8 h-8" />}
            trend={{ direction: "down", value: -2.1 }}
          />
          <MetricCard
            label="Signups"
            value={overview.signups.toLocaleString()}
            icon={<Users className="w-8 h-8" />}
            trend={{ direction: "up", value: 15.7 }}
          />
        </KPIGrid>
      </motion.div>

      {/* Revenue and Subscription Metrics */}
      <motion.div variants={itemVariants}>
        <KPIGrid>
          <MetricCard
            label="MRR"
            value={`$${(overview.mrr / 1000).toFixed(0)}k`}
            icon={<DollarSign className="w-8 h-8" />}
            trend={{ direction: "up", value: 9.2 }}
          />
          <MetricCard
            label="ARR"
            value={`$${(overview.arr / 1000000).toFixed(1)}M`}
            icon={<DollarSign className="w-8 h-8" />}
            trend={{ direction: "up", value: 9.2 }}
          />
          <MetricCard
            label="Paying Customers"
            value={overview.payingCustomers.toLocaleString()}
            icon={<Users className="w-8 h-8" />}
            trend={{ direction: "up", value: 5.3 }}
          />
          <MetricCard
            label="Trial to Paid Rate"
            value={`${overview.trialToPaidRate.toFixed(1)}%`}
            icon={<TrendingUp className="w-8 h-8" />}
            trend={{ direction: "up", value: 2.1 }}
          />
        </KPIGrid>
      </motion.div>

      {/* Affiliate Metrics */}
      <motion.div variants={itemVariants}>
        <KPIGrid>
          <MetricCard
            label="Active Affiliates"
            value={overview.activeAffiliates.toLocaleString()}
            icon={<Users className="w-8 h-8" />}
            trend={{ direction: "up", value: 4.2 }}
          />
          <MetricCard
            label="Affiliate Revenue"
            value={`$${(overview.affiliateRevenue / 1000).toFixed(0)}k`}
            icon={<DollarSign className="w-8 h-8" />}
            trend={{ direction: "up", value: 18.5 }}
          />
        </KPIGrid>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <ChartContainer
            title="Visitor Trends"
            description="Total visitors over time"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={overview.visitorsChart}>
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
            title="Revenue Trends"
            description="MRR growth over time"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={overview.revenueChart}>
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
                  stroke="#10b981"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </motion.div>
      </div>

      {/* Top Websites */}
      <motion.div variants={itemVariants}>
        <ChartContainer
          title="Top Websites by Revenue"
          description="Revenue distribution across your properties"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overview.topWebsites}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "white" }}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </motion.div>
    </motion.div>
  );
}
