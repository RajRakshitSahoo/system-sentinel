import React from 'react';
import { motion } from 'framer-motion';

// ─── MetricCard ──────────────────────────────────────
export function MetricCard({ title, value, unit = '%', icon: Icon, color = 'var(--color-primary)', subtitle, trend }) {
  const getColor = (v) => {
    if (v >= 90) return 'var(--color-danger)';
    if (v >= 70) return 'var(--color-warning)';
    return color;
  };

  const displayColor = typeof value === 'number' ? getColor(value) : color;

  return (
    <motion.div className="card p-5 flex flex-col gap-3" whileHover={{ scale: 1.01 }}>
      <div className="flex items-center justify-between">
        <span className="label">{title}</span>
        {Icon && (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: `${displayColor}20` }}>
            <Icon size={18} style={{ color: displayColor }} />
          </div>
        )}
      </div>
      <div className="flex items-end gap-1">
        <span className="metric-value" style={{ color: displayColor, fontFamily: "'Orbitron', sans-serif" }}>
          {typeof value === 'number' ? value.toFixed(0) : value ?? '--'}
        </span>
        {unit && <span className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>{unit}</span>}
      </div>
      {typeof value === 'number' && (
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, value)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ background: `linear-gradient(90deg, ${displayColor}aa, ${displayColor})` }}
          />
        </div>
      )}
      {subtitle && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</p>}
    </motion.div>
  );
}

// ─── GaugeChart ──────────────────────────────────────
export function GaugeChart({ value = 0, size = 120, label, unit = '%' }) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius;
  const offset = circumference * (1 - clampedValue / 100);

  const getColor = (v) => {
    if (v >= 90) return '#ff4757';
    if (v >= 70) return '#ffa502';
    return 'var(--color-primary)';
  };
  const color = getColor(clampedValue);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg width={size} height={size / 2 + 20} style={{ overflow: 'visible' }}>
          {/* Background arc */}
          <path
            d={`M ${10} ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
            fill="none"
            stroke="var(--color-surface-2)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d={`M ${10} ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s' }}
          />
          {/* Center value */}
          <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fontSize="20"
            fontFamily="'Orbitron', sans-serif" fontWeight="700" fill={color}>
            {clampedValue.toFixed(0)}
          </text>
          <text x={size / 2} y={size / 2 + 18} textAnchor="middle" fontSize="10"
            fill="var(--color-text-muted)">{unit}</text>
        </svg>
      </div>
      {label && <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</span>}
    </div>
  );
}

// ─── PageHeader ──────────────────────────────────────
export function PageHeader({ title, subtitle, icon: Icon, actions }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
            <Icon className="text-black text-xl" />
          </div>
        )}
        <div>
          <h1 className="font-display text-xl font-bold" style={{ color: 'var(--color-text)' }}>{title}</h1>
          {subtitle && <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────
export function Skeleton({ className = '', style = {} }) {
  return <div className={`skeleton ${className}`} style={style} />;
}

// ─── StatusDot ──────────────────────────────────────
export function StatusDot({ status }) {
  const colors = { online: '#2ed573', offline: '#ff4757', warning: '#ffa502', idle: '#ffa502' };
  return (
    <div className="w-2 h-2 rounded-full" style={{
      background: colors[status] || '#888',
      boxShadow: `0 0 6px ${colors[status] || '#888'}`
    }} />
  );
}

// ─── InfoRow ──────────────────────────────────────
export function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span className="text-sm font-mono font-medium" style={{ color: 'var(--color-text)' }}>{value ?? 'N/A'}</span>
    </div>
  );
}

// ─── formatBytes ──────────────────────────────────────
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
