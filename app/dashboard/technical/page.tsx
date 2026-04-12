"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, AlertCircle, CheckCircle2 } from "lucide-react";
import { TimeRangeFilter } from "@/components/time-range-filter";
import { MetricCard } from "@/components/metric-card";
import { KPIGrid } from "@/components/kpi-grid";
import { ChartContainer } from "@/components/chart-container";
import { fetchDashboardData, DashboardTechnical, TimeRange } from "@/lib/api-config";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TechnicalPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24H");
  const [mounted, setMounted] = useState(false);
  const [tech, setTech] = useState<DashboardTechnical | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchDashboardData<DashboardTechnical>("technical", timeRange);
        setTech(data);
      } catch (error) {
        console.error("Failed to load technical data:", error);
      } finally {
        setLoading(false);
      }
    }
    if (mounted) {
      loadData();
    }
  }, [timeRange, mounted]);

  if (!mounted) return null;
  if (loading || !tech) {
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

  const getHealthStatus = (metric: number, threshold: number) => {
    return metric < threshold ? "good" : metric < threshold * 1.5 ? "warning" : "critical";
  };

  const pageLoadStatus = getHealthStatus(tech.pageLoadTime, 1500);
  const ttfbStatus = getHealthStatus(tech.ttfb, 300);
  const apiStatus = getHealthStatus(tech.apiResponseTime, 200);
  const errorStatus = tech.errorRate < 0.1 ? "good" : "warning";

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
          <h1 className="text-3xl font-bold text-white">Technical Performance</h1>
          <p className="text-slate-400 mt-1">Infrastructure health and performance metrics</p>
        </div>
        <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
      </motion.div>

      {/* Performance Metrics */}
      <motion.div variants={itemVariants}>
        <KPIGrid>
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-400 mb-2">Page Load Time</p>
                <p className="text-3xl font-bold text-white">{tech.pageLoadTime}ms</p>
                <div className="mt-2 flex items-center gap-1 text-sm text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Good</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-400 mb-2">TTFB</p>
                <p className="text-3xl font-bold text-white">{tech.ttfb}ms</p>
                <div className="mt-2 flex items-center gap-1 text-sm text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Good</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-400 mb-2">API Response</p>
                <p className="text-3xl font-bold text-white">{tech.apiResponseTime}ms</p>
                <div className="mt-2 flex items-center gap-1 text-sm text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Good</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-400 mb-2">Uptime</p>
                <p className="text-3xl font-bold text-white">{tech.uptime}%</p>
                <div className="mt-2 flex items-center gap-1 text-sm text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Excellent</span>
                </div>
              </div>
            </div>
          </div>
        </KPIGrid>
      </motion.div>

      {/* Error Rate */}
      <motion.div variants={itemVariants}>
        <KPIGrid>
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 col-span-full md:col-span-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-400 mb-2">Error Rate</p>
                <p className="text-3xl font-bold text-white">
                  {(tech.errorRate * 100).toFixed(3)}%
                </p>
                <div className="mt-2 flex items-center gap-1 text-sm text-yellow-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>Acceptable - Monitor</span>
                </div>
              </div>
            </div>
          </div>
        </KPIGrid>
      </motion.div>

      {/* Core Web Vitals */}
      <motion.div variants={itemVariants}>
        <ChartContainer title="Core Web Vitals" description="Google&apos;s page experience metrics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg bg-white/5 border border-white/10 p-4">
              <p className="text-sm text-slate-400 mb-2">LCP (Largest Contentful Paint)</p>
              <p className="text-2xl font-bold text-white mb-1">{tech.coreWebVitals.lcp}ms</p>
              <p className="text-xs text-slate-500">Target: &lt;2500ms</p>
              <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{
                    width: `${Math.min(100, (tech.coreWebVitals.lcp / 2500) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-lg bg-white/5 border border-white/10 p-4">
              <p className="text-sm text-slate-400 mb-2">FID (First Input Delay)</p>
              <p className="text-2xl font-bold text-white mb-1">{tech.coreWebVitals.fid}ms</p>
              <p className="text-xs text-slate-500">Target: &lt;100ms</p>
              <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500"
                  style={{
                    width: `${Math.min(100, (tech.coreWebVitals.fid / 100) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-lg bg-white/5 border border-white/10 p-4">
              <p className="text-sm text-slate-400 mb-2">CLS (Cumulative Layout Shift)</p>
              <p className="text-2xl font-bold text-white mb-1">
                {tech.coreWebVitals.cls.toFixed(2)}
              </p>
              <p className="text-xs text-slate-500">Target: &lt;0.1</p>
              <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{
                    width: `${Math.min(100, (tech.coreWebVitals.cls / 0.1) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </ChartContainer>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <ChartContainer
            title="Page Load Time Trend"
            description="Performance over time"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tech.pageLoadChart}>
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

        <motion.div variants={itemVariants}>
          <ChartContainer
            title="Error Rate Trend"
            description="Errors per 10k requests"
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={tech.errorRateChart}>
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
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#ef4444"
                  fill="#ef444433"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </motion.div>
      </div>

      {/* Uptime History */}
      <motion.div variants={itemVariants}>
        <ChartContainer
          title="Uptime History"
          description="Service availability over time"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={tech.uptimeHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" domain={[99, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                fill="#10b98166"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </motion.div>
    </motion.div>
  );
}
