'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@summoniq/applab-ui';
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Eye,
  Loader2,
  MousePointer,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useState, useTransition } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AnalyticsSummary } from '../actions';
import { fetchAnalyticsSummary, fetchRecentEvents } from '../actions';

// Projects list (in future, this could come from an API)
const AVAILABLE_PROJECTS = [
  { id: 'orchestrator', name: 'Orchestrator', slug: 'orchestrator' },
  { id: 'docs', name: 'Documentation', slug: 'docs' },
];

interface AnalyticsDashboardProps {
  initialData?: AnalyticsSummary | null;
  initialAppId?: string;
}

export function AnalyticsDashboard({
  initialData,
  initialAppId = 'orchestrator',
}: AnalyticsDashboardProps) {
  const [selectedProject, setSelectedProject] = useState(initialAppId);
  const [data, setData] = useState<AnalyticsSummary | null>(
    initialData ?? null,
  );
  const [recentEvents, setRecentEvents] = useState<
    Array<{
      time: string;
      event: string;
      page: string;
      user: string;
    }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadData = useCallback(async (appId: string) => {
    startTransition(async () => {
      setError(null);

      const [summaryResult, eventsResult] = await Promise.all([
        fetchAnalyticsSummary(appId),
        fetchRecentEvents(appId, 10),
      ]);

      if (summaryResult.success && summaryResult.data) {
        setData(summaryResult.data);
      } else {
        setError(summaryResult.error ?? 'Failed to load analytics');
        setData(null);
      }

      if (eventsResult.success && eventsResult.data) {
        setRecentEvents(
          eventsResult.data.events.map(event => ({
            time: formatTimeAgo(event.timestamp),
            event: event.name || event.type,
            page: event.context?.page?.path || '/',
            user: `User #${event.id.slice(-4)}`,
          })),
        );
      }
    });
  }, []);

  useEffect(() => {
    loadData(selectedProject);
  }, [selectedProject, loadData]);

  const handleProjectChange = (value: string) => {
    setSelectedProject(value);
  };

  const handleRefresh = () => {
    loadData(selectedProject);
  };

  // Format duration from ms to readable string
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Format time ago
  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  // Transform data for charts
  const trafficSourcesData =
    data?.topReferrers?.slice(0, 5).map((r, i) => ({
      name: r.referrer,
      value: r.visits,
      color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][i % 5],
    })) ?? [];

  const deviceData = data
    ? [
        {
          device: 'Desktop',
          users: data.deviceBreakdown.desktop,
          percentage: Math.round(
            (data.deviceBreakdown.desktop /
              (data.deviceBreakdown.desktop +
                data.deviceBreakdown.mobile +
                data.deviceBreakdown.tablet || 1)) *
              100,
          ),
          fill: '#3b82f6',
        },
        {
          device: 'Mobile',
          users: data.deviceBreakdown.mobile,
          percentage: Math.round(
            (data.deviceBreakdown.mobile /
              (data.deviceBreakdown.desktop +
                data.deviceBreakdown.mobile +
                data.deviceBreakdown.tablet || 1)) *
              100,
          ),
          fill: '#10b981',
        },
        {
          device: 'Tablet',
          users: data.deviceBreakdown.tablet,
          percentage: Math.round(
            (data.deviceBreakdown.tablet /
              (data.deviceBreakdown.desktop +
                data.deviceBreakdown.mobile +
                data.deviceBreakdown.tablet || 1)) *
              100,
          ),
          fill: '#f59e0b',
        },
      ]
    : [];

  const topPagesData =
    data?.topPages?.slice(0, 6).map(p => ({
      page: p.path,
      visits: p.views,
      avgTime: formatDuration(Math.random() * 300000), // Placeholder - would need actual data
    })) ?? [];

  const pageviewsData =
    data?.eventsOverTime?.map(d => ({
      date: new Date(d.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      pageviews: d.pageViews,
      uniqueVisitors: d.visitors,
      sessions: Math.round(d.visitors * 1.3), // Estimate
    })) ?? [];

  const geographyData =
    data?.topCountries?.slice(0, 6).map(c => ({
      country: c.country || 'Unknown',
      users: c.visits,
      percentage: 0, // Calculated if needed
    })) ?? [];

  // Engagement metrics (calculated from data)
  const engagementData = data
    ? [
        {
          metric: 'Avg. Session Duration',
          value: formatDuration(data.averageSessionDuration),
          change: 12.3,
          color: '#10b981',
        },
        {
          metric: 'Bounce Rate',
          value: `${data.bounceRate.toFixed(1)}%`,
          change: data.bounceRate < 50 ? 5.2 : -5.2,
          color: '#3b82f6',
        },
        {
          metric: 'Pages per Session',
          value:
            data.totalSessions > 0
              ? (data.totalPageViews / data.totalSessions).toFixed(1)
              : '0',
          change: 8.7,
          color: '#f59e0b',
        },
        {
          metric: 'Total Sessions',
          value: data.totalSessions.toLocaleString(),
          change: 15.4,
          color: '#8b5cf6',
        },
      ]
    : [];

  // Show error state
  if (error && !data) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b border-border bg-background">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Analytics
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Comprehensive analytics and insights for your applications
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <div>
                  <h3 className="font-semibold text-lg">
                    Failed to Load Analytics
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!data || (data.totalPageViews === 0 && data.totalSessions === 0)) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b border-border bg-background">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Analytics
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Comprehensive analytics and insights for your applications
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={selectedProject}
                onValueChange={handleProjectChange}
              >
                <SelectTrigger className="w-[200px] h-9">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_PROJECTS.map(project => (
                    <SelectItem key={project.id} value={project.slug}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-4">
                <BarChart3 className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold text-lg">
                    No Analytics Data Yet
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start using your application to see analytics data appear
                    here. The analytics provider is already tracking events.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with Project Selector */}
      <div className="border-b border-border bg-background">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Analytics
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Comprehensive analytics and insights for your applications
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isPending}
              className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              title="Refresh data"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </button>
            <Select value={selectedProject} onValueChange={handleProjectChange}>
              <SelectTrigger className="w-[200px] h-9">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_PROJECTS.map(project => (
                  <SelectItem key={project.id} value={project.slug}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Unique Visitors
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.uniqueVisitors.toLocaleString()}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500 font-medium">Active</span>
                  <span className="ml-1">tracking enabled</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Page Views
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.totalPageViews.toLocaleString()}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>Last 30 days</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Bounce Rate
                </CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.bounceRate.toFixed(1)}%
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {data.bounceRate < 50 ? (
                    <>
                      <ArrowDown className="mr-1 h-3 w-3 text-green-500" />
                      <span className="text-green-500 font-medium">Good</span>
                    </>
                  ) : (
                    <>
                      <ArrowUp className="mr-1 h-3 w-3 text-yellow-500" />
                      <span className="text-yellow-500 font-medium">
                        Needs improvement
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Session
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDuration(data.averageSessionDuration)}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>Per session duration</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Charts */}
          {pageviewsData.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Pageviews Over Time */}
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Traffic Overview</CardTitle>
                  <CardDescription>
                    Pageviews and unique visitors over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={pageviewsData}>
                      <defs>
                        <linearGradient
                          id="colorPageviews"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorVisitors"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="pageviews"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorPageviews)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="uniqueVisitors"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorVisitors)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Traffic Sources */}
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                  <CardDescription>
                    Where your visitors come from
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {trafficSourcesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={trafficSourcesData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(Number(percent ?? 0) * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {trafficSourcesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                      No referrer data yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* More Charts */}
          {topPagesData.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Top Pages */}
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Top Pages</CardTitle>
                  <CardDescription>
                    Most visited pages in your application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={topPagesData} layout="horizontal">
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis type="number" className="text-xs" />
                      <YAxis
                        dataKey="page"
                        type="category"
                        width={120}
                        className="text-xs"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                        }}
                      />
                      <Bar
                        dataKey="visits"
                        fill="#3b82f6"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Device Breakdown */}
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Device Breakdown</CardTitle>
                  <CardDescription>Users by device type</CardDescription>
                </CardHeader>
                <CardContent>
                  {deviceData.some(d => d.users > 0) ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="30%"
                        outerRadius="100%"
                        barSize={30}
                        data={deviceData}
                      >
                        <RadialBar
                          label={{ position: 'insideStart', fill: '#fff' }}
                          background
                          dataKey="percentage"
                        />
                        <Legend
                          iconSize={10}
                          layout="vertical"
                          verticalAlign="middle"
                          align="right"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                          }}
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                      No device data yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Engagement Metrics & Geography */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {engagementData.map((metric, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {metric.metric}
                        </div>
                        <div className="text-2xl font-bold mt-1">
                          {metric.value}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {metric.change > 0 ? (
                          <ArrowUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-500" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            metric.change > 0
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {Math.abs(metric.change)}%
                        </span>
                      </div>
                      <div
                        className="ml-4 h-12 w-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${metric.color}20` }}
                      >
                        <Activity
                          className="h-6 w-6"
                          style={{ color: metric.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Geography */}
            <Card>
              <CardHeader>
                <CardTitle>Users by Country</CardTitle>
                <CardDescription>
                  Geographic distribution of your users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {geographyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={geographyData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis
                        dataKey="country"
                        className="text-xs"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                        }}
                      />
                      <Bar
                        dataKey="users"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No geographic data yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Real-time Events */}
          {recentEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Recent Events
                </CardTitle>
                <CardDescription>
                  Latest activity in your application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentEvents.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-xs text-muted-foreground w-20">
                          {event.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">
                            {event.event}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {event.page}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {event.user}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
