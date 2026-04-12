"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Users } from "lucide-react";
import { TimeRangeFilter } from "@/components/time-range-filter";
import { MetricCard } from "@/components/metric-card";
import { KPIGrid } from "@/components/kpi-grid";
import { ChartContainer } from "@/components/chart-container";
import { Leaderboard } from "@/components/leaderboard";
import { fetchDashboardData, DashboardSecurity, TimeRange } from "@/lib/api-config";
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
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

export default function SecurityPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24H");
  const [mounted, setMounted] = useState(false);
  const [security, setSecurity] = useState<DashboardSecurity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchDashboardData<DashboardSecurity>("security", timeRange);
        setSecurity(data);
      } catch (error) {
        console.error("Failed to load security data:", error);
      } finally {
        setLoading(false);
      }
    }
    if (mounted) {
      loadData();
    }
  }, [timeRange, mounted]);

  if (!mounted) return null;
  if (loading || !security) {
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
          <h1 className="text-3xl font-bold text-white">Security & Fraud</h1>
          <p className="text-slate-400 mt-1">Monitoring suspicious activity and security threats</p>
        </div>
        <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
      </motion.div>

      {/* Security Alerts */}
      <motion.div variants={itemVariants}>
        <KPIGrid>
          <MetricCard
            label="Failed Logins"
            value={security.failedLogins.toLocaleString()}
            icon={<AlertTriangle className="w-8 h-8 text-yellow-500" />}
            trend={{ direction: "up", value: 8.2 }}
          />
          <MetricCard
            label="Suspicious Signups"
            value={security.suspiciousSignups.toLocaleString()}
            icon={<Shield className="w-8 h-8 text-red-500" />}
            trend={{ direction: "down", value: 3.5 }}
          />
          <MetricCard
            label="Multiple Accounts/IP"
            value={security.multipleAccountsPerIp.toLocaleString()}
            icon={<Users className="w-8 h-8 text-orange-500" />}
            trend={{ direction: "up", value: 5.1 }}
          />
          <MetricCard
            label="Affiliate Click Spikes"
            value={security.affiliateClickSpikes.toLocaleString()}
            icon={<AlertTriangle className="w-8 h-8 text-red-500" />}
            trend={{ direction: "down", value: 2.8 }}
          />
        </KPIGrid>
      </motion.div>

      {/* Risk Scores */}
      <motion.div variants={itemVariants}>
        <ChartContainer
          title="Risk Score Breakdown"
          description="Security risk assessment by category"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={security.riskScores}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="type" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="score" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </motion.div>

      {/* Suspicious Activity Trend */}
      <motion.div variants={itemVariants}>
        <ChartContainer
          title="Suspicious Activity Timeline"
          description="Detected suspicious events over time"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={security.suspiciousActivityChart}>
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
                stroke="#ef4444"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </motion.div>

      {/* Fraud Heatmap */}
      <motion.div variants={itemVariants}>
        <ChartContainer
          title="Affiliate Fraud Heatmap"
          description="Risk levels by affiliate activity"
        >
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="time"
                type="category"
                stroke="rgba(255,255,255,0.5)"
                name="Time"
              />
              <YAxis
                dataKey="affiliateId"
                type="category"
                stroke="rgba(255,255,255,0.5)"
                name="Affiliate"
              />
              <ZAxis dataKey="risk" range={[50, 500]} name="Risk Score" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
                cursor={{ strokeDasharray: "3 3" }}
              />
              <Scatter
                name="Risk Events"
                data={security.fraudHeatmap}
                fill="#ef4444"
                fillOpacity={0.7}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </motion.div>

      {/* Security Recommendations */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Security Recommendations
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
              <p className="text-sm font-medium text-yellow-400 mb-1">
                Monitor Failed Login Attempts
              </p>
              <p className="text-xs text-slate-400">
                Failed login rate is elevated. Consider implementing account lockout policies.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10">
              <p className="text-sm font-medium text-red-400 mb-1">
                Review Suspicious Signups
              </p>
              <p className="text-xs text-slate-400">
                {security.suspiciousSignups} suspicious signup patterns detected. Review and block if needed.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-orange-500/30 bg-orange-500/10">
              <p className="text-sm font-medium text-orange-400 mb-1">
                Affiliate Click Fraud Alert
              </p>
              <p className="text-xs text-slate-400">
                Unusual affiliate click patterns detected. Review affiliate activity logs.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/10">
              <p className="text-sm font-medium text-blue-400 mb-1">
                Enable 2FA for High-Risk Accounts
              </p>
              <p className="text-xs text-slate-400">
                Consider requiring 2FA for accounts with geographic anomalies.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
