import { useAuth } from '@/contexts/auth-context';
import { capitalizeFirst } from '@/lib/auth';
import { Link, useLocation } from 'wouter';
import logoPath from '@assets/og-logo (1)_1756054724582.jpg';

export function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  const navItems = [
    { path: '/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', testId: 'nav-dashboard' },
    { path: '/leads', icon: 'fas fa-users', label: 'Leads', testId: 'nav-leads' },
    { path: '/followups', icon: 'fas fa-calendar-check', label: 'Follow-ups', testId: 'nav-followups' },
    { path: '/installations', icon: 'fas fa-tools', label: 'Installations', testId: 'nav-installations' },
    { path: '/reports', icon: 'fas fa-chart-bar', label: 'Reports', testId: 'nav-reports' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Link href="/dashboard" className="sidebar-brand" data-testid="sidebar-brand">
          <img src={logoPath} alt="Wrap My Kitchen" style={{ width: '32px', height: '32px' }} />
          <div>
            <span className="brand-wrap">wrap</span>
            <span className="brand-kitchen">kitchen</span>
          </div>
        </Link>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div key={item.path} className="sidebar-nav-item">
            <Link 
              href={item.path} 
              className={`sidebar-nav-link ${isActive(item.path) ? 'active' : ''}`}
              data-testid={item.testId}
            >
              <i className={item.icon}></i>
              {item.label}
            </Link>
          </div>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <div className="d-flex align-items-center mb-3">
          <div className="user-avatar me-3">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-fill">
            <div className="text-white fw-medium">
              {user ? capitalizeFirst(user.username) : 'User'}
            </div>
            <div className="text-muted small">
              {user?.role === 'admin' ? 'Administrator' : 'Sales Rep'}
            </div>
          </div>
        </div>
        
        <button 
          className="logout-btn w-100"
          onClick={logout}
          data-testid="logout-button"
        >
          <i className="fas fa-sign-out-alt me-2"></i>
          Logout
        </button>
      </div>
    </div>
  );
}