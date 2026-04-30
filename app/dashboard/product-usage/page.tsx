"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Zap, TrendingUp } from "lucide-react";
import { TimeRangeFilter } from "@/components/time-range-filter";
import { MetricCard } from "@/components/metric-card";
import { KPIGrid } from "@/components/kpi-grid";
import { ChartContainer } from "@/components/chart-container";
import { Leaderboard } from "@/components/leaderboard";
import { SearchableSelect } from "@/components/searchable-select";
import { fetchDashboardData, DashboardProductUsage, TimeRange } from "@/lib/api-config";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ProductUsagePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24H");
  const [selectedUser, setSelectedUser] = useState<string>("all-users");
  const [mounted, setMounted] = useState(false);
  const [usage, setUsage] = useState<DashboardProductUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchDashboardData<DashboardProductUsage>("product-usage", timeRange);
        setUsage(data);
      } catch (error) {
        console.error("Failed to load product usage data:", error);
      } finally {
        setLoading(false);
      }
    }
    if (mounted) {
      loadData();
    }
  }, [timeRange, mounted]);

  if (!mounted) return null;
  if (loading || !usage) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const userOptions = [
    { value: "all-users", label: "All Users" },
    { value: "user-1", label: "John Developer" },
    { value: "user-2", label: "Sarah Engineer" },
    { value: "user-3", label: "Mike Lead" },
    { value: "user-4", label: "Emma Tech" },
  ];

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
        className="flex items-end justify-between gap-4"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Product Usage</h1>
          <p className="text-slate-400 mt-1">User engagement and feature adoption</p>
        </div>
        <div className="flex items-end gap-4">
          <SearchableSelect
            options={userOptions}
            value={selectedUser}
            onChange={setSelectedUser}
            label="User"
            className="w-52"
          />
          <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
        </div>
      </motion.div>

      {/* DAU / WAU / MAU */}
      <motion.div variants={itemVariants}>
        <KPIGrid>
          <MetricCard
            label="Daily Active Users"
            value={usage.dau.toLocaleString()}
            icon={<Users className="w-8 h-8" />}
            trend={{ direction: "up", value: 8.5 }}
          />
          <MetricCard
            label="Weekly Active Users"
            value={usage.wau.toLocaleString()}
            icon={<Users className="w-8 h-8" />}
            trend={{ direction: "up", value: 12.3 }}
          />
          <MetricCard
            label="Monthly Active Users"
            value={usage.mau.toLocaleString()}
            icon={<Users className="w-8 h-8" />}
            trend={{ direction: "up", value: 15.7 }}
          />
          <MetricCard
            label="DAU/MAU Ratio"
            value={`${((usage.dau / usage.mau) * 100).toFixed(1)}%`}
            trend={{ direction: "up", value: 2.1 }}
          />
        </KPIGrid>
      </motion.div>

      {/* Developer Metrics */}
      <motion.div variants={itemVariants}>
        <KPIGrid>
          <MetricCard
            label="Tokens Used"
            value={`${Math.floor(Math.random() * 50000 + 10000).toLocaleString()}`}
            icon={<Zap className="w-8 h-8" />}
            trend={{ direction: "up", value: 24.5 }}
          />
          <MetricCard
            label="PRs Reviewed"
            value={`${Math.floor(Math.random() * 200 + 50)}`}
            icon={<TrendingUp className="w-8 h-8" />}
            trend={{ direction: "up", value: 18.3 }}
          />
          <MetricCard
            label="Issues Fixed"
            value={`${Math.floor(Math.random() * 150 + 30)}`}
            trend={{ direction: "up", value: 31.2 }}
          />
          <MetricCard
            label="Avg Token/PR"
            value={`${Math.floor(Math.random() * 500 + 100)}`}
            trend={{ direction: "down", value: 5.1 }}
          />
        </KPIGrid>
      </motion.div>

      {/* DAU / WAU / MAU Chart */}
      <motion.div variants={itemVariants}>
        <ChartContainer
          title="User Activity Trends"
          description="Daily, weekly, and monthly active users"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={usage.dauWauMauChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
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

      {/* Feature Usage */}
      <motion.div variants={itemVariants}>
        <ChartContainer
          title="Feature Usage"
          description="Which features your users engage with most"
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={usage.features}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="users" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </motion.div>

      {/* Feature Details */}
      <motion.div variants={itemVariants}>
        <ChartContainer
          title="Feature Engagement"
          description="Users and time spent per feature"
        >
          <Leaderboard
            items={usage.features}
            columns={[
              { key: "name", label: "Feature", sortable: true },
              {
                key: "users",
                label: "Active Users",
                format: (v) => (v as number).toLocaleString(),
                align: "right",
                sortable: true,
              },
              {
                key: "timeSpent",
                label: "Avg Time (min)",
                align: "right",
                sortable: true,
              },
            ]}
          />
        </ChartContainer>
      </motion.div>

      {/* Cohort Retention */}
      <motion.div variants={itemVariants}>
        <ChartContainer
          title="Cohort Retention"
          description="User retention by signup cohort (week-over-week)"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">
                    Cohort
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">
                    Week 0
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">
                    Week 1
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">
                    Week 2
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">
                    Week 3
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">
                    Week 4
                  </th>
                </tr>
              </thead>
              <tbody>
                {usage.cohortRetention.map((cohort, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium">
                      {cohort.cohort}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-block bg-blue-500/20 text-blue-400 px-3 py-1 rounded text-sm font-medium">
                        {cohort.week0}%
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-block bg-blue-500/15 text-blue-300 px-3 py-1 rounded text-sm font-medium">
                        {cohort.week1}%
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-block bg-blue-500/10 text-blue-200 px-3 py-1 rounded text-sm font-medium">
                        {cohort.week2}%
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {cohort.week3 > 0 ? (
                        <div className="inline-block bg-blue-500/5 text-blue-100 px-3 py-1 rounded text-sm font-medium">
                          {cohort.week3}%
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {cohort.week4 > 0 ? (
                        <div className="inline-block bg-blue-500/5 text-blue-100 px-3 py-1 rounded text-sm font-medium">
                          {cohort.week4}%
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartContainer>
      </motion.div>
    </motion.div>
  );
}
