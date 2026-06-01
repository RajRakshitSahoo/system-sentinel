import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { MdBarChart, MdRefresh } from 'react-icons/md';
import { PageHeader, Skeleton } from '../components/common/UI';
import { API } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Analytics() {
  const [view, setView] = useState('daily');
  const [data, setData] = useState({ daily: null, weekly: null, monthly: null });
  const [loading, setLoading] = useState(false);

  const fetchData = async (tab = view) => {
    setLoading(true);
    try {
      const endpoint = tab === 'daily' ? '/analytics/daily' : tab === 'weekly' ? '/analytics/weekly' : '/analytics/monthly';
      const res = await API.get(endpoint);
      setData(prev => ({ ...prev, [tab]: res.data }));
    } catch { toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [view]);

  const tabs = ['daily', 'weekly', 'monthly'];

  const renderChart = () => {
    if (loading) return <Skeleton style={{ height: 300 }} />;
    const d = data[view];
    if (!d) return <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>No data available</div>;

    if (view === 'daily') {
      const chartData = d.summary?.hourly || [];
      return (
        <>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Avg CPU', value: `${d.summary?.avgCpu || 0}%`, color: 'var(--color-primary)' },
              { label: 'Peak CPU', value: `${d.summary?.peakCpu || 0}%`, color: 'var(--color-danger)' },
              { label: 'Avg Memory', value: `${d.summary?.avgMem || 0}%`, color: '#2ed573' },
              { label: 'Peak Memory', value: `${d.summary?.peakMem || 0}%`, color: 'var(--color-warning)' },
            ].map(s => (
              <div key={s.label} className="card p-3 text-center">
                <div className="label mb-1">{s.label}</div>
                <div className="font-display text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div className="card p-5">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Hourly Average</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="hour" tickFormatter={h => `${h}:00`} tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
                <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v, n) => [`${v}%`, n]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="avgCpu" name="CPU %" fill="var(--color-primary)" radius={[4,4,0,0]} />
                <Bar dataKey="avgMem" name="Memory %" fill="#2ed573" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      );
    }

    if (view === 'weekly') {
      const chartData = (d.weekly || []).map(w => ({ ...w, date: new Date(w.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }) }));
      return (
        <div className="card p-5">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>7-Day Performance Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} formatter={(v, n) => [`${v}%`, n]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="avgCpu" name="Avg CPU %" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="peakCpu" name="Peak CPU %" stroke="var(--color-danger)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="avgMem" name="Avg Memory %" stroke="#2ed573" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (view === 'monthly') {
      const chartData = (d.monthly || []).map(m => ({ ...m, date: new Date(m.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) }));
      return (
        <div className="card p-5">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>30-Day Performance History</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ left: -20 }}>
              <defs>
                <linearGradient id="cpuArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="memArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2ed573" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2ed573" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--color-text-muted)' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} formatter={(v, n) => [`${v}%`, n]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="avgCpu" name="CPU %" stroke="var(--color-primary)" fill="url(#cpuArea)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="avgMem" name="Memory %" stroke="#2ed573" fill="url(#memArea)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Performance Analytics" subtitle="Historical trends and usage statistics" icon={MdBarChart}
        actions={<button onClick={() => fetchData()} className="btn-ghost px-3 py-2 text-sm flex items-center gap-1"><MdRefresh size={16} /> Refresh</button>}
      />

      {/* Tab selector */}
      <div className="flex gap-2">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setView(tab)}
            className={`px-4 py-2 text-sm rounded-lg capitalize transition-all ${view === tab ? 'btn-primary' : 'btn-ghost'}`}>
            {tab === 'daily' ? 'Today' : tab === 'weekly' ? 'Last 7 Days' : 'Last 30 Days'}
          </button>
        ))}
      </div>

      {renderChart()}
    </div>
  );
}
