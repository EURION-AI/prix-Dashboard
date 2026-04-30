"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, Users, Eye, Clock, BarChart3 } from "lucide-react";
import { TimeRangeFilter } from "@/components/time-range-filter";
import { MetricCard } from "@/components/metric-card";
import { KPIGrid } from "@/components/kpi-grid";
import { ChartContainer } from "@/components/chart-container";
import { Leaderboard } from "@/components/leaderboard";
import { SearchableSelect } from "@/components/searchable-select";
import { fetchDashboardData, TimeRange } from "@/lib/api-config";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function WebsitesAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24H");
  const [selectedWebsite, setSelectedWebsite] = useState<string>("site_1");
  const [mounted, setMounted] = useState(false);
  const [websitesData, setWebsitesData] = useState<{ websites: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchDashboardData<{ websites: any[] }>("analytics", timeRange);
        setWebsitesData(data);
      } catch (error) {
        console.error("Failed to load websites data:", error);
      } finally {
        setLoading(false);
      }
    }
    if (mounted) {
      loadData();
    }
  }, [timeRange, mounted]);

  if (!mounted) return null;
  if (loading || !websitesData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const website = websitesData.websites.find((w) => w.id === selectedWebsite) || websitesData.websites[0];

  const websiteOptions = websitesData.websites.map((w) => ({
    value: w.id,
    label: w.name,
  }));

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
          <h1 className="text-3xl font-bold text-white">Website Analytics</h1>
          <p className="text-slate-400 mt-1">Track performance across your websites</p>
        </div>
        <div className="flex items-end gap-4">
          <SearchableSelect
            options={websiteOptions}
            value={selectedWebsite}
            onChange={setSelectedWebsite}
            label="Website"
            className="w-48"
          />
          <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
        </div>
      </motion.div>

      {/* Traffic Metrics */}
      <motion.div variants={itemVariants}>
        <KPIGrid>
          <MetricCard
            label="Unique Visitors"
            value={website.uniqueVisitors.toLocaleString()}
            icon={<Users className="w-8 h-8" />}
            trend={{ direction: "up", value: 12.3 }}
          />
          <MetricCard
            label="Sessions"
            value={website.sessions.toLocaleString()}
            icon={<Globe className="w-8 h-8" />}
            trend={{ direction: "up", value: 8.9 }}
          />
          <MetricCard
            label="Page Views"
            value={website.pageViews.toLocaleString()}
            icon={<Eye className="w-8 h-8" />}
            trend={{ direction: "down", value: -1.2 }}
          />
          <MetricCard
            label="Avg Duration"
            value={`${website.avgSessionDuration.toFixed(1)}m`}
            icon={<Clock className="w-8 h-8" />}
            trend={{ direction: "up", value: 5.4 }}
          />
        </KPIGrid>
      </motion.div>

      {/* Engagement Metrics */}
      <motion.div variants={itemVariants}>
        <KPIGrid>
          <MetricCard
            label="Bounce Rate"
            value={`${website.bounceRate.toFixed(1)}%`}
            trend={{ direction: "down", value: 3.2 }}
          />
          <MetricCard
            label="Pages/Session"
            value={website.pagesPerSession.toFixed(1)}
            trend={{ direction: "up", value: 4.1 }}
          />
          <MetricCard
            label="Scroll Depth"
            value={`${website.scrollDepth.toFixed(1)}%`}
            trend={{ direction: "up", value: 2.8 }}
          />
          <MetricCard
            label="Exit Rate"
            value={`${website.exitRate.toFixed(1)}%`}
            trend={{ direction: "down", value: 1.5 }}
          />
        </KPIGrid>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <ChartContainer
            title="Traffic Trends"
            description="Visitor trends over time"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={website.trafficTrendChart}>
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
            title="Traffic Sources"
            description="Distribution of visitor sources"
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={website.trafficSources}
                  dataKey="visitors"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {website.trafficSources.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </motion.div>
      </div>

      {/* Geography */}
      <motion.div variants={itemVariants}>
        <ChartContainer
          title="Visitors by Geography"
          description="Top countries by traffic"
        >
          <Leaderboard
            items={website.geography}
            columns={[
              { key: "country", label: "Country", sortable: true },
              {
                key: "visitors",
                label: "Visitors",
                format: (v) => (v as number).toLocaleString(),
                align: "right",
                sortable: true,
              },
            ]}
          />
        </ChartContainer>
      </motion.div>

      {/* Top Referrers */}
      <motion.div variants={itemVariants}>
        <ChartContainer
          title="Top Referrers"
          description="External sites driving traffic"
        >
          <Leaderboard
            items={website.topReferrers}
            columns={[
              { key: "domain", label: "Domain", sortable: true },
              {
                key: "visitors",
                label: "Visitors",
                format: (v) => (v as number).toLocaleString(),
                align: "right",
                sortable: true,
              },
            ]}
          />
        </ChartContainer>
      </motion.div>

      {/* Campaigns */}
      <motion.div variants={itemVariants}>
        <ChartContainer
          title="Campaign Performance"
          description="How each campaign is performing"
        >
          <Leaderboard
            items={website.campaigns}
            columns={[
              { key: "name", label: "Campaign", sortable: true },
              {
                key: "visitors",
                label: "Visitors",
                format: (v) => (v as number).toLocaleString(),
                align: "right",
                sortable: true,
              },
              {
                key: "conversions",
                label: "Conversions",
                format: (v) =>
                  `${((v as number) / 100).toFixed(1)}% conversion`,
                align: "right",
              },
            ]}
          />
        </ChartContainer>
      </motion.div>
    </motion.div>
  );
}
