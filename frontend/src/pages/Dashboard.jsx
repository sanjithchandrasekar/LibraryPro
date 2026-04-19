import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { issueService } from '../services/issueService';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';
import { 
  Book, ArrowUpRight, CheckCircle2, AlertTriangle, 
  TrendingUp, TrendingDown, Users, BookOpen, Clock, ArrowRight, RefreshCw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { format } from 'date-fns';

const PIE_COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];

// eslint-disable-next-line no-unused-vars
const StatCard = ({ title, value, icon: Icon, gradient, delta, deltaPositive }) => (
  <div className="bg-card border border-border rounded-3xl p-6 card-hover shadow-sm relative overflow-hidden group cursor-default">
    {/* Gradient glow bg */}
    <div className={`absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 ${gradient}`} />

    <div className="flex items-start justify-between relative z-10">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{title}</p>
        <p className="text-5xl font-black tabular-nums text-foreground leading-none">{value}</p>
        {delta !== undefined && (
          <div className={`mt-4 inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${deltaPositive !== false && delta > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : delta < 0 ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : 'bg-muted text-muted-foreground'}`}>
            {delta > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {delta > 0 ? '+' : ''}{delta}% this week
          </div>
        )}
      </div>
      <div className={`w-13 h-13 p-3.5 rounded-2xl ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 shrink-0`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  </div>
);

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-xl p-4 min-w-[130px]">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-black text-foreground">{payload[0].value}</p>
      <p className="text-xs text-muted-foreground mt-1">books issued</p>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [catData, setCatData] = useState([]);
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const adminName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin';

  const loadAll = async () => {
    setLoading(true);
    const [s, w, c, allIssues] = await Promise.all([
      issueService.getStats(),
      issueService.getWeeklyData(),
      issueService.getCategoryData(),
      issueService.getIssues(),
    ]);
    setStats(s);
    setWeekly(w);
    setCatData(c);
    setRecentIssues(allIssues.slice(0, 5));
    setLoading(false);
  };

  useEffect(() => { 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll(); 
  }, []);

  if (loading) return <Loader fullPage />;
  if (!stats) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Error loading dashboard data</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{today}</p>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            {greeting}, <span className="text-primary">{adminName}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium opacity-80">Here's what's happening at the library today.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {stats && stats.overdueBooks > 0 && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm">
              <AlertTriangle size={15} />
              {stats.overdueBooks} overdue books
            </div>
          )}
          <button
            onClick={loadAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-muted hover:bg-muted/80 text-muted-foreground font-bold text-sm transition-all hover:scale-105 active:scale-95"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Books" value={stats.totalBooks} icon={BookOpen}
          gradient="bg-gradient-to-br from-violet-500 to-indigo-600" delta={5} />
        <StatCard title="Currently Issued" value={stats.issuedBooks} icon={ArrowUpRight}
          gradient="bg-gradient-to-br from-amber-400 to-orange-500" />
        <StatCard title="Available Copies" value={stats.availableBooks} icon={CheckCircle2}
          gradient="bg-gradient-to-br from-emerald-400 to-teal-500" delta={2} />
        <StatCard title="Overdue Returns" value={stats.overdueBooks} icon={AlertTriangle}
          gradient="bg-gradient-to-br from-red-500 to-rose-600" deltaPositive={false} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Bar Chart */}
        <div className="lg:col-span-3 bg-card border border-border rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-xl text-foreground tracking-tight">Weekly Circulation</h3>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Books issued per day · last 7 days</p>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-bold text-primary">Issued</span>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly} barSize={32} margin={{ left: -10 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)', radius: 8 }} />
                <Bar dataKey="count" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="font-black text-xl text-foreground tracking-tight">Categories</h3>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Books by subject area</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={60} outerRadius={85}
                  paddingAngle={5} dataKey="value" strokeWidth={0}>
                  {catData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))',
                    borderRadius: '16px', padding: '12px 16px', backdropFilter: 'blur(12px)'
                  }}
                  itemStyle={{ fontWeight: 700, fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {catData.slice(0, 4).map((d, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-sm font-semibold text-muted-foreground">{d.name}</span>
                </div>
                <span className="text-sm font-black text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="px-8 py-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Clock size={18} />
            </div>
            <h3 className="font-black text-lg text-foreground tracking-tight">Recent Activity</h3>
          </div>
          <Link to="/issues" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
            View details <ArrowRight size={14} />
          </Link>
        </div>
        <div className="divide-y divide-border/50">
          {recentIssues.map((issue) => {
            const isOverdue = new Date(issue.due_date) < new Date() && issue.status === 'Issued';
            return (
              <div key={issue.issue_id} className="px-8 py-5 flex items-center justify-between hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${issue.status === 'Returned' ? 'bg-emerald-100 text-emerald-600' : isOverdue ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    {issue.status === 'Returned' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground truncate">{issue.books.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">{issue.users.name} · Due {issue.due_date}</p>
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${issue.status === 'Returned' ? 'bg-emerald-100 text-emerald-700' : isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {isOverdue ? 'Overdue' : issue.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
