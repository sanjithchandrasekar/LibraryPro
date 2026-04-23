import React, { useState, useEffect } from 'react';
import { issueService } from '../services/issueService';
import Loader from '../components/common/Loader';
import { BtnSpinner } from '../components/common/Loader';
import { useAuth } from '../hooks/useAuth';
import {
  AlertTriangle, CheckCircle2,
  Clock, Book, CalendarDays, ArrowLeftRight, RotateCcw
} from 'lucide-react';
import { toast } from 'react-toastify';
import { format, differenceInDays } from 'date-fns';

const StatusBadge = ({ issue }) => {
  const today = new Date();
  const isOverdue = new Date(issue.due_date) < today && issue.status === 'Issued';
  if (issue.status === 'Returned')
    return <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-900/40">✓ Returned</span>;
  if (isOverdue)
    return <span className="badge bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200/40 dark:border-red-900/40">⚠ Overdue</span>;
  return <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/40 dark:border-amber-900/40">⏱ Issued</span>;
};

const DaysLabel = ({ issue }) => {
  const today = new Date();
  const due = new Date(issue.due_date);
  const diff = differenceInDays(due, today);
  if (issue.status === 'Returned') return <span className="text-xs text-muted-foreground font-semibold">Returned</span>;
  if (diff < 0) return <span className="text-xs text-red-600 dark:text-red-400 font-bold">{Math.abs(diff)}d overdue</span>;
  if (diff === 0) return <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">Due today!</span>;
  return <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{diff}d remaining</span>;
};

const filterTabs = [
  { key: 'all', label: 'All', color: 'text-indigo-600 dark:text-indigo-400', activeBg: 'bg-indigo-600 dark:bg-indigo-500', icon: ArrowLeftRight },
  { key: 'Issued', label: 'Issued', color: 'text-amber-600 dark:text-amber-400', activeBg: 'bg-amber-500', icon: Clock },
  { key: 'Overdue', label: 'Overdue', color: 'text-red-600 dark:text-red-400', activeBg: 'bg-red-600', icon: AlertTriangle },
  { key: 'Returned', label: 'Returned', color: 'text-emerald-600 dark:text-emerald-400', activeBg: 'bg-emerald-600', icon: CheckCircle2 },
];

const Issues = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [returning, setReturning] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const i = await issueService.getIssues();
      setIssues(i);
    } catch {
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (issueId) => {
    setReturning(issueId);
    try {
      const { fine } = await issueService.returnBook(issueId);
      if (fine > 0) toast.warning(`Book returned. Fine of ₹${fine} applied.`);
      else toast.success('Book marked as returned!');
      await loadAll();
    } catch { toast.error('Failed to return book'); }
    finally { setReturning(null); }
  };

  useEffect(() => { loadAll(); }, []);

  const filtered = issues.filter(i => {
    if (filter === 'all') return true;
    if (filter === 'Overdue') return i.status === 'Issued' && new Date(i.due_date) < new Date();
    return i.status === filter;
  });

  const counts = {
    all: issues.length,
    Issued: issues.filter(i => i.status === 'Issued').length,
    Overdue: issues.filter(i => i.status === 'Issued' && new Date(i.due_date) < new Date()).length,
    Returned: issues.filter(i => i.status === 'Returned').length,
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <ArrowLeftRight size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Staff Operations Desk</h1>
          </div>
          <p className="text-sm text-muted-foreground font-medium ml-12">View and manage all member loans, overdue books, and return verifications.</p>
        </div>
      </div>

      {/* Filter Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {filterTabs.map(s => {
          const Icon = s.icon;
          const isActive = filter === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`text-left bg-card border rounded-3xl p-5 card-hover shadow-sm transition-all duration-300 ${isActive ? `border-current ${s.color} ring-2 ring-current/20 shadow-md` : 'border-border hover:border-border'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? `${s.activeBg} shadow-sm` : 'bg-muted'}`}>
                  <Icon size={16} className={isActive ? 'text-white' : 'text-muted-foreground'} />
                </div>
                <span className={`text-3xl font-black tabular-nums ${isActive ? s.color : 'text-foreground'}`}>{counts[s.key]}</span>
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{s.label}</p>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3 bg-muted/20">
          <span className="text-sm font-black text-foreground">
            {filter === 'all' ? 'All Records' : filter}
          </span>
          <span className="badge bg-muted text-muted-foreground">{filtered.length}</span>
        </div>

        {loading ? <Loader /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header text-left">ID</th>
                  <th className="table-header text-left">Member</th>
                  <th className="table-header text-left">Book</th>
                  <th className="table-header text-left">Timeline</th>
                  <th className="table-header text-left">Status</th>
                  {user?.role === 'Admin' && <th className="table-header text-right">Action</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="py-20 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-muted flex items-center justify-center">
                          <Book size={28} className="text-muted-foreground/40" />
                        </div>
                        <p className="text-muted-foreground font-bold">No records found</p>
                        <p className="text-sm text-muted-foreground/60 mt-1.5">Try a different filter</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(h => (
                  <tr key={h.issue_id} className="hover:bg-muted/25 transition-colors group">
                    <td className="table-cell">
                      <span className="font-mono text-xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded-lg font-bold">
                        #{h.issue_id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-indigo-500/15 border border-primary/15 flex items-center justify-center text-primary font-black text-sm shrink-0">
                          {h.users?.name?.charAt(0)}
                        </div>
                        <span className="font-semibold text-sm">{h.users?.name}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <p className="font-bold text-sm text-primary">{h.books?.title}</p>
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <CalendarDays size={11} />
                          <span>Issued:</span>
                          <span className="font-bold text-foreground">{format(new Date(h.issue_date), 'MMM d, yy')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock size={11} />
                          <span>Due: {format(new Date(h.due_date), 'MMM d, yy')}</span>
                        </div>
                        {h.status === 'Returned' && h.return_date && (
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={11} />
                            <span className="font-semibold">Returned: {format(new Date(h.return_date), 'MMM d, yy')}</span>
                          </div>
                        )}
                        {h.status !== 'Returned' && <DaysLabel issue={h} />}
                      </div>
                    </td>
                    <td className="table-cell"><StatusBadge issue={h} /></td>
                    {user?.role === 'Admin' && (
                      <td className="table-cell text-right">
                        {h.status !== 'Returned' && (
                          <button
                            onClick={() => handleReturn(h.issue_id)}
                            disabled={returning === h.issue_id}
                            className="flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200/50 hover:bg-emerald-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                          >
                            {returning === h.issue_id ? <BtnSpinner light={false} /> : <RotateCcw size={13} />}
                            {returning === h.issue_id ? '' : 'Return'}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Issues;
