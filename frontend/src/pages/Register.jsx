import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdSecurity, MdEmail, MdLock, MdPerson } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to System Sentinel.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)`,
        backgroundSize: '50px 50px', opacity: 0.3
      }} />
      <div className="absolute top-1/3 right-1/3 w-80 h-80 rounded-full blur-3xl opacity-10" style={{ background: 'var(--color-primary)' }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md mx-4">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
              <MdSecurity className="text-black text-3xl" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>CREATE ACCOUNT</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Join System Sentinel Monitoring Platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Full Name', icon: MdPerson, type: 'text', placeholder: 'John Doe' },
              { key: 'email', label: 'Email Address', icon: MdEmail, type: 'email', placeholder: 'your@email.com' },
              { key: 'password', label: 'Password', icon: MdLock, type: 'password', placeholder: '••••••••' },
              { key: 'confirm', label: 'Confirm Password', icon: MdLock, type: 'password', placeholder: '••••••••' },
            ].map(field => {
              const Icon = field.icon;
              return (
                <div key={field.key}>
                  <label className="label block mb-2">{field.label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                    <input type={field.type} className="input-field pl-10" placeholder={field.placeholder}
                      value={form[field.key]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))} />
                  </div>
                </div>
              );
            })}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm font-semibold rounded-lg mt-2"
              style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>Sign In</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
