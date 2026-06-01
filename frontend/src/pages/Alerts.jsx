import React, { useState, useEffect } from 'react';
import { MdNotifications, MdRefresh, MdCheck, MdDelete, MdCheckCircle } from 'react-icons/md';
import { PageHeader, Skeleton } from '../components/common/UI';
import { useSocket } from '../context/SocketContext';
import { API } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const SEVERITY_CONFIG = {
  critical: { color: 'var(--color-danger)', bg: 'rgba(255,71,87,0.1)', border: 'rgba(255,71,87,0.3)', badge: 'badge-critical' },
  warning: { color: 'var(--color-warning)', bg: 'rgba(255,165,2,0.1)', border: 'rgba(255,165,2,0.3)', badge: 'badge-warning' },
  info: { color: 'var(--color-primary)', bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.3)', badge: 'badge-info' },
};

export default function Alerts() {
  const { alerts: liveAlerts } = useSocket();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [unread, setUnread] = useState(0);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/alerts?limit=100');
      setAlerts(res.data.alerts);
      setUnread(res.data.unreadCount);
    } catch { toast.error('Failed to load alerts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAlerts(); }, []);

  // Merge live alerts
  useEffect(() => {
    if (liveAlerts.length > 0) {
      setAlerts(prev => {
        const ids = new Set(prev.map(a => a._id));
        const newAlerts = liveAlerts.filter(a => !ids.has(a._id));
        return [...newAlerts, ...prev];
      });
    }
  }, [liveAlerts]);

  const acknowledgeAlert = async (id) => {
    try {
      await API.put(`/alerts/${id}/acknowledge`);
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, acknowledged: true } : a));
      setUnread(prev => Math.max(0, prev - 1));
    } catch { toast.error('Failed to acknowledge'); }
  };

  const acknowledgeAll = async () => {
    try {
      await API.put('/alerts/acknowledge-all');
      setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
      setUnread(0);
      toast.success('All alerts acknowledged');
    } catch { toast.error('Failed to acknowledge all'); }
  };

  const deleteAlert = async (id) => {
    try {
      await API.delete(`/alerts/${id}`);
      setAlerts(prev => prev.filter(a => a._id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  const clearAll = async () => {
    if (!confirm('Clear all alerts?')) return;
    try {
      await API.delete('/alerts');
      setAlerts([]);
      setUnread(0);
      toast.success('All alerts cleared');
    } catch { toast.error('Failed to clear alerts'); }
  };

  const filtered = alerts.filter(a => {
    if (filter === 'unread') return !a.acknowledged;
    if (filter === 'critical') return a.severity === 'critical';
    if (filter === 'warning') return a.severity === 'warning';
    return true;
  });

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Alert Center" subtitle={`${unread} unread alerts`} icon={MdNotifications}
        actions={
          <div className="flex gap-2">
            {unread > 0 && <button onClick={acknowledgeAll} className="btn-ghost px-3 py-2 text-sm flex items-center gap-1 text-green-400 border-green-800"><MdCheckCircle size={16} /> Acknowledge All</button>}
            <button onClick={clearAll} className="btn-ghost px-3 py-2 text-sm flex items-center gap-1 text-red-400 border-red-900"><MdDelete size={16} /> Clear All</button>
            <button onClick={fetchAlerts} className="btn-ghost px-3 py-2 text-sm flex items-center gap-1"><MdRefresh size={16} /></button>
          </div>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: `All (${alerts.length})` },
          { key: 'unread', label: `Unread (${unread})` },
          { key: 'critical', label: 'Critical', color: 'var(--color-danger)' },
          { key: 'warning', label: 'Warning', color: 'var(--color-warning)' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-all ${filter === f.key ? 'btn-primary' : 'btn-ghost'}`}
            style={filter === f.key && f.color ? { background: f.color, color: '#000' } : {}}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Alert list */}
      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} style={{ height: 80 }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <MdCheckCircle size={48} className="mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
          <p className="font-semibold" style={{ color: 'var(--color-text)' }}>No alerts</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>System is running normally</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map(alert => {
              const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
              return (
                <motion.div key={alert._id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="card p-4" style={{ borderColor: cfg.border, background: alert.acknowledged ? 'var(--color-surface)' : cfg.bg, opacity: alert.acknowledged ? 0.7 : 1 }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`badge ${cfg.badge}`}>{alert.severity}</span>
                        <span className="badge badge-info text-xs">{alert.type}</span>
                        {!alert.acknowledged && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
                      </div>
                      <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{alert.title}</h3>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{alert.message}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {!alert.acknowledged && (
                        <button onClick={() => acknowledgeAlert(alert._id)} title="Acknowledge"
                          className="w-7 h-7 rounded flex items-center justify-center transition-all hover:bg-green-900/30" style={{ color: 'var(--color-success)' }}>
                          <MdCheck size={16} />
                        </button>
                      )}
                      <button onClick={() => deleteAlert(alert._id)} title="Delete"
                        className="w-7 h-7 rounded flex items-center justify-center transition-all hover:bg-red-900/30" style={{ color: 'var(--color-danger)' }}>
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
