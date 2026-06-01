import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MdNetworkCheck, MdRefresh } from 'react-icons/md';
import { PageHeader, InfoRow, formatBytes, Skeleton } from '../components/common/UI';
import { useSocket } from '../context/SocketContext';
import { API } from '../context/AuthContext';
import toast from 'react-hot-toast';

const MAX_PTS = 60;

export default function NetworkMonitor() {
  const { systemStats } = useSocket();
  const [networkInfo, setNetworkInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const histRef = useRef([]);

  useEffect(() => {
    API.get('/monitor/network').then(r => setNetworkInfo(r.data)).catch(() => toast.error('Failed to load network info')).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (systemStats?.network) {
      const n = systemStats.network;
      const pt = {
        time: new Date().toLocaleTimeString('en', { hour12: false }),
        rx: Math.round((n.rx_sec || 0) / 1024),
        tx: Math.round((n.tx_sec || 0) / 1024),
      };
      histRef.current = [...histRef.current, pt].slice(-MAX_PTS);
      setHistory([...histRef.current]);
    }
  }, [systemStats]);

  const net = systemStats?.network;

  if (loading && !net) return (
    <div className="p-6 space-y-4">
      <Skeleton style={{ height: 60, width: 300 }} />
      <Skeleton style={{ height: 300 }} />
      <div className="grid grid-cols-2 gap-4">{[0,1].map(i => <Skeleton key={i} style={{ height: 200 }} />)}</div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Network Monitor" subtitle="Live traffic and connection details" icon={MdNetworkCheck}
        actions={
          <button onClick={() => API.get('/monitor/network').then(r => setNetworkInfo(r.data))} className="btn-ghost px-3 py-2 text-sm flex items-center gap-1">
            <MdRefresh size={16} /> Refresh
          </button>
        }
      />

      {/* Live Speed Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Download Speed', value: formatBytes(net?.rx_sec || 0) + '/s', color: 'var(--color-success)' },
          { label: 'Upload Speed', value: formatBytes(net?.tx_sec || 0) + '/s', color: 'var(--color-primary)' },
          { label: 'Total Downloaded', value: formatBytes(net?.rx_bytes || 0), color: 'var(--color-success)' },
          { label: 'Total Uploaded', value: formatBytes(net?.tx_bytes || 0), color: 'var(--color-primary)' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className="label mb-2">{s.label}</div>
            <div className="font-mono font-bold text-lg" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Live Traffic Chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Live Traffic (KB/s)</h2>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1"><div className="w-3 h-1 rounded" style={{ background: 'var(--color-success)' }} /> Download</span>
            <span className="flex items-center gap-1"><div className="w-3 h-1 rounded" style={{ background: 'var(--color-primary)' }} /> Upload</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="rxGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2ed573" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2ed573" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} tickCount={8} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
            <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="rx" stroke="#2ed573" fill="url(#rxGrad)" strokeWidth={2} name="↓ KB/s" dot={false} isAnimationActive={false} />
            <Area type="monotone" dataKey="tx" stroke="var(--color-primary)" fill="url(#txGrad)" strokeWidth={2} name="↑ KB/s" dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Interfaces */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>Network Interfaces</h3>
          {networkInfo?.interfaces?.map((iface, i) => (
            <div key={i} className="p-3 rounded-lg mb-2" style={{ background: 'var(--color-surface-2)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{iface.name}</span>
                <span className={`badge ${iface.operstate === 'up' ? 'badge-success' : 'badge-warning'}`}>{iface.operstate}</span>
              </div>
              <div className="space-y-1 text-xs">
                <InfoRow label="IPv4" value={iface.ip4 || '—'} />
                <InfoRow label="MAC" value={iface.mac} />
                <InfoRow label="Type" value={iface.type} />
                {iface.speed && <InfoRow label="Speed" value={`${iface.speed} Mbps`} />}
              </div>
            </div>
          ))}
        </div>

        {/* Connections */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>Active Connections</h3>
          <div className="space-y-1">
            <InfoRow label="Total Connections" value={networkInfo?.connections?.total} />
            <InfoRow label="Established" value={networkInfo?.connections?.established} />
            <InfoRow label="Listening" value={networkInfo?.connections?.listening} />
            <InfoRow label="Default Interface" value={networkInfo?.defaultInterface} />
          </div>
          {networkInfo?.stats?.map((s, i) => (
            <div key={i} className="mt-3 p-3 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
              <div className="font-mono text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>{s.interface}</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>RX Errors: </span>
                  <span style={{ color: 'var(--color-text)' }}>{s.rx_errors}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>TX Errors: </span>
                  <span style={{ color: 'var(--color-text)' }}>{s.tx_errors}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
