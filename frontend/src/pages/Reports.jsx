import React, { useState, useEffect } from 'react';
import { issueService } from '../services/issueService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import Loader from '../components/common/Loader';
import { format } from 'date-fns';
import {
  Download, IndianRupee, BookOpen, BarChart2,
  CheckCircle2, AlertTriangle, TrendingUp, Activity
} from 'lucide-react';
import { toast } from 'react-toastify';

const PIE_COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-xl p-4">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-black">{payload[0].value}</p>
      <p className="text-xs text-muted-foreground">books issued</p>
    </div>
  );
};

const Reports = () => {
  const [issues, setIssues] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [catData, setCatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  const loadAll = async () => {
    setLoading(true);
    const [i, w, c] = await Promise.all([
      issueService.getIssues(),
      issueService.getWeeklyData(),
      issueService.getCategoryData(),
    ]);
    setIssues(i);
    setWeekly(w);
    setCatData(c);
    setLoading(false);
  };

  useEffect(() => { 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll(); 
  }, []);

  const today = new Date();
  const totalFine = issues.reduce((acc, cur) => acc + (Number(cur.fine_amount) || 0), 0);
  const activeIssues = issues.filter(i => i.status === 'Issued');
  const overdueList = issues.filter(i => i.status === 'Issued' && new Date(i.due_date) < today);
  const returnedList = issues.filter(i => i.status === 'Returned');

  const tabData = { all: issues, active: activeIssues, overdue: overdueList, returned: returnedList };

  const exportCSV = () => {
    const data = tabData[tab];
    if (data.length === 0) { toast.warning('No data to export'); return; }
    const headers = ['Issue ID', 'Member', 'Book Title', 'Issued On', 'Due Date', 'Return Date', 'Fine (₹)', 'Status'];
    const rows = data.map(h => [
      h.issue_id, `"${h.users?.name}"`, `"${h.books?.title}"`,
      h.issue_date, h.due_date, h.return_date || '—',
      h.fine_amount, h.status
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    const a = Object.assign(document.createElement('a'), { href: uri, download: `library_report_${format(today, 'yyyy-MM-dd')}.csv` });
    a.click();
    toast.success('Report exported!');
  };

  const TABS = [
    { key: 'all', label: 'All Records', count: issues.length },
    { key: 'active', label: 'Active', count: activeIssues.length },
    { key: 'overdue', label: 'Overdue', count: overdueList.length },
    { key: 'returned', label: 'Returned', count: returnedList.length },
  ];

  if (loading) return <Loader fullPage />;

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <Activity size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Analytics & Reports</h1>
          </div>
          <p className="text-sm text-muted-foreground font-medium ml-12">Library performance metrics and transaction logs.</p>
        </div>
        <button
          id="export-csv-btn"
          onClick={exportCSV}
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border border-border bg-card hover:bg-muted font-bold text-sm transition-all shadow-sm hover:scale-105 active:scale-95"
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Fines Collected', value: `₹${totalFine}`, icon: IndianRupee, gradient: 'from-red-500 to-rose-600', shadow: 'shadow-rose-500/25' },
          { label: 'Total Transactions', value: issues.length, icon: BarChart2, gradient: 'from-violet-500 to-indigo-600', shadow: 'shadow-indigo-500/25' },
          { label: 'Books Still Issued', value: activeIssues.length, icon: BookOpen, gradient: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/25' },
          { label: 'Overdue Returns', value: overdueList.length, icon: AlertTriangle, gradient: 'from-red-600 to-rose-700', shadow: 'shadow-red-500/25' },
        ].map((k, i) => (
          <div key={i} className="bg-card border border-border rounded-3xl p-6 shadow-sm card-hover relative overflow-hidden group">
            <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full blur-xl opacity-15 group-hover:opacity-25 transition-opacity bg-gradient-to-br ${k.gradient}`} />
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${k.gradient} flex items-center justify-center mb-4 shadow-lg ${k.shadow} relative z-10`}>
              <k.icon size={20} className="text-white" />
            </div>
            <p className="text-3xl font-black tabular-nums text-foreground relative z-10">{k.value}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mt-1.5 relative z-10">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-7 shadow-sm">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp size={15} className="text-primary" />
            </div>
            <h3 className="font-black text-foreground">Weekly Issuance Trend</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-7 ml-9 font-medium">Books issued per day (last 7 days)</p>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly} barSize={28} margin={{ left: -10 }}>
                <defs>
                  <linearGradient id="rptBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.5)', radius: 8 }} />
                <Bar dataKey="count" fill="url(#rptBarGrad)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-card border border-border rounded-3xl p-7 shadow-sm">
          <h3 className="font-black text-foreground mb-1">Category Distribution</h3>
          <p className="text-xs text-muted-foreground mb-5 font-medium">Books by subject area</p>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" outerRadius={78} paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', padding: '12px 16px', backdropFilter: 'blur(12px)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2.5 mt-4">
            {catData.slice(0, 4).map((d, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} />
                <span className="text-muted-foreground flex-1 truncate font-semibold">{d.name}</span>
                <span className="font-black tabular-nums">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction Log */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        {/* Tabs */}
        <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center gap-2 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all hover:scale-105 active:scale-95 ${tab === t.key ? 'bg-primary text-white shadow-md shadow-primary/30' : 'hover:bg-muted text-muted-foreground'}`}
            >
              {t.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${tab === t.key ? 'bg-white/25 text-white' : 'bg-muted text-muted-foreground'}`}>{t.count}</span>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header text-left">Transaction</th>
                <th className="table-header text-left">Member</th>
                <th className="table-header text-left">Book</th>
                <th className="table-header text-left">Issued</th>
                <th className="table-header text-left">Due / Returned</th>
                <th className="table-header text-right">Fine</th>
                <th className="table-header text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {tabData[tab].length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="py-20 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-muted flex items-center justify-center">
                        <CheckCircle2 size={28} className="text-muted-foreground/40" />
                      </div>
                      <p className="text-muted-foreground font-bold">No records in this category</p>
                    </div>
                  </td>
                </tr>
              ) : tabData[tab].map(h => {
                const isOverdue = h.status === 'Issued' && new Date(h.due_date) < today;
                return (
                  <tr key={h.issue_id} className="hover:bg-muted/25 transition-colors">
                    <td className="table-cell">
                      <span className="font-mono text-xs bg-muted px-2.5 py-1.5 rounded-lg font-bold">#{h.issue_id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td className="table-cell font-semibold text-sm">{h.users?.name}</td>
                    <td className="table-cell text-sm font-bold text-primary">{h.books?.title}</td>
                    <td className="table-cell text-xs text-muted-foreground font-semibold">{format(new Date(h.issue_date), 'dd MMM yyyy')}</td>
                    <td className="table-cell text-xs font-semibold">
                      {h.return_date
                        ? <span className="text-emerald-600 dark:text-emerald-400">{format(new Date(h.return_date), 'dd MMM yyyy')}</span>
                        : <span className={isOverdue ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}>{format(new Date(h.due_date), 'dd MMM yyyy')}</span>
                      }
                    </td>
                    <td className="table-cell text-right">
                      {h.fine_amount > 0
                        ? <span className="text-destructive font-black text-sm">₹{h.fine_amount}</span>
                        : <span className="text-muted-foreground text-sm font-semibold">—</span>
                      }
                    </td>
                    <td className="table-cell text-right">
                      <span className={`badge ${h.status === 'Returned' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : isOverdue ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                        {isOverdue ? '⚠ Overdue' : h.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-semibold">
            <span className="font-black text-foreground">{tabData[tab].length}</span> records shown
          </p>
          <p className="text-xs text-muted-foreground font-semibold">
            Total Fine: <span className="font-black text-foreground">₹{tabData[tab].reduce((a, c) => a + (Number(c.fine_amount) || 0), 0)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
