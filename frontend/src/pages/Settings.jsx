import React, { useState } from 'react';
import { MdSettings, MdSave, MdPalette } from 'react-icons/md';
import { PageHeader } from '../components/common/UI';
import { useAuth, API } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const THEMES = [
  { id: 'dark', name: 'Dark Monitor', desc: 'Default dark blue theme', preview: '#00d4ff' },
  { id: 'cyber', name: 'Cyber Purple', desc: 'Cyberpunk purple aesthetic', preview: '#bf00ff' },
  { id: 'hacker', name: 'Hacker Green', desc: 'Classic terminal green', preview: '#00ff41' },
  { id: 'light', name: 'Light Mode', desc: 'Clean light interface', preview: '#0066cc' },
];

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [thresholds, setThresholds] = useState(user?.settings?.alertThresholds || { cpu: 90, ram: 85, disk: 95, temperature: 80, battery: 20 });
  const [refreshRate, setRefreshRate] = useState(user?.settings?.refreshRate || 1000);
  const [saving, setSaving] = useState(false);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await API.put('/users/settings', {
        settings: { theme, refreshRate, alertThresholds: thresholds, notifications: true }
      });
      updateUser(res.data.user);
      toast.success('Settings saved');
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Settings" subtitle="Configure your monitoring preferences" icon={MdSettings}
        actions={<button onClick={saveSettings} disabled={saving} className="btn-primary px-4 py-2 text-sm flex items-center gap-2"><MdSave size={16} />{saving ? 'Saving...' : 'Save Settings'}</button>}
      />

      {/* Theme */}
      <div className="card p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
          <MdPalette size={18} /> Appearance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {THEMES.map(t => (
            <button key={t.id} onClick={() => setTheme(t.id)}
              className="card p-4 text-left transition-all"
              style={{ borderColor: theme === t.id ? t.preview : 'var(--color-border)', boxShadow: theme === t.id ? `0 0 15px ${t.preview}40` : 'none' }}>
              <div className="w-8 h-8 rounded-lg mb-2" style={{ background: t.preview }} />
              <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{t.name}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{t.desc}</div>
              {theme === t.id && <div className="text-xs mt-1" style={{ color: t.preview }}>✓ Active</div>}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="card p-5">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>Alert Thresholds</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { key: 'cpu', label: 'CPU Usage (%)', icon: '🖥', max: 100 },
            { key: 'ram', label: 'RAM Usage (%)', icon: '💾', max: 100 },
            { key: 'disk', label: 'Disk Usage (%)', icon: '💿', max: 100 },
            { key: 'temperature', label: 'CPU Temperature (°C)', icon: '🌡', max: 120 },
            { key: 'battery', label: 'Battery Level (%)', icon: '🔋', max: 100 },
          ].map(field => (
            <div key={field.key}>
              <label className="label block mb-2">{field.icon} {field.label}</label>
              <div className="flex items-center gap-3">
                <input type="range" min={0} max={field.max} value={thresholds[field.key]}
                  onChange={e => setThresholds(p => ({ ...p, [field.key]: Number(e.target.value) }))}
                  className="flex-1" style={{ accentColor: 'var(--color-primary)' }} />
                <span className="font-mono font-bold w-12 text-right" style={{ color: 'var(--color-primary)' }}>{thresholds[field.key]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Refresh Rate */}
      <div className="card p-5">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>Data Refresh Rate</h3>
        <div className="flex gap-3 flex-wrap">
          {[500, 1000, 2000, 5000].map(rate => (
            <button key={rate} onClick={() => setRefreshRate(rate)}
              className={`px-4 py-2 text-sm rounded-lg transition-all ${refreshRate === rate ? 'btn-primary' : 'btn-ghost'}`}>
              {rate < 1000 ? `${rate}ms` : `${rate/1000}s`}
            </button>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--color-text-muted)' }}>Real-time Socket.IO data always updates every second regardless of this setting.</p>
      </div>
    </div>
  );
}
