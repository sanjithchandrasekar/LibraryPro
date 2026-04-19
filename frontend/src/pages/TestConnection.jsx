import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const TestConnection = () => {
  const [status, setStatus] = useState('Checking connection...');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function checkConnection() {
      try {
        const { data, error } = await supabase.from('users').select('count', { count: 'exact' });
        
        if (error) {
          throw error;
        }
        
        setStatus('Successfully connected to Supabase Database!');
        setData(`Connection OK! Found ${data.length > 0 ? 'tables' : 'database'}`);
      } catch (err) {
        console.error('Connection test error:', err);
        setStatus('Failed to connect to database.');
        setError(err.message || 'Unknown error occurred. Have you applied the SQL schema?');
      }
    }

    checkConnection();
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Database Connection Test</h1>
      
      <div style={{
          padding: '1rem',
          marginTop: '1rem',
          borderRadius: '8px',
          backgroundColor: status.includes('Success') ? '#d4edda' : status.includes('Failed') ? '#f8d7da' : '#fff3cd',
          color: status.includes('Success') ? '#155724' : status.includes('Failed') ? '#721c24' : '#856404'
      }}>
        <h3 style={{ marginTop: 0 }}>{status}</h3>
        {data && <p>{data}</p>}
        {error && <p style={{ fontWeight: 'bold' }}>Error Details: {error}</p>}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Environment Variables Configuration</h3>
        <p><strong>VITE_SUPABASE_URL:</strong> {import.meta.env.VITE_SUPABASE_URL ? '✅ Configured' : '❌ Missing'}</p>
        <p><strong>VITE_SUPABASE_ANON_KEY:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}</p>
      </div>
    </div>
  );
};

export default TestConnection;
