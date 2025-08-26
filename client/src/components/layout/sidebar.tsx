import { useAuth } from '@/contexts/auth-context';
import { capitalizeFirst } from '@/lib/auth';
import { Link, useLocation } from 'wouter';
import logoPath from '@assets/wmk-wh_1756056124487.png';
import { getNavigationItems } from '@/lib/permissions';
import { 
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  BookOpen,
  Wrench,
  BarChart3,
  Shield,
  UserCog,
  Globe,
  Mail,
  Server,
  History,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

// Map FontAwesome classes to Lucide icons
const iconMap = {
  'fas fa-tachometer-alt': LayoutDashboard,
  'fas fa-users': Users,
  'fas fa-user-plus': UserPlus,
  'fas fa-calendar-check': Calendar,
  'fas fa-book': BookOpen,
  'fas fa-tools': Wrench,
  'fas fa-chart-bar': BarChart3,
  'fas fa-shield-alt': Shield,
  'fas fa-users-cog': UserCog,
  'fas fa-user-cog': UserCog,
  'fas fa-globe': Globe,
  'fas fa-mail-bulk': Mail,
  'fas fa-server': Server,
  'fas fa-history': History,
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path: string) => location === path;

  // Get navigation items based on user permissions
  const navigation = getNavigationItems(user);
  const coreItems = navigation?.core || [];
  const adminItems = navigation?.admin || [];

  return (
    <div className={`modern-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header-modern">
        <Link href="/dashboard" className="sidebar-brand-modern" data-testid="sidebar-brand">
          <div className="brand-logo">
            <img src={logoPath} alt="Kitchen Logo" className="logo-image" />
          </div>
          {!isCollapsed && (
            <div className="brand-text">
              <h2 className="brand-title">WrapMyKitchen</h2>
              <p className="brand-subtitle">CRM</p>
            </div>
          )}
        </Link>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="collapse-toggle"
          data-testid="sidebar-toggle"
        >
          <ChevronRight className={`transform transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav-modern">
        <div className="nav-section">
          {!isCollapsed && <div className="nav-section-title">Main</div>}
          {coreItems.map((item: any) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap] || LayoutDashboard;
            return (
              <Link 
                key={item.path}
                href={item.path} 
                className={`nav-item-modern ${isActive(item.path) ? 'active' : ''}`}
                data-testid={item.testId}
              >
                <div className="nav-item-content">
                  <IconComponent className="nav-icon" size={20} />
                  {!isCollapsed && <span className="nav-label">{item.label}</span>}
                  {isActive(item.path) && <div className="active-indicator" />}
                </div>
              </Link>
            );
          })}
        </div>

        {adminItems.length > 0 && (
          <div className="nav-section">
            {!isCollapsed && <div className="nav-section-title">Administration</div>}
            {adminItems.map((item: any) => {
              const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Shield;
              return (
                <Link 
                  key={item.path}
                  href={item.path} 
                  className={`nav-item-modern ${isActive(item.path) ? 'active' : ''}`}
                  data-testid={item.testId}
                >
                  <div className="nav-item-content">
                    <IconComponent className="nav-icon" size={20} />
                    {!isCollapsed && <span className="nav-label">{item.label}</span>}
                    {isActive(item.path) && <div className="active-indicator" />}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer-modern">
        <div className="user-profile">
          <div className="user-avatar-modern">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <div className="user-info">
              <div className="user-name">
                {user ? capitalizeFirst(user.username) : 'User'}
              </div>
              <div className="user-role">
                {(user?.role === 'admin' || user?.role === 'administrator') ? 'Administrator' : 
                 user?.role === 'owner' ? 'Owner' :
                 user?.role === 'manager' ? 'Manager' :
                 user?.role === 'installer' ? 'Installer' : 'Sales Rep'}
              </div>
            </div>
          )}
        </div>
        
        <button 
          className="logout-btn-modern"
          onClick={() => {
            console.log('Logout clicked');
            if (logout) {
              logout();
            } else {
              window.location.href = '/login';
            }
          }}
          data-testid="logout-button"
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}