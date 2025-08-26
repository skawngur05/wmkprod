import { useAuth } from '@/contexts/auth-context';
import { capitalizeFirst } from '@/lib/auth';
import { Link, useLocation } from 'wouter';
import logoPath from '@assets/wmk-wh_1756056124487.png';

export function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  const navItems = (user?.role === 'admin' || user?.role === 'administrator') ? [
    { path: '/admin', icon: 'fas fa-shield-alt', label: 'Admin Dashboard', testId: 'nav-admin-dashboard' },
    { path: '/admin/users', icon: 'fas fa-users-cog', label: 'User Management', testId: 'nav-admin-users' },
    { path: '/admin/installers', icon: 'fas fa-user-cog', label: 'Installers', testId: 'nav-admin-installers' },
    { path: '/admin/lead-origins', icon: 'fas fa-globe', label: 'Lead Origins', testId: 'nav-admin-lead-origins' },
    { path: '/admin/email-templates', icon: 'fas fa-mail-bulk', label: 'Email Templates', testId: 'nav-admin-email-templates' },
    { path: '/admin/smtp-settings', icon: 'fas fa-server', label: 'SMTP Settings', testId: 'nav-admin-smtp' },
    { path: '/admin/activity', icon: 'fas fa-history', label: 'Activity Log', testId: 'nav-admin-activity' },
    { path: '/leads', icon: 'fas fa-users', label: 'View Leads', testId: 'nav-leads' },
    { path: '/reports', icon: 'fas fa-chart-bar', label: 'Reports', testId: 'nav-reports' },
  ] : [
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
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-fill">
            <div className="fw-medium" style={{ color: 'var(--wmk-black)' }}>
              {user ? capitalizeFirst(user.username) : 'User'}
            </div>
            <div className="small" style={{ color: 'var(--wmk-gray)' }}>
              {(user?.role === 'admin' || user?.role === 'administrator') ? 'Administrator' : 
               user?.role === 'owner' ? 'Owner' :
               user?.role === 'manager' ? 'Manager' :
               user?.role === 'installer' ? 'Installer' : 'Sales Rep'}
            </div>
          </div>
        </div>
        
        <button 
          className="logout-btn w-100"
          onClick={() => {
            console.log('Logout clicked');
            if (logout) {
              logout();
            } else {
              window.location.href = '/login';
            }
          }}
          data-testid="logout-button"
          style={{ 
            background: 'var(--danger-red)', 
            color: 'white', 
            border: '2px solid var(--danger-red)',
            padding: '12px',
            borderRadius: '8px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <i className="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>
    </div>
  );
}