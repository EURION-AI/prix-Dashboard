"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GitPullRequest, Bug, Clock, BookOpen } from "lucide-react";
import { TimeRangeFilter } from "@/components/time-range-filter";
import { MetricCard } from "@/components/metric-card";
import { KPIGrid } from "@/components/kpi-grid";
import { ChartContainer } from "@/components/chart-container";
import { Leaderboard } from "@/components/leaderboard";
import { fetchDashboardData, DashboardActivity, TimeRange } from "@/lib/api-config";
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

export default function ActivityPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24H");
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<DashboardActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const d = await fetchDashboardData<DashboardActivity>("activity", timeRange);
        setData(d);
      } catch (error) {
        console.error("Failed to load activity data:", error);
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
          <h1 className="text-3xl font-bold text-white">Activity</h1>
          <p className="text-slate-400 mt-1">PR reviews and issue planning activity</p>
        </div>
        <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <KPIGrid>
          <MetricCard label="Total PRs Reviewed" value={data.totalPrs.toLocaleString()} icon={<GitPullRequest className="w-8 h-8" />} />
          <MetricCard label="Total Issue Executions" value={data.totalIssues.toLocaleString()} icon={<Bug className="w-8 h-8" />} />
          <MetricCard label="Avg Exec Duration" value={`${data.avgExecutionDuration.toFixed(0)}ms`} icon={<Clock className="w-8 h-8" />} />
          <MetricCard label="Active Repos" value={data.prsByRepo.length.toLocaleString()} icon={<BookOpen className="w-8 h-8" />} />
        </KPIGrid>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <ChartContainer title="PR Activity" description="PR reviews over time">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.activityTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip contentStyle={{ backgroundColor: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ChartContainer title="Issue Executions by Repo" description="Issue planning executions per repo">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.issueExecutions}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="repo_name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip contentStyle={{ backgroundColor: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <ChartContainer title="PRs by Repository" description="Repositories with most PR activity">
          <Leaderboard
            items={data.prsByRepo}
            columns={[
              { key: "repo_name", label: "Repository", sortable: true },
              { key: "count", label: "PRs Reviewed", format: (v) => (v as number).toLocaleString(), align: "right", sortable: true },
            ]}
          />
        </ChartContainer>
      </motion.div>
    </motion.div>
  );
}
