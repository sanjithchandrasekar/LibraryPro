import React, { useState, useEffect } from 'react';
import { issueService } from '../services/issueService';
import { bookService } from '../services/bookService';
import { userService } from '../services/userService';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import {
  Plus, RotateCcw, AlertTriangle, CheckCircle2,
  Clock, Book, CalendarDays, IndianRupee, ArrowLeftRight
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
  const [issues, setIssues] = useState([]);
  const [allBooks, setAllBooks] = useState([]);       // full list for availability check
  const [availableBooks, setAvailableBooks] = useState([]); // for dropdown display
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [returning, setReturning] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    const [i, b, u] = await Promise.all([
      issueService.getIssues(),
      bookService.getBooks(),   // fetch ALL books
      userService.getUsers()
    ]);
    setIssues(i);
    setAllBooks(b);                                    // full list for service checks
    setAvailableBooks(b.filter(bk => bk.available_copies > 0)); // dropdown only shows available
    setUsers(u);
    setLoading(false);
  };

  useEffect(() => { 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll(); 
    // Add auto-refresh to handle race condition with multiple tabs (every 5 seconds)
    const interval = setInterval(loadAll, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedBook) { toast.warning('Please select a member and a book.'); return; }
    setSubmitting(true);
    try {
      // Pass full books list so issueService can run the availability check
      await issueService.issueBook({ userId: selectedUser, bookId: selectedBook, users, books: allBooks });
      toast.success('📚 Book issued successfully!');
      setIsModalOpen(false);
      setSelectedUser(''); setSelectedBook('');
      loadAll();
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  const handleReturn = async (issueId) => {
    setReturning(issueId);
    try {
      const { fine } = await issueService.returnBook(issueId);
      fine > 0
        ? toast.info(`Book returned. Late fine: ₹${fine}`, { autoClose: 5000 })
        : toast.success('✅ Book returned — no fine!');
      loadAll();
    } catch (err) { toast.error(err.message); }
    finally { setReturning(null); }
  };

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
            <h1 className="text-2xl font-black tracking-tight">Circulation Desk</h1>
          </div>
          <p className="text-sm text-muted-foreground font-medium ml-12">Issue and receive book returns with automatic fine calculation.</p>
        </div>
        <button id="issue-book-btn" onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={18} /> Issue a Book
        </button>
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
                  <th className="table-header text-right">Fine / Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
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
                        <DaysLabel issue={h} />
                      </div>
                    </td>
                    <td className="table-cell"><StatusBadge issue={h} /></td>
                    <td className="table-cell text-right">
                      {h.fine_amount > 0 && (
                        <div className="flex items-center justify-end gap-1 text-destructive text-sm font-black mb-1.5">
                          <IndianRupee size={13} /> {h.fine_amount}
                        </div>
                      )}
                      {h.status === 'Issued' ? (
                        <button
                          onClick={() => handleReturn(h.issue_id)}
                          disabled={returning === h.issue_id}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
                        >
                          {returning === h.issue_id
                            ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full spin" />
                            : <RotateCcw size={13} />}
                          Return
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          <CheckCircle2 size={14} /> Done
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Issue Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        title="Issue a Book" description="Select a member and available book to create an issue record.">
        <form onSubmit={handleIssue} className="space-y-5">
          <div>
            <label className="block text-sm font-bold mb-2 text-foreground/80">Select Member *</label>
            <select required value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="input-field">
              <option value="">Choose library member...</option>
              {users.map(u => (
                <option key={u.user_id} value={u.user_id}>{u.name} — {u.role}, {u.department}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 text-foreground/80">Select Book *</label>
            <select required value={selectedBook} onChange={e => setSelectedBook(e.target.value)} className="input-field">
              <option value="">Choose available book...</option>
              {availableBooks.map(b => (
                <option key={b.book_id} value={b.book_id}>{b.title} — {b.author} ({b.available_copies} avail.)</option>
              ))}
            </select>
          </div>

          {/* Policy Box */}
          <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-primary/15 flex items-center justify-center">
                <Book size={11} className="text-primary" />
              </div>
              <p className="font-black text-sm text-primary">Loan Policy</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['📅 Duration', '7 days'],
                ['💸 Late Fine', '₹10/day'],
                ['📆 Issue Date', 'Today'],
                ['⏰ Due Date', '+7 days'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 text-muted-foreground">
                  <span>{k}:</span>
                  <span className="text-foreground font-bold">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className="flex-1 py-3 rounded-2xl border border-border hover:bg-muted font-bold text-sm transition-all">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 btn-primary justify-center py-3">
              {submitting
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spin" />
                : '✅ Confirm Issue'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Issues;
