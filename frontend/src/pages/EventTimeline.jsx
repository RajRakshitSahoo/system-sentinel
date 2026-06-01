// EventTimeline.jsx
import React, { useState, useEffect } from 'react';
import { MdTimeline, MdRefresh, MdDelete } from 'react-icons/md';
import { PageHeader, Skeleton } from '../components/common/UI';
import { API } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TYPE_COLORS = {
  system: 'var(--color-primary)', network: '#2ed573', storage: 'var(--color-warning)',
  security: 'var(--color-danger)', hardware: 'var(--color-accent)', user: '#bf00ff'
};

export function EventTimeline() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchEvents = async () => {
    setLoading(true);
    try { const res = await API.get('/events?limit=100'); setEvents(res.data.events); }
    catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const clearEvents = async () => {
    if (!confirm('Clear all events?')) return;
    await API.delete('/events'); setEvents([]); toast.success('Events cleared');
  };

  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter);

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Event Timeline" subtitle="System events chronological log" icon={MdTimeline}
        actions={<div className="flex gap-2">
          <button onClick={clearEvents} className="btn-ghost px-3 py-2 text-sm text-red-400"><MdDelete size={16} /></button>
          <button onClick={fetchEvents} className="btn-ghost px-3 py-2 text-sm"><MdRefresh size={16} /></button>
        </div>}
      />
      <div className="flex gap-2 flex-wrap">
        {['all', 'system', 'network', 'storage', 'security', 'hardware', 'user'].map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1.5 text-xs rounded-lg capitalize transition-all ${filter === t ? 'btn-primary' : 'btn-ghost'}`}>{t}</button>
        ))}
      </div>
      {loading ? <div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} style={{ height: 70 }} />)}</div>
        : filtered.length === 0 ? (
          <div className="card p-12 text-center" style={{ color: 'var(--color-text-muted)' }}>No events recorded yet</div>
        ) : (
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px" style={{ background: 'var(--color-border)' }} />
            <div className="space-y-1">
              {filtered.map((e, i) => {
                const color = TYPE_COLORS[e.type] || 'var(--color-primary)';
                return (
                  <div key={e._id || i} className="flex gap-4 pl-4 pb-4">
                    <div className="w-5 h-5 rounded-full flex-shrink-0 mt-1 flex items-center justify-center border-2" style={{ borderColor: color, background: 'var(--color-bg)', boxShadow: `0 0 8px ${color}` }}>
                      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    </div>
                    <div className="card flex-1 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge" style={{ background: `${color}20`, color, borderColor: `${color}40` }}>{e.type}</span>
                        <span className={`badge ${e.severity === 'critical' ? 'badge-critical' : e.severity === 'warning' ? 'badge-warning' : 'badge-info'}`}>{e.severity}</span>
                      </div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{e.event}</p>
                      {e.description && <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{e.description}</p>}
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{new Date(e.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </div>
  );
}

export default EventTimeline;
