import React from 'react';
import { useLocation, Link } from 'wouter';
import { useMobile } from '@/contexts/mobile-context';
import { useAuth } from '@/contexts/auth-context';
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
  Menu,
  X
} from 'lucide-react';

interface NavItem {
  path: string;
  icon: string;
  label: string;
  testId: string;
  permission: string;
}

interface Navigation {
  core: NavItem[];
  admin?: NavItem[];
}

const iconMap = {
  'fas fa-tachometer-alt': LayoutDashboard,
  'fas fa-users': Users,
  'fas fa-user-plus': UserPlus,
  'fas fa-calendar-check': Calendar,
  'fas fa-calendar-alt': Calendar,
  'fas fa-book': BookOpen,
  'fas fa-tools': Wrench,
  'fas fa-chart-bar': BarChart3,
  'fas fa-shield-alt': Shield,
};

export function MobileNavigation() {
  const { isBottomNavVisible } = useMobile();
  const [location] = useLocation();
  const { user } = useAuth();
  const [showFullMenu, setShowFullMenu] = React.useState(false);

  const isActive = (path: string) => location === path;
  
  // Get navigation items based on user permissions
  const navigation = getNavigationItems(user) as Navigation;
  const coreItems = navigation?.core || [];
  
  // For mobile, we only show the most important items in the bottom nav
  // Get the first 3 core items and add calendar as the 4th
  const primaryNavItems = [...coreItems.slice(0, 3), {
    path: '/calendar',
    icon: 'fas fa-calendar-alt',
    label: 'Calendar',
    testId: 'nav-calendar',
    permission: 'dashboard' // Calendar uses same permission as dashboard
  }];
  
  const toggleFullMenu = () => {
    setShowFullMenu(!showFullMenu);
    // Prevent scrolling when full menu is open
    document.body.style.overflow = !showFullMenu ? 'hidden' : '';
  };

  if (!isBottomNavVisible) return null;

  return (
    <>
      {/* Bottom Navigation Bar - Always visible on mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-2 px-1 z-50 md:hidden safe-area-bottom shadow-lg">
        <div className="flex justify-around items-center max-w-screen-sm mx-auto">
          {primaryNavItems.map((item: NavItem) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap] || LayoutDashboard;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center justify-center px-2 py-1 min-w-[60px] min-h-[44px] transition-colors ${
                  isActive(item.path) 
                    ? 'text-primary dark:text-primary-light font-semibold' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                data-testid={`mobile-nav-${item.path.slice(1)}`}
              >
                <IconComponent size={22} className="mb-1" />
                <span className="text-[10px] leading-tight text-center">{item.label}</span>
              </Link>
            );
          })}
          
          {/* Menu button for accessing all navigation items */}
          <button 
            className="flex flex-col items-center justify-center px-2 py-1 min-w-[60px] min-h-[44px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            onClick={toggleFullMenu}
            data-testid="mobile-nav-menu"
          >
            <Menu size={22} className="mb-1" />
            <span className="text-[10px] leading-tight">Menu</span>
          </button>
        </div>
      </nav>

      {/* Full Screen Menu Overlay */}
      {showFullMenu && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 md:hidden animate-fade-in">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Menu</h2>
              <button 
                onClick={toggleFullMenu} 
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                data-testid="mobile-menu-close"
              >
                <X size={24} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 pb-safe">
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                {coreItems.map((item: NavItem) => {
                  const IconComponent = iconMap[item.icon as keyof typeof iconMap] || LayoutDashboard;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                        isActive(item.path) 
                          ? 'bg-primary/10 dark:bg-primary/20 text-primary shadow-sm scale-105' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:shadow-md active:scale-95'
                      }`}
                      onClick={toggleFullMenu}
                      data-testid={`mobile-menu-${item.path.slice(1)}`}
                    >
                      <IconComponent size={32} className="mb-2" />
                      <span className="text-sm font-medium text-center">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              
              {navigation?.admin && navigation.admin.length > 0 && (
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100">Admin</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {navigation.admin.map((item: NavItem) => {
                      const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Shield;
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                            isActive(item.path) 
                              ? 'bg-primary/10 dark:bg-primary/20 text-primary shadow-sm scale-105' 
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:shadow-md active:scale-95'
                          }`}
                          onClick={toggleFullMenu}
                          data-testid={`mobile-menu-admin-${item.path.split('/').pop()}`}
                        >
                          <IconComponent size={32} className="mb-2" />
                          <span className="text-sm font-medium text-center">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
