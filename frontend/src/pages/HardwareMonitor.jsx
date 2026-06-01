import React, { useState, useEffect } from 'react';
import { MdDeviceHub, MdRefresh } from 'react-icons/md';
import { PageHeader, InfoRow, Skeleton } from '../components/common/UI';
import { useSocket } from '../context/SocketContext';
import { API } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function HardwareMonitor() {
  const { systemStats } = useSocket();
  const [hw, setHw] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHardware = async () => {
    setLoading(true);
    try {
      const res = await API.get('/monitor/hardware');
      setHw(res.data);
    } catch { toast.error('Failed to load hardware info'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHardware(); }, []);

  const cpuTemp = systemStats?.cpu?.temperature;
  const tempColor = cpuTemp ? (cpuTemp >= 80 ? 'var(--color-danger)' : cpuTemp >= 60 ? 'var(--color-warning)' : 'var(--color-success)') : 'var(--color-text-muted)';

  if (loading) return (
    <div className="p-6 space-y-4">
      <Skeleton style={{ height: 60, width: 300 }} />
      <div className="grid grid-cols-2 gap-4">{[0,1,2,3].map(i => <Skeleton key={i} style={{ height: 200 }} />)}</div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Hardware Monitor" subtitle="Temperature, GPU, and hardware details" icon={MdDeviceHub}
        actions={<button onClick={fetchHardware} className="btn-ghost px-3 py-2 text-sm flex items-center gap-1"><MdRefresh size={16} /> Refresh</button>}
      />

      {/* Temperature display */}
      <div className="card p-6">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>Temperature Monitor</h3>
        <div className="flex items-center gap-8 flex-wrap">
          <div className="text-center">
            <div className="label mb-2">CPU Temperature</div>
            <div className="font-display text-4xl font-bold" style={{ color: tempColor }}>
              {cpuTemp ? `${cpuTemp.toFixed(1)}°C` : 'Unavailable on Windows'}
            </div>
            {cpuTemp && (
              <div className={`badge mt-2 ${cpuTemp >= 80 ? 'badge-critical' : cpuTemp >= 60 ? 'badge-warning' : 'badge-success'}`}>
                {cpuTemp >= 80 ? '🔴 HOT' : cpuTemp >= 60 ? '🟡 WARM' : '🟢 COOL'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="space-y-3">
              {[
                { label: 'Safe Zone', range: '< 60°C', status: cpuTemp < 60 },
                { label: 'Warm Zone', range: '60–80°C', status: cpuTemp >= 60 && cpuTemp < 80 },
                { label: 'Hot Zone', range: '> 80°C', status: cpuTemp >= 80 },
              ].map(zone => (
                <div key={zone.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${zone.status ? 'animate-pulse' : ''}`}
                    style={{ background: zone.status ? (zone.label === 'Hot Zone' ? 'var(--color-danger)' : zone.label === 'Warm Zone' ? 'var(--color-warning)' : 'var(--color-success)') : 'var(--color-border)' }} />
                  <span className="text-sm" style={{ color: zone.status ? 'var(--color-text)' : 'var(--color-text-muted)' }}>{zone.label}</span>
                  <span className="font-mono text-xs ml-auto" style={{ color: 'var(--color-text-muted)' }}>{zone.range}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CPU */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>Processor</h3>
          <InfoRow label="Model" value={hw?.cpu?.model} />
          <InfoRow label="Socket" value={hw?.cpu?.socket} />
          <InfoRow label="Cores" value={hw?.cpu?.cores} />
          <InfoRow label="Speed" value={hw?.cpu?.speed ? `${hw.cpu.speed} GHz` : null} />
          <InfoRow label="Temperature" value={hw?.cpu?.temperature ? `${hw.cpu.temperature}°C` : 'Unavailable on Windows'} />
        </div>

        {/* GPU */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>Graphics</h3>
          {hw?.gpu?.length > 0 ? hw.gpu.map((g, i) => (
            <div key={i} className="mb-3 pb-3" style={{ borderBottom: i < hw.gpu.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
              <InfoRow label="Model" value={g.model} />
              <InfoRow label="Vendor" value={g.vendor} />
              <InfoRow label="VRAM" value={g.vram ? `${g.vram} MB` : null} />
              <InfoRow label="Driver" value={g.driverVersion} />
            </div>
          )) : (
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No dedicated GPU detected or info unavailable.</p>
          )}
        </div>

        {/* Motherboard */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>Motherboard</h3>
          <InfoRow label="Manufacturer" value={hw?.motherboard?.manufacturer} />
          <InfoRow label="Model" value={hw?.motherboard?.model} />
          <InfoRow label="Version" value={hw?.motherboard?.version} />
        </div>

        {/* Displays */}
        {hw?.displays?.length > 0 && (
          <div className="card p-5">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>Displays</h3>
            {hw.displays.map((d, i) => (
              <div key={i} className="mb-3">
                <InfoRow label="Model" value={d.model || `Display ${i+1}`} />
                <InfoRow label="Resolution" value={d.resolutionX ? `${d.resolutionX}×${d.resolutionY}` : null} />
                <InfoRow label="Refresh Rate" value={d.refreshRate ? `${d.refreshRate} Hz` : null} />
                <InfoRow label="Primary" value={d.main ? 'Yes' : 'No'} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
