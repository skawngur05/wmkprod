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
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-2 z-50 md:hidden mobile-nav-bar ios-padding-fix">
        <div className="flex justify-between items-center">
          {primaryNavItems.map((item: NavItem) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap] || LayoutDashboard;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center justify-center p-1 flex-1 ${
                  isActive(item.path) ? 'text-primary font-medium' : 'text-gray-500'
                }`}
              >
                <IconComponent size={20} />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
          
          {/* Menu button for accessing all navigation items */}
          <button 
            className="flex flex-col items-center justify-center p-1 flex-1 text-gray-500"
            onClick={toggleFullMenu}
          >
            <Menu size={20} />
            <span className="text-xs mt-1">Menu</span>
          </button>
        </div>
      </nav>

      {/* Full Screen Menu Overlay */}
      {showFullMenu && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Menu</h2>
              <button onClick={toggleFullMenu} className="p-2">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 smooth-scroll">
              <div className="grid grid-cols-2 gap-4">
                {coreItems.map((item: NavItem) => {
                  const IconComponent = iconMap[item.icon as keyof typeof iconMap] || LayoutDashboard;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg ${
                        isActive(item.path) 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                      onClick={toggleFullMenu}
                    >
                      <IconComponent size={32} className="mb-2" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              
              {navigation?.admin && navigation.admin.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mt-8 mb-4 text-gray-900">Admin</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {navigation.admin.map((item: NavItem) => {
                      const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Shield;
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          className={`flex flex-col items-center justify-center p-4 rounded-lg ${
                            isActive(item.path) 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                          onClick={toggleFullMenu}
                        >
                          <IconComponent size={32} className="mb-2" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
