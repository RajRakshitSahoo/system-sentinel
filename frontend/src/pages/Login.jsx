import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdSecurity, MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* Background grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)`,
        backgroundSize: '50px 50px', opacity: 0.3
      }} />
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: 'var(--color-primary)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: 'var(--color-accent)' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="card p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
              <MdSecurity className="text-black text-3xl" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>SYSTEM SENTINEL</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Real-Time System Monitoring Platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label block mb-2">Email Address</label>
              <div className="relative">
                <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="email"
                  className="input-field pl-10"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <label className="label block mb-2">Password</label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }}>
                  {showPw ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-sm font-semibold rounded-lg mt-2"
              style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              New to System Sentinel?{' '}
              <Link to="/register" className="font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>
                Create Account
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-3 rounded-lg text-xs" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
            <strong style={{ color: 'var(--color-text)' }}>Demo:</strong> Create a new account to get started
          </div>
        </div>
      </motion.div>
    </div>
  );
}
