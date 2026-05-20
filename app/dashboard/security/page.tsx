"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Users, MousePointerClick } from "lucide-react";
import { TimeRangeFilter } from "@/components/time-range-filter";
import { MetricCard } from "@/components/metric-card";
import { KPIGrid } from "@/components/kpi-grid";
import { ChartContainer } from "@/components/chart-container";
import { Leaderboard } from "@/components/leaderboard";
import { fetchDashboardData, DashboardSecurity, TimeRange } from "@/lib/api-config";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SecurityPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24H");
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<DashboardSecurity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const d = await fetchDashboardData<DashboardSecurity>("security", timeRange);
        setData(d);
      } catch (error) {
        console.error("Failed to load security data:", error);
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
          <h1 className="text-3xl font-bold text-white">Security & Fraud</h1>
          <p className="text-slate-400 mt-1">Monitoring suspicious affiliate activity</p>
        </div>
        <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <KPIGrid>
          <MetricCard
            label="Total Affiliates Tracked"
            value={data.totalAffiliates.toLocaleString()}
            icon={<Users className="w-8 h-8" />}
          />
          <MetricCard
            label="Suspicious Affiliates"
            value={data.totalSuspicious.toLocaleString()}
            icon={<AlertTriangle className="w-8 h-8 text-red-500" />}
          />
          <MetricCard
            label="Total Clicks"
            value={data.totalClicks.toLocaleString()}
            icon={<MousePointerClick className="w-8 h-8 text-yellow-500" />}
          />
          <MetricCard
            label="Safety Score"
            value={data.totalAffiliates > 0 ? `${(((data.totalAffiliates - data.totalSuspicious) / data.totalAffiliates) * 100).toFixed(1)}%` : "N/A"}
            icon={<Shield className="w-8 h-8 text-green-500" />}
          />
        </KPIGrid>
      </motion.div>

      {/* Affiliate Click Analysis */}
      <motion.div variants={itemVariants}>
        <ChartContainer title="Affiliate Click Analysis" description="Click counts for each affiliate">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.affiliateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="affiliateCode" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
              <Bar dataKey="clicks" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </motion.div>

      {/* Suspicious Affiliates */}
      {data.suspiciousAffiliates.length > 0 && (
        <motion.div variants={itemVariants}>
          <ChartContainer
            title="Suspicious Affiliates"
            description="Affiliates with clicks but zero conversions"
          >
            <Leaderboard
              items={data.suspiciousAffiliates.map((a) => ({
                affiliateCode: a.affiliateCode,
                username: a.username,
                clicks: a.clicks,
                conversions: a.conversions,
                status: "⚠️ Suspicious",
              }))}
              columns={[
                { key: "username", label: "Username", sortable: true },
                { key: "affiliateCode", label: "Code", sortable: true },
                { key: "clicks", label: "Clicks", format: (v) => (v as number).toLocaleString(), align: "right", sortable: true },
                { key: "conversions", label: "Conversions", format: (v) => (v as number).toLocaleString(), align: "right" },
                { key: "status", label: "Status", align: "right" },
              ]}
            />
          </ChartContainer>
        </motion.div>
      )}

      {/* Security Recommendations */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Security Insights
          </h3>
          <div className="space-y-4">
            {data.totalSuspicious > 0 ? (
              <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10">
                <p className="text-sm font-medium text-red-400 mb-1">
                  Suspicious Affiliate Activity Detected
                </p>
                <p className="text-xs text-slate-400">
                  {data.totalSuspicious} affiliate(s) have clicks but zero conversions. Review and investigate.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/10">
                <p className="text-sm font-medium text-green-400 mb-1">
                  No Suspicious Activity
                </p>
                <p className="text-xs text-slate-400">
                  All affiliates with clicks also have conversions. No red flags detected.
                </p>
              </div>
            )}
            <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/10">
              <p className="text-sm font-medium text-blue-400 mb-1">
                Monitor Click-to-Conversion Ratio
              </p>
              <p className="text-xs text-slate-400">
                Affiliates with high clicks but zero or very low conversions may indicate click fraud.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
