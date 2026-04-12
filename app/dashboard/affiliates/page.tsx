"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, DollarSign, TrendingUp } from "lucide-react";
import { TimeRangeFilter } from "@/components/time-range-filter";
import { MetricCard } from "@/components/metric-card";
import { KPIGrid } from "@/components/kpi-grid";
import { ChartContainer } from "@/components/chart-container";
import { Leaderboard } from "@/components/leaderboard";
import { SearchableSelect } from "@/components/searchable-select";
import { fetchDashboardData, DashboardAffiliate, TimeRange } from "@/lib/api-config";
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from "recharts";

export default function AffiliatesPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24H");
  const [selectedAffiliate, setSelectedAffiliate] = useState<string>("all-affiliates");
  const [mounted, setMounted] = useState(false);
  const [affiliates, setAffiliates] = useState<DashboardAffiliate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchDashboardData<DashboardAffiliate>("affiliates", timeRange);
        setAffiliates(data);
      } catch (error) {
        console.error("Failed to load affiliates data:", error);
      } finally {
        setLoading(false);
      }
    }
    if (mounted) {
      loadData();
    }
  }, [timeRange, mounted]);

  if (!mounted) return null;
  if (loading || !affiliates) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const affiliateOptions = [
    { value: "all-affiliates", label: "All Affiliates" },
    ...affiliates.affiliates.map((aff) => ({
      value: aff.name,
      label: aff.name,
    })),
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

  const scatterData = affiliates.affiliates.map((aff) => ({
    clicks: aff.clicks,
    conversions: aff.conversions,
    revenue: aff.revenue / 1000,
    name: aff.name,
  }));

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
          <h1 className="text-3xl font-bold text-white">Affiliate Performance</h1>
          <p className="text-slate-400 mt-1">
            Track your affiliate network performance
          </p>
        </div>
        <div className="flex items-end gap-4">
          <SearchableSelect
            options={affiliateOptions}
            value={selectedAffiliate}
            onChange={setSelectedAffiliate}
            label="Affiliate"
            className="w-56"
          />
          <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={itemVariants}>
        <KPIGrid>
          <MetricCard
            label="Total Clicks"
            value={affiliates.clicks.toLocaleString()}
            icon={<TrendingUp className="w-8 h-8" />}
            trend={{ direction: "up", value: 14.2 }}
          />
          <MetricCard
            label="Conversions"
            value={affiliates.signups.toLocaleString()}
            icon={<Users className="w-8 h-8" />}
            trend={{ direction: "up", value: 19.8 }}
          />
          <MetricCard
            label="Conversion Rate"
            value={`${affiliates.conversionRate.toFixed(1)}%`}
            trend={{ direction: "up", value: 3.2 }}
          />
          <MetricCard
            label="Commission Owed"
            value={`$${(affiliates.commissionOwed / 1000).toFixed(0)}k`}
            icon={<DollarSign className="w-8 h-8" />}
            trend={{ direction: "up", value: 22.1 }}
          />
        </KPIGrid>
      </motion.div>

      {/* Affiliate Performance Metric */}
      <motion.div variants={itemVariants}>
        <MetricCard
          label="Revenue per Affiliate"
          value={`$${affiliates.revenuePerAffiliate.toLocaleString()}`}
          icon={<DollarSign className="w-8 h-8" />}
          trend={{ direction: "up", value: 7.5 }}
          className="col-span-full"
        />
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <ChartContainer
            title="Clicks vs Conversions"
            description="Conversion efficiency by affiliate"
          >
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="clicks"
                  stroke="rgba(255,255,255,0.5)"
                  name="Clicks"
                />
                <YAxis
                  dataKey="conversions"
                  stroke="rgba(255,255,255,0.5)"
                  name="Conversions"
                />
                <ZAxis dataKey="revenue" range={[50, 500]} name="Revenue" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  cursor={{ strokeDasharray: "3 3" }}
                />
                <Scatter
                  name="Affiliates"
                  data={scatterData}
                  fill="#3b82f6"
                  fillOpacity={0.7}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ChartContainer
            title="Conversion Trends"
            description="Affiliate conversion rate over time"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={affiliates.trendChart}>
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
                  stroke="#10b981"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </motion.div>
      </div>

      {/* Affiliate Leaderboard */}
      <motion.div variants={itemVariants}>
        <ChartContainer
          title="Affiliate Leaderboard"
          description="Top performing affiliates"
        >
          <Leaderboard
            items={affiliates.affiliates.map((aff) => ({
              name: aff.name,
              clicks: aff.clicks,
              conversions: aff.conversions,
              revenue: `$${aff.revenue.toLocaleString()}`,
              commission: `$${aff.commission.toLocaleString()}`,
              "Conversion Rate": `${aff.conversionRate.toFixed(2)}%`,
            }))}
            columns={[
              { key: "name", label: "Affiliate", sortable: true },
              {
                key: "clicks",
                label: "Clicks",
                format: (v) => (v as number).toLocaleString(),
                align: "right",
                sortable: true,
              },
              {
                key: "conversions",
                label: "Conversions",
                format: (v) => (v as number).toLocaleString(),
                align: "right",
                sortable: true,
              },
              { key: "revenue", label: "Revenue", align: "right", sortable: true },
              {
                key: "commission",
                label: "Commission",
                align: "right",
                sortable: true,
              },
              {
                key: "Conversion Rate",
                label: "Conv. Rate",
                align: "right",
                sortable: true,
              },
            ]}
          />
        </ChartContainer>
      </motion.div>
    </motion.div>
  );
}
