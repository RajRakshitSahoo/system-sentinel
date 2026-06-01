import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MdStorage, MdRefresh } from 'react-icons/md';
import { PageHeader, Skeleton, formatBytes } from '../components/common/UI';
import { API } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function StorageAnalyzer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStorage = async () => {
    setLoading(true);
    try {
      const res = await API.get('/monitor/storage');
      setData(res.data);
    } catch { toast.error('Failed to load storage info'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStorage(); }, []);

  if (loading) return (
    <div className="p-6 space-y-4">
      <Skeleton style={{ height: 60, width: 300 }} />
      <div className="grid grid-cols-2 gap-4">{[0,1,2,3].map(i => <Skeleton key={i} style={{ height: 120 }} />)}</div>
    </div>
  );

  const drives = data?.drives || [];
  const totalSize = drives.reduce((sum, d) => sum + (d.size || 0), 0);
  const totalUsed = drives.reduce((sum, d) => sum + (d.used || 0), 0);

  const COLORS = ['var(--color-primary)', 'var(--color-accent)', '#2ed573', '#ffa502', '#ff4757', '#bf00ff'];

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Storage Analyzer" subtitle="Disk usage and file system information" icon={MdStorage}
        actions={<button onClick={fetchStorage} className="btn-ghost px-3 py-2 text-sm flex items-center gap-1"><MdRefresh size={16} /> Refresh</button>}
      />

      {/* Overview */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Space', value: formatBytes(totalSize), color: 'var(--color-primary)' },
          { label: 'Used Space', value: formatBytes(totalUsed), color: 'var(--color-warning)' },
          { label: 'Free Space', value: formatBytes(totalSize - totalUsed), color: 'var(--color-success)' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className="label mb-2">{s.label}</div>
            <div className="font-mono font-bold text-xl" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>Storage Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={drives.map(d => ({ name: d.mount, value: d.used, total: d.size }))}
                cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                dataKey="value" nameKey="name">
                {drives.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                formatter={(v, n) => [formatBytes(v), n]}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--color-text-muted)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Drive list */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>Drive Details</h3>
          <div className="space-y-4">
            {drives.map((d, i) => (
              <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-mono font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{d.mount}</span>
                    <span className="ml-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>{d.fs} · {d.type}</span>
                  </div>
                  <span className="font-bold text-sm" style={{
                    color: d.usePercent > 90 ? 'var(--color-danger)' : d.usePercent > 75 ? 'var(--color-warning)' : 'var(--color-success)'
                  }}>{d.usePercent}%</span>
                </div>
                <div className="progress-bar mb-2">
                  <div className="progress-fill" style={{
                    width: `${d.usePercent}%`,
                    background: d.usePercent > 90 ? 'var(--color-danger)' : d.usePercent > 75 ? 'var(--color-warning)' : COLORS[i % COLORS.length]
                  }} />
                </div>
                <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span>{formatBytes(d.used)} used</span>
                  <span>{formatBytes(d.available)} free</span>
                  <span>{formatBytes(d.size)} total</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Block devices */}
      {data?.blockDevices?.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>Physical Devices</h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Device</th><th>Type</th><th>Size</th><th>Vendor</th><th>Model</th><th>Removable</th>
                </tr>
              </thead>
              <tbody>
                {data.blockDevices.map((d, i) => (
                  <tr key={i}>
                    <td className="font-mono text-sm">{d.name}</td>
                    <td><span className="badge badge-info">{d.type}</span></td>
                    <td className="font-mono text-sm">{d.size ? formatBytes(d.size) : '—'}</td>
                    <td>{d.vendor || '—'}</td>
                    <td>{d.model || '—'}</td>
                    <td><span className={`badge ${d.removable ? 'badge-warning' : 'badge-success'}`}>{d.removable ? 'Yes' : 'No'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
