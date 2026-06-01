import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MdDeveloperBoard, MdMemory, MdStorage, MdNetworkCheck, MdBatteryChargingFull, MdTimer, MdComputer } from 'react-icons/md';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { MetricCard, GaugeChart, PageHeader, formatBytes, formatUptime, Skeleton } from '../components/common/UI';
import { API } from '../context/AuthContext';

const MAX_HISTORY = 60;

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-mono" style={{ color: p.color }}>{p.name}: {p.value?.toFixed(1)}%</p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { systemStats, connected } = useSocket();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [osInfo, setOsInfo] = useState(null);
  const [time, setTime] = useState(new Date());
  const historyRef = useRef([]);

  useEffect(() => {
    API.get('/monitor/stats').then(r => {
      setOsInfo(r.data.os);
      setLoading(false);
    }).catch(() => setLoading(false));

    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (systemStats) {
      const point = {
        time: new Date().toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        cpu: systemStats.cpu?.usage || 0,
        mem: systemStats.memory?.usagePercent || 0,
        net: Math.round(((systemStats.network?.rx_sec || 0) + (systemStats.network?.tx_sec || 0)) / 1024)
      };
      historyRef.current = [...historyRef.current, point].slice(-MAX_HISTORY);
      setHistory([...historyRef.current]);
    }
  }, [systemStats]);

  const stats = systemStats;

  if (loading && !stats) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton style={{ height: 60, width: '100%', maxWidth: 400 }} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <Skeleton key={i} style={{ height: 140 }} />)}
        </div>
        <Skeleton style={{ height: 300 }} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            SYSTEM DASHBOARD
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Welcome back, {user?.name} • {osInfo?.hostname || 'Loading...'}
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {time.toLocaleTimeString()}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {time.toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-1 justify-end mt-1">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}
              style={{ boxShadow: connected ? '0 0 6px #2ed573' : '' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {connected ? 'Live' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Gauges */}
      <div className="card p-6">
        <div className="flex items-center justify-around flex-wrap gap-6">
          <GaugeChart value={stats?.cpu?.usage} label="CPU Usage" size={150} />
          <GaugeChart value={stats?.memory?.usagePercent} label="Memory Usage" size={150} />
          <GaugeChart value={stats?.disk?.[0]?.usePercent} label="Disk Usage" size={150} />
          {stats?.battery?.hasBattery && (
            <GaugeChart value={stats?.battery?.percent} label="Battery" size={150} unit="%" />
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="CPU Usage" value={stats?.cpu?.usage} icon={MdDeveloperBoard}
          subtitle={`Temp: ${stats?.cpu?.temperature ? stats.cpu.temperature + '°C' : 'N/A'}`} />
        <MetricCard title="Memory" value={stats?.memory?.usagePercent} icon={MdMemory}
          subtitle={`${formatBytes(stats?.memory?.used)} / ${formatBytes(stats?.memory?.total)}`} />
        <MetricCard title="Disk" value={stats?.disk?.[0]?.usePercent} icon={MdStorage}
          subtitle={`${formatBytes(stats?.disk?.[0]?.used)} / ${formatBytes(stats?.disk?.[0]?.size)}`} />
        <MetricCard title="Network ↓" value={Math.round((stats?.network?.rx_sec || 0) / 1024)}
          unit="KB/s" icon={MdNetworkCheck}
          subtitle={`↑ ${Math.round((stats?.network?.tx_sec || 0) / 1024)} KB/s`} color="var(--color-success)" />
      </div>

      {/* Live Chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Performance History (Last 60s)</h2>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1"><div className="w-3 h-1 rounded" style={{ background: 'var(--color-primary)' }} /> CPU</span>
            <span className="flex items-center gap-1"><div className="w-3 h-1 rounded" style={{ background: '#2ed573' }} /> Memory</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2ed573" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2ed573" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} tickCount={6} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="cpu" stroke="var(--color-primary)" fill="url(#cpuGrad)"
              strokeWidth={2} name="CPU" dot={false} isAnimationActive={false} />
            <Area type="monotone" dataKey="mem" stroke="#2ed573" fill="url(#memGrad)"
              strokeWidth={2} name="Memory" dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* System Info */}
        <div className="card p-4">
          <h3 className="label mb-3">System Info</h3>
          <div className="space-y-2 text-sm">
            {[
              ['OS', osInfo?.distro || osInfo?.platform],
              ['Version', osInfo?.release],
              ['Architecture', osInfo?.arch],
              ['Hostname', osInfo?.hostname],
              ['Uptime', formatUptime(osInfo?.uptime || 0)]
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span style={{ color: 'var(--color-text-muted)' }}>{k}</span>
                <span className="font-mono text-xs" style={{ color: 'var(--color-text)' }}>{v || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Network */}
        <div className="card p-4">
          <h3 className="label mb-3">Network Activity</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: 'var(--color-text-muted)' }}>Download</span>
                <span className="font-mono text-xs" style={{ color: 'var(--color-success)' }}>
                  ↓ {formatBytes(stats?.network?.rx_sec || 0)}/s
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(100, (stats?.network?.rx_sec || 0) / 10485760 * 100)}%`, background: 'var(--color-success)' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: 'var(--color-text-muted)' }}>Upload</span>
                <span className="font-mono text-xs" style={{ color: 'var(--color-primary)' }}>
                  ↑ {formatBytes(stats?.network?.tx_sec || 0)}/s
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(100, (stats?.network?.tx_sec || 0) / 10485760 * 100)}%`, background: 'var(--color-primary)' }} />
              </div>
            </div>
            <div className="text-xs pt-2" style={{ color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)' }}>
              <div className="flex justify-between">
                <span>Total RX</span><span className="font-mono">{formatBytes(stats?.network?.rx_bytes || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total TX</span><span className="font-mono">{formatBytes(stats?.network?.tx_bytes || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Battery / Storage quick */}
        <div className="card p-4">
          <h3 className="label mb-3">Storage & Battery</h3>
          {stats?.disk?.slice(0, 3).map((d, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: 'var(--color-text-muted)' }}>{d.mount}</span>
                <span style={{ color: d.usePercent > 90 ? 'var(--color-danger)' : 'var(--color-text)' }}>{d.usePercent}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{
                  width: `${d.usePercent}%`,
                  background: d.usePercent > 90 ? 'var(--color-danger)' : d.usePercent > 75 ? 'var(--color-warning)' : 'var(--color-primary)'
                }} />
              </div>
            </div>
          ))}
          {stats?.battery?.hasBattery && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--color-text-muted)' }}>Battery</span>
                <span style={{ color: stats.battery.isCharging ? 'var(--color-success)' : 'var(--color-text)' }}>
                  {stats.battery.percent}% {stats.battery.isCharging ? '⚡' : ''}
                </span>
              </div>
              <div className="progress-bar mt-1">
                <div className="progress-fill" style={{
                  width: `${stats.battery.percent}%`,
                  background: stats.battery.percent < 20 ? 'var(--color-danger)' : stats.battery.isCharging ? 'var(--color-success)' : 'var(--color-primary)'
                }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
