import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Cpu, BarChart2, Wrench, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomNavigation = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Support both single-role string and multi-role array from the backend
  const userRoles = user?.roles || (user?.role ? [user.role] : []);

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['ROLE_HOMEOWNER', 'ROLE_ADMIN', 'ROLE_TECHNICIAN'] },
    { to: '/devices', icon: Cpu, label: 'Devices', roles: ['ROLE_HOMEOWNER', 'ROLE_ADMIN'] },
    { to: '/analytics', icon: BarChart2, label: 'Analytics', roles: ['ROLE_HOMEOWNER', 'ROLE_ADMIN'] },
    { to: '/technician', icon: Wrench, label: 'Technician', roles: ['ROLE_TECHNICIAN', 'ROLE_ADMIN'] },
    { to: '/admin', icon: ShieldCheck, label: 'Admin', roles: ['ROLE_ADMIN'] },
  ].filter(item => item.roles.some(r => userRoles.includes(r)));

  if (navItems.length === 0) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-2 py-2 border-t"
      style={{
        background: 'var(--navbar-bg)',
        borderColor: 'var(--navbar-border)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {navItems.map(({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to;
        return (
          <NavLink
            key={to}
            to={to}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 min-w-0 flex-1"
            style={{
              background: isActive ? 'rgba(16,185,129,0.12)' : 'transparent',
            }}
          >
            <Icon
              size={20}
              style={{ color: isActive ? '#10B981' : 'var(--text-secondary)' }}
            />
            <span
              className="text-xs font-semibold truncate"
              style={{ color: isActive ? '#10B981' : 'var(--text-secondary)' }}
            >
              {label}
            </span>
            {isActive && (
              <div className="absolute bottom-1 w-1 h-1 rounded-full" style={{ background: '#10B981' }} />
            )}
          </NavLink>
        );
      })}
    </div>
  );
};

export default BottomNavigation;
