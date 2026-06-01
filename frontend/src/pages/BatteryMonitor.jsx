import React, { useState, useEffect } from 'react';
import { MdBatteryChargingFull, MdBattery20, MdBattery50, MdBattery80, MdBatteryFull } from 'react-icons/md';
import { PageHeader } from '../components/common/UI';
import { useSocket } from '../context/SocketContext';

function BatteryIcon({ percent, isCharging }) {
  if (isCharging) return <MdBatteryChargingFull size={80} style={{ color: 'var(--color-success)' }} />;
  if (percent > 80) return <MdBatteryFull size={80} style={{ color: 'var(--color-success)' }} />;
  if (percent > 50) return <MdBattery80 size={80} style={{ color: 'var(--color-primary)' }} />;
  if (percent > 20) return <MdBattery50 size={80} style={{ color: 'var(--color-warning)' }} />;
  return <MdBattery20 size={80} style={{ color: 'var(--color-danger)' }} />;
}

export default function BatteryMonitor() {
  const { systemStats } = useSocket();
  const battery = systemStats?.battery;

  if (!battery) return (
    <div className="p-6">
      <PageHeader title="Battery Monitor" subtitle="Laptop battery information" icon={MdBatteryChargingFull} />
      <div className="card p-12 text-center">
        <p style={{ color: 'var(--color-text-muted)' }}>Loading battery information...</p>
      </div>
    </div>
  );

  if (!battery.hasBattery) return (
    <div className="p-6">
      <PageHeader title="Battery Monitor" subtitle="Laptop battery information" icon={MdBatteryChargingFull} />
      <div className="card p-12 text-center">
        <MdBatteryChargingFull size={64} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
        <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>No Battery Detected</h3>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>This device does not have a battery (desktop computer)</p>
      </div>
    </div>
  );

  const pct = battery.percent || 0;
  const barColor = battery.isCharging ? 'var(--color-success)' : pct > 50 ? 'var(--color-primary)' : pct > 20 ? 'var(--color-warning)' : 'var(--color-danger)';

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Battery Monitor" subtitle="Real-time battery status and health" icon={MdBatteryChargingFull} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main battery display */}
        <div className="card p-8 flex flex-col items-center justify-center gap-4">
          <BatteryIcon percent={pct} isCharging={battery.isCharging} />
          <div className="font-display text-5xl font-bold" style={{ color: barColor }}>{pct}%</div>
          <div className="w-full max-w-xs">
            <div className="progress-bar" style={{ height: 12 }}>
              <div className="progress-fill" style={{ width: `${pct}%`, background: barColor, transition: 'width 1s ease' }} />
            </div>
          </div>
          <span className={`badge text-sm px-4 py-1 ${battery.isCharging ? 'badge-success' : pct < 20 ? 'badge-critical' : 'badge-info'}`}>
            {battery.isCharging ? '⚡ Charging' : 'On Battery'}
          </span>
        </div>

        {/* Details */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>Battery Details</h3>
          <div className="space-y-4">
            {[
              { label: 'Charge Level', value: `${pct}%`, color: barColor },
              { label: 'Status', value: battery.isCharging ? 'Charging' : 'Discharging', color: battery.isCharging ? 'var(--color-success)' : 'var(--color-text)' },
              { label: 'Time Remaining', value: battery.timeRemaining && battery.timeRemaining > 0 ? `~${Math.floor(battery.timeRemaining / 60)}h ${battery.timeRemaining % 60}m` : battery.isCharging ? 'Charging...' : 'N/A' },
            ].map(d => (
              <div key={d.label} className="flex justify-between items-center py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{d.label}</span>
                <span className="font-mono font-semibold" style={{ color: d.color || 'var(--color-text)' }}>{d.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
            <h4 className="label mb-3">Tips</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {pct < 20 && <li className="text-red-400">⚠️ Low battery — connect charger soon</li>}
              {pct > 95 && battery.isCharging && <li className="text-yellow-400">💡 Consider unplugging at 100%</li>}
              <li>🔋 Keep battery between 20-80% for best health</li>
              <li>❄️ Avoid extreme temperatures for longevity</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
