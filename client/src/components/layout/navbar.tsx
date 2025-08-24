import { useAuth } from '@/contexts/auth-context';
import { capitalizeFirst } from '@/lib/auth';
import { Link, useLocation } from 'wouter';

export function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container-fluid">
        <Link href="/dashboard" className="navbar-brand" data-testid="navbar-brand">
          <i className="fas fa-utensils me-2"></i>Wrap My Kitchen CRM
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          data-testid="navbar-toggle"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link 
                href="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                data-testid="nav-dashboard"
              >
                <i className="fas fa-tachometer-alt me-1"></i>Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                href="/leads" 
                className={`nav-link ${isActive('/leads') ? 'active' : ''}`}
                data-testid="nav-leads"
              >
                <i className="fas fa-users me-1"></i>Leads
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                href="/followups" 
                className={`nav-link ${isActive('/followups') ? 'active' : ''}`}
                data-testid="nav-followups"
              >
                <i className="fas fa-calendar-check me-1"></i>Follow-ups
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                href="/installations" 
                className={`nav-link ${isActive('/installations') ? 'active' : ''}`}
                data-testid="nav-installations"
              >
                <i className="fas fa-tools me-1"></i>Installations
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                href="/reports" 
                className={`nav-link ${isActive('/reports') ? 'active' : ''}`}
                data-testid="nav-reports"
              >
                <i className="fas fa-chart-bar me-1"></i>Reports
              </Link>
            </li>
          </ul>
          
          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              <a 
                className="nav-link dropdown-toggle" 
                href="#" 
                id="navbarDropdown" 
                role="button" 
                data-bs-toggle="dropdown"
                data-testid="user-dropdown"
              >
                <i className="fas fa-user-circle me-1"></i>
                {user ? capitalizeFirst(user.username) : 'User'}
              </a>
              <ul className="dropdown-menu">
                <li>
                  <a className="dropdown-item" href="#" data-testid="settings-link">
                    <i className="fas fa-cog me-2"></i>Settings
                  </a>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item" 
                    onClick={logout}
                    data-testid="logout-button"
                  >
                    <i className="fas fa-sign-out-alt me-2"></i>Logout
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
