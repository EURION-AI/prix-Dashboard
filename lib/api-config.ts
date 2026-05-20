export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
}

export interface DashboardOverview {
  totalUsers: number
  planDistribution: Array<{ plan: string; count: number }>
  totalPrsReviewed: number
  mrr: number
  arr: number
  activeAffiliates: number
  affiliateRevenue: number
  referrals: number
  convertedReferrals: number
  referralConversionRate: number
  chartData: Array<{ date: string; value: number }>
}

export interface DashboardActivity {
  prsByRepo: Array<{ repo_name: string; count: number }>
  activityTimeline: Array<{ date: string; count: number }>
  issueExecutions: Array<{ repo_name: string; count: number; avg_duration: number }>
  totalPrs: number
  totalIssues: number
  avgExecutionDuration: number
}

export interface DashboardSubscription {
  planDistribution: Array<{ plan: string; count: number }>
  mrr: number
  arr: number
  revenueByTier: Array<{ subscription_tier: string; revenue: number }>
  razorpayPlans: Array<{ internal_plan_id: string; amount: number; currency: string }>
  totalUsers: number
  payingUsers: number
  freeUsers: number
}

export interface DashboardAffiliate {
  affiliates: Array<{
    name: string
    affiliateCode: string
    tier: string
    referralCount: number
    paidReferralCount: number
    clicks: number
    conversions: number
    commission: number
    conversionRate: number
  }>
  totalClicks: number
  totalConversions: number
  conversionRate: number
  totalCommission: number
  revenuePerAffiliate: number
  total: number
  converted: number
  total_revenue: number
}

export interface DashboardProductUsage {
  monthlyUsage: {
    prs_reviewed: number
    auto_prs: number
    issues_planned: number
    grand_total: number
  }
  totalUsage: {
    prs_reviewed: number
    auto_prs: number
    issues_planned: number
  }
  executionStats: {
    total_executions: number
    avg_duration: number
    avg_files: number
    avg_tokens: number
  }
  chartData: Array<{ date: string; value: number }>
}

export interface DashboardPerformance {
  executionStats: {
    total_executions: number
    avg_duration: number
    min_duration: number
    max_duration: number
    avg_files: number
    avg_tokens: number
  }
  activityTimeline: Array<{ date: string; count: number }>
}

export interface DashboardSecurity {
  affiliateData: Array<{
    affiliateCode: string
    username: string
    clicks: number
    conversions: number
    ratio: number
    suspicious: boolean
  }>
  suspiciousAffiliates: Array<{
    affiliateCode: string
    username: string
    clicks: number
    conversions: number
    ratio: number
    suspicious: boolean
  }>
  totalSuspicious: number
  totalAffiliates: number
  totalClicks: number
}

export interface DashboardFunnel {
  stages: Array<{ name: string; count: number; conversionRate: number }>
  overallConversionRate: number
  referralChart: Array<{ name: string; value: number }>
}

export type TimeRange = '24H' | '7D' | '1M' | '3M' | 'ALL'

import { getMockData } from './mock-data'

export async function fetchDashboardData<T>(endpoint: string, timeRange: TimeRange = '24H'): Promise<T> {
  const apiEndpointMap: Record<string, string> = {
    'overview': 'admin/overview',
    'subscriptions': 'admin/subscriptions',
    'affiliates': 'admin/affiliates/performance',
    'technical': 'admin/performance',
    'security': 'admin/security',
    'product-usage': 'admin/product/usage',
    'conversion-funnel': 'admin/funnel',
    'activity': 'admin/activity',
  }
  const targetEndpoint = apiEndpointMap[endpoint] || `dashboard/${endpoint}`;

  try {
    const response = await fetch(`${config.apiBaseUrl}/api/${targetEndpoint}?timeRange=${timeRange}`, {
      cache: 'no-store',
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard data: ${response.statusText}`)
    }
    return response.json()
  } catch (error) {
    console.warn('API unavailable, using mock data for endpoint:', endpoint)
    const mockData = getMockData(timeRange)

    const endpointMap: Record<string, keyof typeof mockData> = {
      'overview': 'globalOverview',
      'subscriptions': 'saas',
      'affiliates': 'affiliates',
      'technical': 'technical',
      'security': 'security',
      'product-usage': 'productUsage',
      'conversion-funnel': 'conversionFunnel',
    }

    const dataKey = endpointMap[endpoint] || 'globalOverview'
    return mockData[dataKey] as unknown as T
  }
}
