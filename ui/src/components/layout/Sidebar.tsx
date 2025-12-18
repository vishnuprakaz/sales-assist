import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  subItems?: { id: string; label: string }[];
}

interface SidebarProps {
  onExpandChange?: (expanded: boolean) => void;
}

export function Sidebar({ onExpandChange }: SidebarProps) {
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleSubMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const toggleNav = () => {
    const newState = !isNavExpanded;
    setIsNavExpanded(newState);
    onExpandChange?.(newState);
  };

  return (
    <div 
      className="bg-gray-100 flex flex-col py-4 overflow-hidden"
      style={{ 
        width: isNavExpanded ? '200px' : '64px',
        transition: 'width 600ms cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Navigation Items */}
      <div className="flex-1 flex flex-col gap-1 px-2">
        {/* Home Icon - No submenu */}
        <button className={`flex items-center gap-3 py-2 rounded-lg hover:bg-gray-200 transition-colors ${isNavExpanded ? 'px-3' : 'px-0 justify-center'}`}>
          <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {isNavExpanded && <span className="text-sm text-gray-700 whitespace-nowrap">Home</span>}
        </button>

        {/* Leads - With submenu */}
        <div>
          <button 
            className={`w-full flex items-center gap-3 py-2 rounded-lg hover:bg-gray-200 transition-colors ${isNavExpanded ? 'px-3' : 'px-0 justify-center'}`}
            onClick={() => isNavExpanded && toggleSubMenu('leads')}
          >
            <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {isNavExpanded && (
              <>
                <span className="text-sm text-gray-700 whitespace-nowrap flex-1 text-left">Leads</span>
                <ChevronDown 
                  className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${expandedMenus.includes('leads') ? 'rotate-180' : ''}`}
                />
              </>
            )}
          </button>
          
          {/* Submenu items - only show when expanded */}
          {isNavExpanded && expandedMenus.includes('leads') && (
            <div className="ml-8 mt-1 space-y-1 overflow-hidden animate-in slide-in-from-top-2 duration-300">
              <button className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                All Leads
              </button>
              <button className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                Active
              </button>
              <button className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                Pending
              </button>
            </div>
          )}
        </div>

        {/* Analytics - With submenu */}
        <div>
          <button 
            className={`w-full flex items-center gap-3 py-2 rounded-lg hover:bg-gray-200 transition-colors ${isNavExpanded ? 'px-3' : 'px-0 justify-center'}`}
            onClick={() => isNavExpanded && toggleSubMenu('analytics')}
          >
            <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {isNavExpanded && (
              <>
                <span className="text-sm text-gray-700 whitespace-nowrap flex-1 text-left">Analytics</span>
                <ChevronDown 
                  className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${expandedMenus.includes('analytics') ? 'rotate-180' : ''}`}
                />
              </>
            )}
          </button>
          
          {/* Submenu items */}
          {isNavExpanded && expandedMenus.includes('analytics') && (
            <div className="ml-8 mt-1 space-y-1 overflow-hidden animate-in slide-in-from-top-2 duration-300">
              <button className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                Dashboard
              </button>
              <button className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                Reports
              </button>
              <button className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                Insights
              </button>
            </div>
          )}
        </div>

        {/* Settings - No submenu */}
        <button className={`flex items-center gap-3 py-2 rounded-lg hover:bg-gray-200 transition-colors ${isNavExpanded ? 'px-3' : 'px-0 justify-center'}`}>
          <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {isNavExpanded && <span className="text-sm text-gray-700 whitespace-nowrap">Settings</span>}
        </button>
      </div>

      {/* Menu Toggle Button - At Bottom */}
      <div className="px-2 pt-4 border-t border-gray-200 mt-auto">
        <button 
          className={`w-full h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-all duration-300`}
          onClick={toggleNav}
        >
          {isNavExpanded ? (
            // Collapse icon (chevron left)
            <svg className="w-5 h-5 text-gray-600 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            // Expand icon (chevron right)
            <svg className="w-5 h-5 text-gray-600 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

