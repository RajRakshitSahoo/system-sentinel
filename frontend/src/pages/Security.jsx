import React, { useState, useEffect } from 'react';
import { MdSecurity, MdRefresh, MdDelete } from 'react-icons/md';
import { PageHeader, Skeleton } from '../components/common/UI';
import { API } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  login: '🔐', logout: '🚪', usb_connect: '🔌', usb_disconnect: '🔌',
  network_change: '🌐', device_change: '💻', failed_login: '⚠️'
};

export default function Security() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    try { const res = await API.get('/security?limit=100'); setLogs(res.data.logs); }
    catch { toast.error('Failed to load security logs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, []);

  const clearLogs = async () => {
    if (!confirm('Clear all security logs?')) return;
    await API.delete('/security'); setLogs([]); toast.success('Security logs cleared');
  };

  const filtered = filter === 'all' ? logs : logs.filter(l => l.type === filter);
  const types = [...new Set(logs.map(l => l.type))];

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Security Dashboard" subtitle="Login sessions, device changes and security events" icon={MdSecurity}
        actions={<div className="flex gap-2">
          <button onClick={clearLogs} className="btn-ghost px-3 py-2 text-sm text-red-400"><MdDelete size={16} /></button>
          <button onClick={fetchLogs} className="btn-ghost px-3 py-2 text-sm"><MdRefresh size={16} /></button>
        </div>}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { key: 'login', label: 'Logins', color: 'var(--color-success)' },
          { key: 'logout', label: 'Logouts', color: 'var(--color-text-muted)' },
          { key: 'failed_login', label: 'Failed Logins', color: 'var(--color-danger)' },
          { key: 'usb_connect', label: 'USB Events', color: 'var(--color-warning)' },
          { key: 'network_change', label: 'Net Changes', color: 'var(--color-primary)' },
          { key: 'device_change', label: 'Device Changes', color: 'var(--color-accent)' },
        ].map(s => (
          <div key={s.key} className="card p-3 text-center cursor-pointer" onClick={() => setFilter(s.key === filter ? 'all' : s.key)}
            style={{ borderColor: filter === s.key ? s.color : 'var(--color-border)' }}>
            <div className="font-display text-xl font-bold" style={{ color: s.color }}>
              {logs.filter(l => l.type === s.key).length}
            </div>
            <div className="label text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 text-xs rounded-lg ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}>All</button>
        {types.map(t => <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 text-xs rounded-lg capitalize ${filter === t ? 'btn-primary' : 'btn-ghost'}`}>{t.replace('_', ' ')}</button>)}
      </div>

      {loading ? <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} style={{ height: 70 }} />)}</div>
        : filtered.length === 0 ? (
          <div className="card p-12 text-center" style={{ color: 'var(--color-text-muted)' }}>No security logs found</div>
        ) : (
          <div className="card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr><th>Event</th><th>Type</th><th>Description</th><th>IP</th><th>Severity</th><th>Time</th></tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => (
                  <tr key={i}>
                    <td className="text-lg">{TYPE_ICONS[log.type] || '📋'}</td>
                    <td><span className="badge badge-info text-xs">{log.type?.replace('_', ' ')}</span></td>
                    <td className="text-sm max-w-xs truncate">{log.description}</td>
                    <td className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>{log.ip || '—'}</td>
                    <td><span className={`badge ${log.severity === 'critical' ? 'badge-critical' : log.severity === 'warning' ? 'badge-warning' : 'badge-info'}`}>{log.severity}</span></td>
                    <td className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
