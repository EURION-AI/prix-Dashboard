export type TimeRange = "24H" | "7D" | "1M" | "3M" | "ALL";

// Common data types
export interface ChartDataPoint {
  date: string;
  value: number;
  [key: string]: string | number;
}

// Global Overview
export interface GlobalOverviewData {
  visitors: number;
  sessions: number;
  pageViews: number;
  signups: number;
  payingCustomers: number;
  mrr: number;
  arr: number;
  trialToPaidRate: number;
  activeAffiliates: number;
  affiliateRevenue: number;
  visitorsChart: ChartDataPoint[];
  revenueChart: ChartDataPoint[];
  topWebsites: Array<{ name: string; revenue: number }>;
}

// Website Analytics
export interface WebsiteAnalyticsData {
  websites: Array<{
    id: string;
    name: string;
    uniqueVisitors: number;
    sessions: number;
    pageViews: number;
    bounceRate: number;
    avgSessionDuration: number;
    pagesPerSession: number;
    scrollDepth: number;
    exitRate: number;
    newVsReturning: { new: number; returning: number };
    geography: Array<{ country: string; visitors: number }>;
    devices: Array<{ type: string; visitors: number }>;
    trafficSources: Array<{ source: string; visitors: number }>;
    campaigns: Array<{ name: string; visitors: number; conversions: number }>;
    topReferrers: Array<{ domain: string; visitors: number }>;
    trafficTrendChart: ChartDataPoint[];
  }>;
}

// Conversion Funnel
export interface FunnelStage {
  name: string;
  count: number;
  conversionRate: number;
}

export interface ConversionFunnelData {
  stages: FunnelStage[];
  overallConversionRate: number;
  dropoffChart: ChartDataPoint[];
}

// SaaS Subscriptions
export interface SaaSData {
  mrr: number;
  arr: number;
  arpa: number;
  expansionRevenue: number;
  contractionRevenue: number;
  activeSubs: number;
  trialUsers: number;
  freeUsers: number;
  churnRate: number;
  revenueChurn: number;
  nrr: number;
  grr: number;
  mrrChart: ChartDataPoint[];
  churnNewChart: ChartDataPoint[];
  customerSegments: Array<{ name: string; value: number }>;
}

// Affiliate Performance
export interface AffiliateData {
  clicks: number;
  signups: number;
  conversionRate: number;
  revenuePerAffiliate: number;
  commissionOwed: number;
  affiliates: Array<{
    name: string;
    clicks: number;
    conversions: number;
    revenue: number;
    commission: number;
    conversionRate: number;
  }>;
  clicksVsConversionsChart: ChartDataPoint[];
  trendChart: ChartDataPoint[];
}

// Product Usage
export interface ProductUsageData {
  dau: number;
  wau: number;
  mau: number;
  features: Array<{ name: string; users: number; timeSpent: number }>;
  cohortRetention: Array<{
    cohort: string;
    week0: number;
    week1: number;
    week2: number;
    week3: number;
    week4: number;
  }>;
  dauWauMauChart: ChartDataPoint[];
  featureUsageChart: ChartDataPoint[];
}

// Technical Performance
export interface TechnicalData {
  pageLoadTime: number;
  ttfb: number;
  apiResponseTime: number;
  errorRate: number;
  uptime: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
  pageLoadChart: ChartDataPoint[];
  errorRateChart: ChartDataPoint[];
  uptimeHistory: ChartDataPoint[];
}

// Security & Fraud
export interface SecurityData {
  failedLogins: number;
  suspiciousSignups: number;
  multipleAccountsPerIp: number;
  affiliateClickSpikes: number;
  riskScores: Array<{ type: string; score: number }>;
  suspiciousActivityChart: ChartDataPoint[];
  fraudHeatmap: Array<{ time: string; affiliateId: string; risk: number }>;
}

// Dashboard Data collection
export interface DashboardData {
  timeRange: TimeRange;
  globalOverview: GlobalOverviewData;
  websiteAnalytics: WebsiteAnalyticsData;
  conversionFunnel: ConversionFunnelData;
  saas: SaaSData;
  affiliates: AffiliateData;
  productUsage: ProductUsageData;
  technical: TechnicalData;
  security: SecurityData;
}

