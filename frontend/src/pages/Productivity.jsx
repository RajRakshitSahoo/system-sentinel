import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MdWork, MdRefresh } from 'react-icons/md';
import { PageHeader, Skeleton } from '../components/common/UI';
import { API } from '../context/AuthContext';
import toast from 'react-hot-toast';

function formatDuration(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function Productivity() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try { const res = await API.get('/productivity?days=7'); setData(res.data); }
    catch { toast.error('Failed to load productivity data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="p-6 space-y-4"><Skeleton style={{ height: 60, width: 300 }} />{[0,1].map(i => <Skeleton key={i} style={{ height: 200 }} />)}</div>;

  const chartData = (data?.logs || []).map(l => ({
    date: new Date(l.date).toLocaleDateString('en', { weekday: 'short' }),
    active: Math.round((l.activeTime || 0) / 60),
    idle: Math.round((l.idleTime || 0) / 60),
  }));

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Productivity Dashboard" subtitle="Active time, idle time and application usage" icon={MdWork}
        actions={<button onClick={fetchData} className="btn-ghost px-3 py-2 text-sm flex items-center gap-1"><MdRefresh size={16} /> Refresh</button>}
      />

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Active', value: formatDuration(data?.totalActive || 0), color: 'var(--color-success)' },
          { label: 'Total Idle', value: formatDuration(data?.totalIdle || 0), color: 'var(--color-text-muted)' },
          { label: 'Active Ratio', value: data?.totalActive ? `${Math.round(data.totalActive / (data.totalActive + data.totalIdle) * 100) || 0}%` : '0%', color: 'var(--color-primary)' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className="label mb-2">{s.label}</div>
            <div className="font-display text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Weekly Activity (minutes)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="active" name="Active (min)" fill="var(--color-success)" radius={[4,4,0,0]} stackId="a" />
              <Bar dataKey="idle" name="Idle (min)" fill="var(--color-surface-2)" radius={[4,4,0,0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data?.topApps?.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Top Applications</h3>
          <div className="space-y-3">
            {data.topApps.slice(0, 8).map((app, i) => {
              const maxDur = data.topApps[0].duration;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-sm font-medium w-32 truncate" style={{ color: 'var(--color-text)' }}>{app.name}</div>
                  <div className="flex-1 progress-bar">
                    <div className="progress-fill" style={{ width: `${(app.duration / maxDur) * 100}%`, background: 'var(--color-primary)' }} />
                  </div>
                  <div className="text-xs font-mono w-16 text-right" style={{ color: 'var(--color-text-muted)' }}>{formatDuration(app.duration)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(!data?.logs || data.logs.length === 0) && (
        <div className="card p-12 text-center" style={{ color: 'var(--color-text-muted)' }}>
          <MdWork size={48} className="mx-auto mb-3 opacity-30" />
          <p>No productivity data yet. Data is collected as you use the system.</p>
        </div>
      )}
    </div>
  );
}
