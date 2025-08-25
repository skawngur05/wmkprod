import { useAuth } from '@/contexts/auth-context';
import { capitalizeFirst } from '@/lib/auth';
import { Link, useLocation } from 'wouter';
import logoPath from '@assets/wmk-wh_1756056124487.png';

export function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  const navItems = [
    { path: '/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', testId: 'nav-dashboard' },
    { path: '/leads', icon: 'fas fa-users', label: 'Leads', testId: 'nav-leads' },
    { path: '/add-lead', icon: 'fas fa-user-plus', label: 'Add Lead', testId: 'nav-add-lead' },
    { path: '/followups', icon: 'fas fa-calendar-check', label: 'Follow-ups', testId: 'nav-followups' },
    { path: '/sample-booklets', icon: 'fas fa-book', label: 'Sample Booklets', testId: 'nav-sample-booklets' },
    { path: '/installations', icon: 'fas fa-tools', label: 'Installations', testId: 'nav-installations' },
    { path: '/reports', icon: 'fas fa-chart-bar', label: 'Reports', testId: 'nav-reports' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Link href="/dashboard" className="sidebar-brand" data-testid="sidebar-brand">
          <img src={logoPath} alt="Kitchen Logo" style={{ height: '60px', width: 'auto' }} />
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
            <div className="fw-medium" style={{ color: 'var(--wmk-black)' }}>
              {user ? capitalizeFirst(user.username) : 'User'}
            </div>
            <div className="small" style={{ color: 'var(--wmk-gray)' }}>
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