// Helper functions
const generateChartData = (days: number, baseValue: number = 10000, variance: number = 5000) => {
  const data: ChartDataPoint[] = [];
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const value = Math.floor(Math.random() * variance) + baseValue;
    data.push({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value,
    });
  }
  return data;
};

const generateTrendChart = (days: number) => {
  const data: ChartDataPoint[] = [];
  let baseValue = 5000;
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    baseValue += Math.random() * 1000 - 300;
    data.push({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value: Math.max(1000, Math.floor(baseValue)),
    });
  }
  return data;
};

function getGlobalOverviewData(timeRange: TimeRange): GlobalOverviewData {
  const multipliers = {
    "24H": 1,
    "7D": 7,
    "1M": 30,
    "3M": 90,
    ALL: 180,
  };
  const mult = multipliers[timeRange];
  const days = timeRange === "24H" ? 1 : timeRange === "7D" ? 7 : timeRange === "1M" ? 30 : timeRange === "3M" ? 90 : 180;

  return {
    visitors: Math.floor(125000 * mult),
    sessions: Math.floor(95000 * mult),
    pageViews: Math.floor(450000 * mult),
    signups: Math.floor(3200 * mult),
    payingCustomers: Math.floor(892 * mult),
    mrr: Math.floor(145000 * mult),
    arr: Math.floor(1740000 * mult),
    trialToPaidRate: 27.8,
    activeAffiliates: 145,
    affiliateRevenue: Math.floor(42500 * mult),
    visitorsChart: generateChartData(days, 125000 / days, 25000),
    revenueChart: generateTrendChart(days),
    topWebsites: [
      { name: "main-site.com", revenue: 95000 },
      { name: "product-landing.io", revenue: 38000 },
      { name: "community.dev", revenue: 12000 },
    ],
  };
}

function getWebsiteAnalyticsData(timeRange: TimeRange): WebsiteAnalyticsData {
  const days = timeRange === "24H" ? 1 : timeRange === "7D" ? 7 : timeRange === "1M" ? 30 : timeRange === "3M" ? 90 : 180;

  return {
    websites: [
      {
        id: "main-site",
        name: "main-site.com",
        uniqueVisitors: 45000,
        sessions: 52000,
        pageViews: 195000,
        bounceRate: 32.4,
        avgSessionDuration: 4.2,
        pagesPerSession: 3.8,
        scrollDepth: 68.5,
        exitRate: 5.2,
        newVsReturning: { new: 28000, returning: 17000 },
        geography: [
          { country: "United States", visitors: 22500 },
          { country: "United Kingdom", visitors: 8900 },
          { country: "Canada", visitors: 6200 },
          { country: "Germany", visitors: 4100 },
          { country: "Australia", visitors: 3300 },
        ],
        devices: [
          { type: "Desktop", visitors: 22500 },
          { type: "Mobile", visitors: 18000 },
          { type: "Tablet", visitors: 4500 },
        ],
        trafficSources: [
          { source: "Organic Search", visitors: 18000 },
          { source: "Direct", visitors: 12500 },
          { source: "Referral", visitors: 8900 },
          { source: "Social Media", visitors: 5600 },
        ],
        campaigns: [
          { name: "Summer Campaign 2024", visitors: 8500, conversions: 425 },
          { name: "Product Launch", visitors: 6200, conversions: 310 },
          { name: "Seasonal Sale", visitors: 4100, conversions: 205 },
        ],
        topReferrers: [
          { domain: "reddit.com", visitors: 3400 },
          { domain: "hnews.io", visitors: 2100 },
          { domain: "producthunt.com", visitors: 1800 },
        ],
        trafficTrendChart: generateTrendChart(days),
      },
    ],
  };
}

function getConversionFunnelData(timeRange: TimeRange): ConversionFunnelData {
  const visitors = 125000;
  const signups = Math.floor(visitors * 0.032);
  const activated = Math.floor(signups * 0.75);
  const trial = Math.floor(activated * 0.85);
  const paying = Math.floor(trial * 0.278);

  return {
    stages: [
      { name: "Visitors", count: visitors, conversionRate: 100 },
      { name: "Signups", count: signups, conversionRate: 3.2 },
      { name: "Activated", count: activated, conversionRate: 75 },
      { name: "Trial", count: trial, conversionRate: 85 },
      { name: "Paying", count: paying, conversionRate: 27.8 },
    ],
    overallConversionRate: 0.178,
    dropoffChart: generateChartData(7, 5000, 1000),
  };
}

