import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { 
  Database, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Server, 
  ShieldCheck, 
  Globe,
  Terminal,
  Activity
} from 'lucide-react';

const TestConnection = () => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Checking...');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(null);

  const checkConnection = useCallback(async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    
    try {
      // Small wait to show the animation
      await new Promise(resolve => setTimeout(resolve, 800));

      const { error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      
      const end = performance.now();
      setLatency(Math.round(end - start));
      setStatus('Connected');
      setData('Great! Your website is successfully linked to the database.');
    } catch (err) {
      console.error('Connection test error:', err);
      setStatus('Not Connected');
      setError(err.message || 'We could not reach the database. Please check your setup.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const envVars = [
    { name: 'Database URL', value: import.meta.env.VITE_SUPABASE_URL },
    { name: 'Secret Key', value: import.meta.env.VITE_SUPABASE_ANON_KEY },
  ];

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Colors */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-3xl w-full space-y-8 relative">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
            <Activity className="w-3 h-3" />
            Connection Check
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Is it <span className="text-gradient">working?</span>
          </h1>
          <p className="text-muted-foreground font-medium max-w-md mx-auto text-sm md:text-base">
            Checking if your website can talk to the database correctly.
          </p>
        </div>

        {/* Status Card */}
        <div className="glass-premium rounded-[2.5rem] p-8 md:p-12 border border-border/50 relative overflow-hidden group shadow-2xl shadow-primary/5">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
            {/* Status Icon */}
            <div className="relative">
              <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center transition-all duration-700 ${
                loading ? 'bg-muted/40' : status === 'Connected' ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}>
                {loading ? (
                  <RefreshCw className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground spin" />
                ) : status === 'Connected' ? (
                  <Database className="w-12 h-12 md:w-16 md:h-16 text-green-500 drop-shadow-sm" />
                ) : (
                  <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-red-500" />
                )}
              </div>
              {/* Rings */}
              <div className={`absolute -inset-4 rounded-full border border-primary/10 ${loading ? 'animate-pulse' : ''}`} />
              <div className={`absolute -inset-8 rounded-full border border-primary/5 ${loading ? 'animate-pulse delay-150' : ''}`} />
            </div>

            <div className="flex-1 text-center md:text-left space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <h2 className="text-3xl font-black tracking-tight">
                    {loading ? 'Checking...' : status}
                  </h2>
                  {!loading && (
                    <span className={`w-3 h-3 rounded-full animate-pulse shadow-sm ${status === 'Connected' ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`} />
                  )}
                </div>
                <p className="text-muted-foreground text-sm md:text-base font-medium leading-relaxed">
                  {loading ? 'Connecting to database...' : data || 'Check below for details.'}
                </p>
              </div>

              {!loading && latency && (
                <div className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/40 px-4 py-2 rounded-xl border border-border/60">
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  Speed: {latency}ms
                </div>
              )}
            </div>

            <button 
              onClick={checkConnection}
              disabled={loading}
              className="btn-primary w-full md:w-auto h-fit self-center"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'spin' : ''}`} />
              {loading ? 'Testing...' : 'Try Again'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-10 p-6 rounded-[1.5rem] bg-slate-950/5 dark:bg-black/40 border border-red-500/20 backdrop-blur-sm flex gap-4">
              <Terminal className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-2 overflow-hidden">
                <p className="text-xs font-black text-red-600/80 dark:text-red-400/80 uppercase tracking-widest">Error Details</p>
                <code className="text-[13px] font-mono text-red-500/90 block break-all leading-relaxed whitespace-pre-wrap">
                  {error}
                </code>
              </div>
            </div>
          )}
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {envVars.map((v, i) => (
            <div key={i} className="glass-premium rounded-3xl p-6 flex items-center justify-between group hover:border-primary/40 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/80">Setting</p>
                  <p className="text-sm font-bold text-foreground/90 truncate max-w-[150px]">{v.name}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {v.value ? (
                  <span className="badge bg-green-500/10 text-green-600 gap-1.5 border border-green-500/10">
                    <CheckCircle2 className="w-3 h-3" />
                    Ready
                  </span>
                ) : (
                  <span className="badge bg-red-500/10 text-red-600 gap-1.5 border border-red-500/10">
                    <XCircle className="w-3 h-3" />
                    Missing
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 pt-6 border-t border-border/30">
           <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
             <Server className="w-3.5 h-3.5" />
             Database: Supabase
           </div>
           <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
             <ShieldCheck className="w-3.5 h-3.5" />
             Security: Encrypted
           </div>
        </div>
      </div>
    </div>
  );
};

export default TestConnection;
