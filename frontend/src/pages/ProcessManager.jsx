import React, { useState, useEffect, useCallback } from 'react';
import { MdMemory, MdRefresh, MdSearch } from 'react-icons/md';
import { PageHeader, Skeleton } from '../components/common/UI';
import { API } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProcessManager() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('cpu');
  const [sortDir, setSortDir] = useState('desc');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchProcesses = useCallback(async () => {
    try {
      const res = await API.get('/monitor/processes');
      setData(res.data);
    } catch {
      toast.error('Failed to fetch processes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProcesses(); }, [fetchProcesses]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchProcesses, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchProcesses]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const filtered = (data?.processes || [])
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || String(p.pid).includes(search))
    .sort((a, b) => {
      const v = sortDir === 'desc' ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy];
      return isNaN(v) ? (sortDir === 'desc' ? (b[sortBy] > a[sortBy] ? 1 : -1) : (a[sortBy] > b[sortBy] ? 1 : -1)) : v;
    });

  const SortArrow = ({ col }) => sortBy === col ? (sortDir === 'desc' ? ' ↓' : ' ↑') : '';

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Process Manager" subtitle={`${data?.total || 0} processes • ${data?.running || 0} running`}
        icon={MdMemory}
        actions={
          <div className="flex gap-2">
            <button onClick={() => setAutoRefresh(a => !a)}
              className={`px-3 py-2 text-sm rounded-lg border transition-all ${autoRefresh ? 'border-green-500 text-green-400 bg-green-900/20' : 'btn-ghost'}`}>
              {autoRefresh ? '● Live' : 'Auto Refresh'}
            </button>
            <button onClick={fetchProcesses} className="btn-ghost px-3 py-2 text-sm flex items-center gap-1">
              <MdRefresh size={16} /> Refresh
            </button>
          </div>
        }
      />

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: data?.total, color: 'var(--color-primary)' },
          { label: 'Running', value: data?.running, color: 'var(--color-success)' },
          { label: 'Sleeping', value: data?.sleeping, color: 'var(--color-text-muted)' },
          { label: 'Showing', value: filtered.length, color: 'var(--color-warning)' },
        ].map(s => (
          <div key={s.label} className="card p-3 text-center">
            <div className="font-display text-xl font-bold" style={{ color: s.color }}>{s.value ?? '—'}</div>
            <div className="label mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
        <input className="input-field pl-10" placeholder="Search by name or PID..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">{[...Array(10)].map((_, i) => <Skeleton key={i} style={{ height: 36 }} />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  {[
                    { key: 'name', label: 'Process Name' },
                    { key: 'pid', label: 'PID' },
                    { key: 'cpu', label: 'CPU %' },
                    { key: 'mem', label: 'MEM %' },
                    { key: 'memRss', label: 'RSS' },
                    { key: 'state', label: 'State' },
                    { key: 'user', label: 'User' },
                  ].map(col => (
                    <th key={col.key} onClick={() => toggleSort(col.key)}
                      className="cursor-pointer select-none hover:opacity-80">
                      {col.label}<SortArrow col={col.key} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map(p => (
                  <tr key={p.pid}>
                    <td className="font-mono text-sm" style={{ color: 'var(--color-text)' }}>{p.name}</td>
                    <td className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>{p.pid}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="progress-bar w-16" style={{ height: 4 }}>
                          <div className="progress-fill" style={{
                            width: `${Math.min(100, p.cpu)}%`,
                            background: p.cpu > 50 ? 'var(--color-danger)' : p.cpu > 20 ? 'var(--color-warning)' : 'var(--color-primary)'
                          }} />
                        </div>
                        <span className="font-mono text-xs" style={{ color: p.cpu > 50 ? 'var(--color-danger)' : 'var(--color-text)' }}>
                          {p.cpu.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-xs" style={{ color: p.mem > 20 ? 'var(--color-warning)' : 'var(--color-text)' }}>
                        {p.mem.toFixed(1)}%
                      </span>
                    </td>
                    <td className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {p.memRss ? `${(p.memRss / 1024).toFixed(0)} MB` : '—'}
                    </td>
                    <td>
                      <span className={`badge ${p.state === 'running' ? 'badge-success' : p.state === 'sleeping' ? 'badge-info' : 'badge-warning'}`}>
                        {p.state || '—'}
                      </span>
                    </td>
                    <td className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{p.user || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
