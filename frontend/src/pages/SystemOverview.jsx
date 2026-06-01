import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdComputer, MdRefresh } from 'react-icons/md';
import { PageHeader, InfoRow, Skeleton, formatUptime } from '../components/common/UI';
import { API } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function SystemOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const [overview, cpu, mem] = await Promise.all([
        API.get('/monitor/overview'),
        API.get('/monitor/cpu'),
        API.get('/monitor/memory'),
      ]);
      setData({ overview: overview.data, cpu: cpu.data, mem: mem.data });
    } catch {
      toast.error('Failed to load system overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  if (loading) return (
    <div className="p-6 space-y-4">
      <Skeleton style={{ height: 60, width: 300 }} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0,1,2,3].map(i => <Skeleton key={i} style={{ height: 200 }} />)}
      </div>
    </div>
  );

  const { overview, cpu, mem } = data || {};

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="System Overview" subtitle="Detailed hardware and OS information"
        icon={MdComputer}
        actions={
          <button onClick={fetch} className="btn-ghost px-3 py-2 text-sm flex items-center gap-2">
            <MdRefresh size={16} /> Refresh
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* OS Info */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
            <span className="w-2 h-4 rounded-sm inline-block" style={{ background: 'var(--color-primary)' }} />
            Operating System
          </h3>
          <div className="space-y-1">
            <InfoRow label="Platform" value={overview?.os?.platform} />
            <InfoRow label="Distribution" value={overview?.os?.distro} />
            <InfoRow label="Version" value={overview?.os?.release} />
            <InfoRow label="Architecture" value={overview?.os?.arch} />
            <InfoRow label="Hostname" value={overview?.os?.hostname} />
            <InfoRow label="Kernel" value={overview?.os?.kernel} />
            <InfoRow label="Uptime" value={formatUptime(overview?.uptime || 0)} />
          </div>
        </div>

        {/* CPU Info */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
            <span className="w-2 h-4 rounded-sm inline-block" style={{ background: 'var(--color-primary)' }} />
            Processor
          </h3>
          <div className="space-y-1">
            <InfoRow label="Model" value={cpu?.model} />
            <InfoRow label="Cores" value={`${cpu?.physicalCores} Physical / ${cpu?.cores} Logical`} />
            <InfoRow label="Base Speed" value={cpu?.speed ? `${cpu.speed} GHz` : 'N/A'} />
            <InfoRow label="Max Speed" value={cpu?.speedMax ? `${cpu.speedMax} GHz` : 'N/A'} />
            <InfoRow label="Usage" value={cpu?.usage !== undefined ? `${cpu.usage}%` : 'N/A'} />
            <InfoRow label="Temperature" value={cpu?.temperature ? `${cpu.temperature}°C` : 'N/A'} />
          </div>
          {/* Core loads */}
          {cpu?.coreLoads?.length > 0 && (
            <div className="mt-4">
              <p className="label mb-2">Core Loads</p>
              <div className="grid grid-cols-4 gap-1">
                {cpu.coreLoads.slice(0, 16).map((load, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xs font-mono mb-1" style={{ color: 'var(--color-text-muted)' }}>C{i}</div>
                    <div className="progress-bar" style={{ height: 4 }}>
                      <div className="progress-fill" style={{
                        width: `${load}%`,
                        background: load > 80 ? 'var(--color-danger)' : 'var(--color-primary)'
                      }} />
                    </div>
                    <div className="text-xs font-mono mt-1" style={{ color: 'var(--color-text)' }}>{load}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Memory Info */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
            <span className="w-2 h-4 rounded-sm inline-block" style={{ background: '#2ed573' }} />
            Memory (RAM)
          </h3>
          <div className="space-y-1">
            <InfoRow label="Total" value={mem?.total ? `${(mem.total / 1073741824).toFixed(1)} GB` : 'N/A'} />
            <InfoRow label="Used" value={mem?.used ? `${(mem.used / 1073741824).toFixed(1)} GB` : 'N/A'} />
            <InfoRow label="Free" value={mem?.free ? `${(mem.free / 1073741824).toFixed(1)} GB` : 'N/A'} />
            <InfoRow label="Available" value={mem?.available ? `${(mem.available / 1073741824).toFixed(1)} GB` : 'N/A'} />
            <InfoRow label="Usage" value={mem?.usagePercent !== undefined ? `${mem.usagePercent}%` : 'N/A'} />
            <InfoRow label="Swap Total" value={mem?.swapTotal ? `${(mem.swapTotal / 1073741824).toFixed(1)} GB` : 'N/A'} />
            <InfoRow label="Swap Used" value={mem?.swapUsed ? `${(mem.swapUsed / 1073741824).toFixed(1)} GB` : 'N/A'} />
          </div>
          {mem?.layout?.length > 0 && (
            <div className="mt-4">
              <p className="label mb-2">Memory Modules</p>
              {mem.layout.map((m, i) => (
                <div key={i} className="text-xs p-2 rounded mb-1" style={{ background: 'var(--color-surface-2)' }}>
                  <span className="font-mono" style={{ color: 'var(--color-text)' }}>
                    {m.size ? `${(m.size / 1073741824).toFixed(0)} GB` : '?'} {m.type} {m.clockSpeed ? `@ ${m.clockSpeed} MHz` : ''}
                  </span>
                  {m.manufacturer && <span className="ml-2" style={{ color: 'var(--color-text-muted)' }}>{m.manufacturer}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System hardware */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
            <span className="w-2 h-4 rounded-sm inline-block" style={{ background: '#ffa502' }} />
            System
          </h3>
          <div className="space-y-1">
            <InfoRow label="Manufacturer" value={overview?.system?.manufacturer} />
            <InfoRow label="Model" value={overview?.system?.model} />
            <InfoRow label="Version" value={overview?.system?.version} />
            <InfoRow label="Serial (last 4)" value={overview?.system?.serial} />
          </div>
        </div>

        {/* BIOS */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
            <span className="w-2 h-4 rounded-sm inline-block" style={{ background: '#bf00ff' }} />
            BIOS
          </h3>
          <div className="space-y-1">
            <InfoRow label="Vendor" value={overview?.bios?.vendor} />
            <InfoRow label="Version" value={overview?.bios?.version} />
            <InfoRow label="Release Date" value={overview?.bios?.releaseDate} />
          </div>
        </div>
      </div>
    </div>
  );
}
