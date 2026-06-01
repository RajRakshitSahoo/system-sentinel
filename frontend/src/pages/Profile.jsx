import React, { useState } from 'react';
import { MdPerson, MdSave, MdLock } from 'react-icons/md';
import { PageHeader } from '../components/common/UI';
import { useAuth, API } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [changingPw, setChangingPw] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await API.put('/users/profile', { name });
      updateUser(res.data.user);
      toast.success('Profile updated');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (!pwForm.current || !pwForm.newPw) return toast.error('Fill all fields');
    if (pwForm.newPw !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPw.length < 6) return toast.error('Password must be at least 6 characters');
    setChangingPw(true);
    try {
      await API.put('/users/password', { currentPassword: pwForm.current, newPassword: pwForm.newPw });
      toast.success('Password changed successfully');
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally { setChangingPw(false); }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Profile" subtitle="Manage your account information" icon={MdPerson} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile card */}
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold"
              style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', color: '#000' }}>
              {getInitials(user?.name)}
            </div>
            <div>
              <h3 className="font-bold text-xl" style={{ color: 'var(--color-text)' }}>{user?.name}</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{user?.email}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label block mb-2">Display Name</label>
              <input className="input-field" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="label block mb-2">Email Address</label>
              <input className="input-field" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Email cannot be changed</p>
            </div>
            <button onClick={saveProfile} disabled={saving} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
              <MdSave size={16} />{saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
            <MdLock size={18} /> Change Password
          </h3>
          <div className="space-y-4">
            {[
              { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
              { key: 'newPw', label: 'New Password', placeholder: 'At least 6 characters' },
              { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
            ].map(f => (
              <div key={f.key}>
                <label className="label block mb-2">{f.label}</label>
                <input type="password" className="input-field" placeholder={f.placeholder}
                  value={pwForm[f.key]} onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <button onClick={changePassword} disabled={changingPw} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
              <MdLock size={16} />{changingPw ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>

        {/* Account Stats */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>Account Info</h3>
          <div className="space-y-2">
            {[
              ['Role', user?.role?.toUpperCase()],
              ['Account Status', user?.isActive ? 'Active' : 'Inactive'],
              ['Last Login', user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'],
              ['Theme', user?.settings?.theme || 'dark'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{k}</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
