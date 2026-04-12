"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Users, TrendingUp } from "lucide-react";
import { TimeRangeFilter } from "@/components/time-range-filter";
import { MetricCard } from "@/components/metric-card";
import { KPIGrid } from "@/components/kpi-grid";
import { ChartContainer } from "@/components/chart-container";
import { SearchableSelect } from "@/components/searchable-select";
import { fetchDashboardData, DashboardSubscription, TimeRange } from "@/lib/api-config";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

export default function SubscriptionsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24H");
  const [selectedWebsite, setSelectedWebsite] = useState<string>("website-1");
  const [selectedTier, setSelectedTier] = useState<string>("all-tiers");
  const [mounted, setMounted] = useState(false);
  const [saas, setSaaS] = useState<DashboardSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchDashboardData<DashboardSubscription>("subscriptions", timeRange);
        setSaaS(data);
      } catch (error) {
        console.error("Failed to load subscriptions data:", error);
      } finally {
        setLoading(false);
      }
    }
    if (mounted) {
      loadData();
    }
  }, [timeRange, mounted]);

  if (!mounted) return null;
  if (loading || !saas) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const websiteOptions = [
    { value: "website-1", label: "All Websites" },
  ];

  const tierOptions = [
    { value: "all-tiers", label: "All Tiers" },
    { value: "starter", label: "Starter" },
    { value: "pro", label: "Pro" },
    { value: "enterprise", label: "Enterprise" },
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

  const churnNewData = saas.churnNewChart.map((item, index) => ({
    date: item.date,
    "New Subs": Math.max(20, 50 - index * 0.5 + Math.floor(Math.random() * 20)),
    "Churn": Math.max(5, 15 - index * 0.3 + Math.floor(Math.random() * 10)),
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
          <h1 className="text-3xl font-bold text-white">Subscriptions</h1>
          <p className="text-slate-400 mt-1">SaaS revenue and customer metrics</p>
        </div>
        <div className="flex items-end gap-4">
          <SearchableSelect
            options={websiteOptions}
            value={selectedWebsite}
            onChange={setSelectedWebsite}
            label="Website"
            className="w-48"
          />
          <SearchableSelect
            options={tierOptions}
            value={selectedTier}
            onChange={setSelectedTier}
            label="Paid Tier"
            className="w-40"
          />
          <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
        </div>
      </motion.div>

      {/* Revenue Metrics */}
      <motion.div variants={itemVariants}>
        <KPIGrid>
          <MetricCard
            label="MRR"
            value={`$${(saas.mrr / 1000).toFixed(0)}k`}
            icon={<DollarSign className="w-8 h-8" />}
            trend={{ direction: "up", value: 9.2 }}
          />
          <MetricCard
            label="ARR"
            value={`$${(saas.arr / 1000000).toFixed(1)}M`}
            icon={<DollarSign className="w-8 h-8" />}
            trend={{ direction: "up", value: 9.2 }}
          />
          <MetricCard
            label="ARPA"
            value={`$${saas.arpa.toFixed(0)}`}
            trend={{ direction: "up", value: 3.1 }}
          />
          <MetricCard
            label="NRR"
            value={`${saas.nrr}%`}
            trend={{ direction: "up", value: 2.5 }}
          />
        </KPIGrid>
      </motion.div>

      {/* Customer Metrics */}
      <motion.div variants={itemVariants}>
        <KPIGrid>
          <MetricCard
            label="Active Subscriptions"
            value={saas.activeSubs.toLocaleString()}
            icon={<Users className="w-8 h-8" />}
            trend={{ direction: "up", value: 5.3 }}
          />
          <MetricCard
            label="Trial Users"
            value={saas.trialUsers.toLocaleString()}
            icon={<Users className="w-8 h-8" />}
            trend={{ direction: "up", value: 12.1 }}
          />
          <MetricCard
            label="Churn Rate"
            value={`${saas.churnRate.toFixed(1)}%`}
            trend={{ direction: "down", value: 0.8 }}
          />
          <MetricCard
            label="GRR"
            value={`${saas.grr}%`}
            trend={{ direction: "up", value: 1.2 }}
          />
        </KPIGrid>
      </motion.div>

      {/* Expansion Revenue */}
      <motion.div variants={itemVariants}>
        <KPIGrid>
          <MetricCard
            label="Expansion Revenue"
            value={`$${(saas.expansionRevenue / 1000).toFixed(0)}k`}
            icon={<TrendingUp className="w-8 h-8" />}
            trend={{ direction: "up", value: 18.5 }}
          />
          <MetricCard
            label="Contraction Revenue"
            value={`$${(saas.contractionRevenue / 1000).toFixed(0)}k`}
            trend={{ direction: "down", value: 5.2 }}
          />
          <MetricCard
            label="Free Users"
            value={saas.freeUsers.toLocaleString()}
            trend={{ direction: "up", value: 8.3 }}
          />
          <MetricCard
            label="Revenue Churn"
            value={`${saas.revenueChurn.toFixed(1)}%`}
            trend={{ direction: "down", value: 2.1 }}
          />
        </KPIGrid>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <ChartContainer title="MRR Growth" description="Monthly recurring revenue trend">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={saas.mrrChart}>
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
                  stroke="#10b981"
                  fill="#10b98166"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ChartContainer
            title="Customer Segments"
            description="Revenue by customer segment"
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={saas.customerSegments}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {saas.customerSegments.map((entry, index) => (
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

      {/* Churn vs New Subscriptions */}
      <motion.div variants={itemVariants}>
        <ChartContainer
          title="Churn vs New Subscriptions"
          description="Customer acquisition vs churn"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={churnNewData}>
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
              <Legend />
              <Line
                type="monotone"
                dataKey="New Subs"
                stroke="#10b981"
                dot={false}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="Churn"
                stroke="#ef4444"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </motion.div>
    </motion.div>
  );
}