function getSaaSData(timeRange: TimeRange): SaaSData {
  const multipliers = { "24H": 1, "7D": 7, "1M": 30, "3M": 90, ALL: 180 };
  const mult = multipliers[timeRange];
  const days = timeRange === "24H" ? 1 : timeRange === "7D" ? 7 : timeRange === "1M" ? 30 : timeRange === "3M" ? 90 : 180;

  return {
    mrr: Math.floor(145000 * mult),
    arr: Math.floor(1740000 * mult),
    arpa: 1624,
    expansionRevenue: Math.floor(28000 * mult),
    contractionRevenue: Math.floor(8500 * mult),
    activeSubs: 892,
    trialUsers: 342,
    freeUsers: 2450,
    churnRate: 2.8,
    revenueChurn: 1.9,
    nrr: 108,
    grr: 105,
    mrrChart: generateTrendChart(days),
    churnNewChart: generateChartData(days, 80, 30),
    customerSegments: [
      { name: "Startup", value: 340 },
      { name: "SMB", value: 380 },
      { name: "Enterprise", value: 172 },
    ],
  };
}

function getAffiliateData(timeRange: TimeRange): AffiliateData {
  const multipliers = { "24H": 1, "7D": 7, "1M": 30, "3M": 90, ALL: 180 };
  const mult = multipliers[timeRange];
  const days = timeRange === "24H" ? 1 : timeRange === "7D" ? 7 : timeRange === "1M" ? 30 : timeRange === "3M" ? 90 : 180;

  const affiliates = [
    { name: "TechBlogger Joe", clicks: 8500 * mult, conversions: 425 * mult, revenue: 42500 * mult, commission: 6375 * mult },
    { name: "Digital Marketing Pro", clicks: 6200 * mult, conversions: 310 * mult, revenue: 31000 * mult, commission: 4650 * mult },
    { name: "SaaS Review Hub", clicks: 4800 * mult, conversions: 240 * mult, revenue: 24000 * mult, commission: 3600 * mult },
    { name: "Indie Hackers Network", clicks: 3500 * mult, conversions: 175 * mult, revenue: 17500 * mult, commission: 2625 * mult },
  ];

  return {
    clicks: affiliates.reduce((sum, a) => sum + a.clicks, 0),
    signups: affiliates.reduce((sum, a) => sum + a.conversions, 0),
    conversionRate: 5.0,
    revenuePerAffiliate: 28875,
    commissionOwed: affiliates.reduce((sum, a) => sum + a.commission, 0),
    affiliates: affiliates.map((a) => ({
      ...a,
      conversionRate: (a.conversions / a.clicks) * 100,
    })),
    clicksVsConversionsChart: generateChartData(days, 200, 100),
    trendChart: generateTrendChart(days),
  };
}

function getProductUsageData(timeRange: TimeRange): ProductUsageData {
  const days = timeRange === "24H" ? 1 : timeRange === "7D" ? 7 : timeRange === "1M" ? 30 : timeRange === "3M" ? 90 : 180;

  return {
    dau: 4250,
    wau: 12800,
    mau: 31240,
    features: [
      { name: "Dashboard", users: 8900, timeSpent: 45 },
      { name: "Reports", users: 7200, timeSpent: 38 },
      { name: "Integrations", users: 5600, timeSpent: 22 },
      { name: "API", users: 3400, timeSpent: 58 },
      { name: "Settings", users: 4100, timeSpent: 12 },
    ],
    cohortRetention: [
      { cohort: "Week 1", week0: 100, week1: 85, week2: 72, week3: 68, week4: 62 },
      { cohort: "Week 2", week0: 100, week1: 88, week2: 75, week3: 71, week4: 0 },
      { cohort: "Week 3", week0: 100, week1: 82, week2: 70, week3: 0, week4: 0 },
      { cohort: "Week 4", week0: 100, week1: 79, week2: 0, week3: 0, week4: 0 },
    ],
    dauWauMauChart: generateChartData(days, 5000, 2000),
    featureUsageChart: generateChartData(days, 3000, 1500),
  };
}

