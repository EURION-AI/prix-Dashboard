export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
}

export interface DashboardOverview {
  visitors: number
  sessions: number
  pageViews: number
  signups: number
  payingCustomers: number
  mrr: number
  arr: number
  trialToPaidRate: number
  activeAffiliates: number
  affiliateRevenue: number
  visitorsChart: Array<{ date: string; value: number }>
  revenueChart: Array<{ date: string; value: number }>
  topWebsites: Array<{ name: string; revenue: number }>
}

export interface DashboardSubscription {
  mrr: number
  arr: number
  arpa: number
  expansionRevenue: number
  contractionRevenue: number
  activeSubs: number
  trialUsers: number
  freeUsers: number
  churnRate: number
  revenueChurn: number
  nrr: number
  grr: number
  mrrChart: Array<{ date: string; value: number }>
  churnNewChart: Array<{ date: string; value: number }>
  customerSegments: Array<{ name: string; value: number }>
}

export interface DashboardAffiliate {
  clicks: number
  signups: number
  conversionRate: number
  revenuePerAffiliate: number
  commissionOwed: number
  affiliates: Array<{
    name: string
    clicks: number
    conversions: number
    revenue: number
    commission: number
    conversionRate: number
  }>
  clicksVsConversionsChart: Array<{ date: string; value: number }>
  trendChart: Array<{ date: string; value: number }>
}

export interface DashboardTechnical {
  pageLoadTime: number
  ttfb: number
  apiResponseTime: number
  errorRate: number
  uptime: number
  coreWebVitals: {
    lcp: number
    fid: number
    cls: number
  }
  pageLoadChart: Array<{ date: string; value: number }>
  errorRateChart: Array<{ date: string; value: number }>
  uptimeHistory: Array<{ date: string; value: number }>
}

export interface DashboardSecurity {
  failedLogins: number
  suspiciousSignups: number
  multipleAccountsPerIp: number
  affiliateClickSpikes: number
  riskScores: Array<{ type: string; score: number }>
  suspiciousActivityChart: Array<{ date: string; value: number }>
  fraudHeatmap: Array<{ time: string; affiliateId: string; risk: number }>
}

export interface DashboardProductUsage {
  dau: number
  wau: number
  mau: number
  features: Array<{ name: string; users: number; timeSpent: number }>
  cohortRetention: Array<{
    cohort: string
    week0: number
    week1: number
    week2: number
    week3: number
    week4: number
  }>
  dauWauMauChart: Array<{ date: string; dau: number; wau: number; mau: number }>
  featureUsageChart: Array<Record<string, string | number>>
}

export interface DashboardFunnel {
  stages: Array<{ name: string; count: number; conversionRate: number }>
  overallConversionRate: number
  dropoffChart: Array<{ date: string; value: number }>
}

export type TimeRange = '24H' | '7D' | '1M' | '3M' | 'ALL'

import { getMockData } from './mock-data'

export async function fetchDashboardData<T>(endpoint: string, timeRange: TimeRange = '24H'): Promise<T> {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/dashboard/${endpoint}?timeRange=${timeRange}`, {
      cache: 'no-store',
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard data: ${response.statusText}`)
    }
    return response.json()
  } catch (error) {
    console.warn('API unavailable, using mock data for endpoint:', endpoint)
    // Return mock data when API is not available
    const mockData = getMockData(timeRange)
    
    // Map endpoint to mock data property
    const endpointMap: Record<string, keyof typeof mockData> = {
      'overview': 'globalOverview',
      'subscriptions': 'saas',
      'affiliates': 'affiliates',
      'technical': 'technical',
      'security': 'security',
      'product-usage': 'productUsage',
      'conversion-funnel': 'conversionFunnel',
      'websites': 'websiteAnalytics',
    }
    
    const dataKey = endpointMap[endpoint] || 'globalOverview'
    return mockData[dataKey] as unknown as T
  }
}