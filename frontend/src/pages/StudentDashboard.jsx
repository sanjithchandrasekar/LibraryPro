import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { issueService } from '../services/issueService';
import Loader from '../components/common/Loader';
import { Book, Clock, CheckCircle2, AlertTriangle, BookOpen, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student';

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await issueService.getUserHistory(user.id);
        setHistory(data);
      } catch (error) {
        console.error('Failed to load user history', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user.id]);

  if (loading) return <Loader fullPage />;

  const currentIssues = history.filter(i => i.status === 'Issued');
  const returnedIssues = history.filter(i => i.status === 'Returned');
  const totalFines = returnedIssues.reduce((sum, i) => sum + (i.fine_amount || 0), 0);
  
  // Calculate overdue fines for current issues dynamically
  const currIssuesWithFines = currentIssues.map(issue => {
    const isOverdue = new Date(issue.due_date) < new Date();
    const diffTime = Math.abs(new Date() - new Date(issue.due_date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    const currentFine = isOverdue ? diffDays * 10 : 0;
    return { ...issue, isOverdue, currentFine };
  });

  const totalCurrentFines = currIssuesWithFines.reduce((sum, i) => sum + i.currentFine, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{today}</p>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            {greeting}, <span className="text-primary">{userName}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium opacity-80">Welcome to your library dashboard.</p>
        </div>
        <Link to="/books" className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-2xl shadow-sm transition-all hover:scale-105 active:scale-95">
          <BookOpen size={18} />
          Browse Catalog
        </Link>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl opacity-20 bg-gradient-to-br from-violet-500 to-indigo-600" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Currently Borrowed</p>
          <p className="text-5xl font-black tabular-nums text-foreground">{currentIssues.length}</p>
        </div>
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl opacity-20 bg-gradient-to-br from-emerald-400 to-teal-500" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Books Read</p>
          <p className="text-5xl font-black tabular-nums text-foreground">{returnedIssues.length}</p>
        </div>
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl opacity-20 bg-gradient-to-br from-red-500 to-rose-600" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Pending Fines</p>
          <p className="text-5xl font-black tabular-nums text-foreground leading-none">
            <span className="text-3xl mr-1 opacity-50">₹</span>{totalCurrentFines}
          </p>
          {(totalFines > 0) && (
            <p className="text-xs text-muted-foreground mt-2 font-medium">Past fines paid: ₹{totalFines}</p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Current Borrowings */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-8 py-5 border-b border-border flex items-center justify-between">
            <h3 className="font-black text-lg text-foreground tracking-tight flex items-center gap-2">
              <Book size={18} className="text-primary"/> My Current Books
            </h3>
          </div>
          <div className="p-4 flex-1">
            {currIssuesWithFines.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <BookOpen size={24} className="text-muted-foreground"/>
                </div>
                <p className="font-bold">You haven't borrowed any books.</p>
                <Link to="/books" className="text-primary font-bold text-sm mt-2 hover:underline">Explore catalog →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {currIssuesWithFines.map(issue => (
                  <div key={issue.issue_id} className="p-5 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-foreground">{issue.books.title}</h4>
                      {issue.isOverdue ? (
                        <span className="bg-red-100 text-red-700 text-xs font-black uppercase px-2 py-1 rounded-md">Overdue</span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 text-xs font-black uppercase px-2 py-1 rounded-md">Issued</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><Calendar size={14}/> Issued: {issue.issue_date}</span>
                      <span className="flex items-center gap-1"><Clock size={14}/> Due: {issue.due_date}</span>
                    </div>
                    {issue.currentFine > 0 && (
                      <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 p-2 rounded-lg">
                        <AlertTriangle size={14}/> Fine Accumulating: ₹{issue.currentFine}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-8 py-5 border-b border-border flex items-center justify-between">
            <h3 className="font-black text-lg text-foreground tracking-tight flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500"/> Reading History
            </h3>
          </div>
          <div className="p-4 flex-1">
            {returnedIssues.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                <p className="font-bold">No past reading history found.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {returnedIssues.map(issue => (
                  <div key={issue.issue_id} className="p-5 rounded-2xl bg-muted/20 border border-border/50">
                    <h4 className="font-bold text-foreground mb-1">{issue.books.title}</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-muted-foreground">
                      <span>Returned: {issue.return_date}</span>
                      {issue.fine_amount > 0 && (
                        <span className="text-red-500 font-bold">Fine Paid: ₹{issue.fine_amount}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
