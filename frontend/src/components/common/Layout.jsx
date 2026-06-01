import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdDashboard, MdComputer, MdMemory, MdNetworkCheck, MdStorage,
  MdBatteryChargingFull, MdDeviceHub, MdBarChart, MdNotifications,
  MdTimeline, MdWork, MdSecurity, MdDescription, MdSettings,
  MdPerson, MdChevronLeft, MdChevronRight, MdLogout, MdWifi,
  MdWifiOff, MdMenu
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const navItems = [
  { path: '/dashboard', icon: MdDashboard, label: 'Dashboard' },
  { path: '/system', icon: MdComputer, label: 'System Overview' },
  { path: '/processes', icon: MdMemory, label: 'Process Manager' },
  { path: '/network', icon: MdNetworkCheck, label: 'Network Monitor' },
  { path: '/storage', icon: MdStorage, label: 'Storage Analyzer' },
  { path: '/battery', icon: MdBatteryChargingFull, label: 'Battery Monitor' },
  { path: '/hardware', icon: MdDeviceHub, label: 'Hardware Monitor' },
  { divider: true, label: 'Analytics' },
  { path: '/analytics', icon: MdBarChart, label: 'Analytics' },
  { path: '/alerts', icon: MdNotifications, label: 'Alerts' },
  { path: '/events', icon: MdTimeline, label: 'Event Timeline' },
  { path: '/productivity', icon: MdWork, label: 'Productivity' },
  { path: '/security', icon: MdSecurity, label: 'Security' },
  { path: '/reports', icon: MdDescription, label: 'Reports' },
  { divider: true, label: 'Account' },
  { path: '/settings', icon: MdSettings, label: 'Settings' },
  { path: '/profile', icon: MdPerson, label: 'Profile' },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { connected, systemStats, alerts } = useSocket();
  const navigate = useNavigate();
  const unreadAlerts = alerts.filter(a => !a.acknowledged).length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <motion.aside
        className="sidebar"
        animate={{ width: collapsed ? 64 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--color-border)', height: 64 }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
            <MdSecurity className="text-black text-sm" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="font-display text-sm font-bold" style={{ color: 'var(--color-primary)' }}>SYSTEM</div>
                <div className="font-display text-xs" style={{ color: 'var(--color-text-muted)' }}>SENTINEL</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Connection status */}
        <div className="px-4 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}
            style={{ boxShadow: connected ? '0 0 6px #2ed573' : '0 0 6px #ff4757' }} />
          {!collapsed && (
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {connected ? 'Live' : 'Offline'}
            </span>
          )}
          {!collapsed && systemStats && (
            <span className="text-xs ml-auto font-mono" style={{ color: 'var(--color-primary)' }}>
              CPU {systemStats.cpu?.usage}%
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-2 px-2 overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
          {navItems.map((item, idx) => {
            if (item.divider) {
              return !collapsed ? (
                <div key={idx} className="px-3 py-2 mt-2">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                    {item.label}
                  </span>
                </div>
              ) : <div key={idx} className="my-2 border-t" style={{ borderColor: 'var(--color-border)' }} />;
            }
            const Icon = item.icon;
            const isAlerts = item.path === '/alerts';
            return (
              <NavLink key={item.path} to={item.path}>
                {({ isActive }) => (
                  <div className={`sidebar-item ${isActive ? 'active' : ''}`} title={collapsed ? item.label : ''}>
                    <div className="relative flex-shrink-0">
                      <Icon size={20} />
                      {isAlerts && unreadAlerts > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                          style={{ background: 'var(--color-danger)', color: '#fff', fontSize: '10px' }}>
                          {unreadAlerts > 9 ? '9+' : unreadAlerts}
                        </span>
                      )}
                    </div>
                    {!collapsed && <span className="text-sm">{item.label}</span>}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User + collapse */}
        <div className="border-t p-2" style={{ borderColor: 'var(--color-border)' }}>
          {!collapsed && user && (
            <div className="flex items-center gap-2 px-2 py-1 mb-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', color: '#000' }}>
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>{user.name}</div>
                <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{user.email}</div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-900/20" title="Logout">
            <MdLogout size={18} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className="sidebar-item w-full mt-1" title={collapsed ? 'Expand' : 'Collapse'}>
            {collapsed ? <MdChevronRight size={18} /> : <><MdChevronLeft size={18} /><span className="text-sm">Collapse</span></>}
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <main
        className="flex-1 min-h-screen overflow-auto"
        style={{ marginLeft: collapsed ? 64 : 260, transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)' }}
      >
        <div className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
