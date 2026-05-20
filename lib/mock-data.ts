export type TimeRange = "24H" | "7D" | "1M" | "3M" | "ALL";

const empty = {
  globalOverview: {
    totalUsers: 0,
    planDistribution: [],
    totalPrsReviewed: 0,
    mrr: 0,
    arr: 0,
    activeAffiliates: 0,
    affiliateRevenue: 0,
    referrals: 0,
    convertedReferrals: 0,
    referralConversionRate: 0,
    chartData: [],
  },
  saas: {
    planDistribution: [],
    mrr: 0,
    arr: 0,
    revenueByTier: [],
    razorpayPlans: [],
    totalUsers: 0,
    payingUsers: 0,
    freeUsers: 0,
  },
  affiliates: {
    affiliates: [],
    totalClicks: 0,
    totalConversions: 0,
    conversionRate: 0,
    totalCommission: 0,
    revenuePerAffiliate: 0,
    total: 0,
    converted: 0,
    total_revenue: 0,
  },
  productUsage: {
    monthlyUsage: { prs_reviewed: 0, auto_prs: 0, issues_planned: 0, grand_total: 0 },
    totalUsage: { prs_reviewed: 0, auto_prs: 0, issues_planned: 0 },
    executionStats: { total_executions: 0, avg_duration: 0, avg_files: 0, avg_tokens: 0 },
    chartData: [],
  },
  technical: {
    executionStats: { total_executions: 0, avg_duration: 0, min_duration: 0, max_duration: 0, avg_files: 0, avg_tokens: 0 },
    activityTimeline: [],
  },
  security: {
    affiliateData: [],
    suspiciousAffiliates: [],
    totalSuspicious: 0,
    totalAffiliates: 0,
    totalClicks: 0,
  },
  conversionFunnel: {
    stages: [],
    overallConversionRate: 0,
    referralChart: [],
  },
  websiteAnalytics: { websites: [] },
};

export function getMockData(timeRange: TimeRange) {
  return empty;
}

export function getLegacyDashboardData(timeRange: TimeRange) {
  return { revenue: 0, signups: 0, conversionRate: 0, chartData: [] };
}