function getTechnicalData(timeRange: TimeRange): TechnicalData {
  const days = timeRange === "24H" ? 1 : timeRange === "7D" ? 7 : timeRange === "1M" ? 30 : timeRange === "3M" ? 90 : 180;

  return {
    pageLoadTime: 1250,
    ttfb: 280,
    apiResponseTime: 185,
    errorRate: 0.045,
    uptime: 99.98,
    coreWebVitals: {
      lcp: 2100,
      fid: 125,
      cls: 0.08,
    },
    pageLoadChart: generateChartData(days, 1200, 200),
    errorRateChart: generateChartData(days, 0.05, 0.02),
    uptimeHistory: generateChartData(days, 99.9, 0.1),
  };
}

function getSecurityData(timeRange: TimeRange): SecurityData {
  const days = timeRange === "24H" ? 1 : timeRange === "7D" ? 7 : timeRange === "1M" ? 30 : timeRange === "3M" ? 90 : 180;

  return {
    failedLogins: 342,
    suspiciousSignups: 28,
    multipleAccountsPerIp: 12,
    affiliateClickSpikes: 5,
    riskScores: [
      { type: "Login Anomalies", score: 24 },
      { type: "Fraud Patterns", score: 15 },
      { type: "Geographic", score: 8 },
    ],
    suspiciousActivityChart: generateChartData(days, 50, 30),
    fraudHeatmap: [
      { time: "00:00", affiliateId: "affiliate_001", risk: 45 },
      { time: "06:00", affiliateId: "affiliate_002", risk: 32 },
      { time: "12:00", affiliateId: "affiliate_001", risk: 28 },
      { time: "18:00", affiliateId: "affiliate_003", risk: 18 },
    ],
  };
}

const mockDataByRange: Record<TimeRange, DashboardData> = {
  "24H": {
    timeRange: "24H",
    globalOverview: getGlobalOverviewData("24H"),
    websiteAnalytics: getWebsiteAnalyticsData("24H"),
    conversionFunnel: getConversionFunnelData("24H"),
    saas: getSaaSData("24H"),
    affiliates: getAffiliateData("24H"),
    productUsage: getProductUsageData("24H"),
    technical: getTechnicalData("24H"),
    security: getSecurityData("24H"),
  },
  "7D": {
    timeRange: "7D",
    globalOverview: getGlobalOverviewData("7D"),
    websiteAnalytics: getWebsiteAnalyticsData("7D"),
    conversionFunnel: getConversionFunnelData("7D"),
    saas: getSaaSData("7D"),
    affiliates: getAffiliateData("7D"),
    productUsage: getProductUsageData("7D"),
    technical: getTechnicalData("7D"),
    security: getSecurityData("7D"),
  },
  "1M": {
    timeRange: "1M",
    globalOverview: getGlobalOverviewData("1M"),
    websiteAnalytics: getWebsiteAnalyticsData("1M"),
    conversionFunnel: getConversionFunnelData("1M"),
    saas: getSaaSData("1M"),
    affiliates: getAffiliateData("1M"),
    productUsage: getProductUsageData("1M"),
    technical: getTechnicalData("1M"),
    security: getSecurityData("1M"),
  },
  "3M": {
    timeRange: "3M",
    globalOverview: getGlobalOverviewData("3M"),
    websiteAnalytics: getWebsiteAnalyticsData("3M"),
    conversionFunnel: getConversionFunnelData("3M"),
    saas: getSaaSData("3M"),
    affiliates: getAffiliateData("3M"),
    productUsage: getProductUsageData("3M"),
    technical: getTechnicalData("3M"),
    security: getSecurityData("3M"),
  },
  ALL: {
    timeRange: "ALL",
    globalOverview: getGlobalOverviewData("ALL"),
    websiteAnalytics: getWebsiteAnalyticsData("ALL"),
    conversionFunnel: getConversionFunnelData("ALL"),
    saas: getSaaSData("ALL"),
    affiliates: getAffiliateData("ALL"),
    productUsage: getProductUsageData("ALL"),
    technical: getTechnicalData("ALL"),
    security: getSecurityData("ALL"),
  },
};

export function getMockData(timeRange: TimeRange): DashboardData {
  return mockDataByRange[timeRange];
}

export function getLegacyDashboardData(timeRange: TimeRange) {
  const data = getMockData(timeRange);
  return {
    revenue: Math.floor(data.globalOverview.mrr),
    signups: data.globalOverview.signups,
    conversionRate: data.globalOverview.trialToPaidRate,
    chartData: data.globalOverview.revenueChart.map((d) => ({
      date: d.date,
      revenue: d.value,
    })),
  };
}
