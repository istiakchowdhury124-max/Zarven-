import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Image, 
  Sliders, 
  Settings, 
  Archive, 
  ArrowLeft, 
  ShieldCheck, 
  Menu, 
  X,
  ExternalLink,
  Layers,
  Lock,
  MousePointerClick
} from 'lucide-react';

export type AdminTab = 
  | 'overview'
  | 'products'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'banners'
  | 'customization'
  | 'elements'
  | 'settings'
  | 'releases';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onExitAdmin: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  onExitAdmin,
  children
}) => {
  const { currentUser, isAdmin, isMockAdmin, toggleAdminMockMode } = useAuth();
  const { settings } = useSiteSettings();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products & Catalog', icon: Package },
    { id: 'categories', label: 'Categories & Taxonomy', icon: Layers },
    { id: 'orders', label: 'Orders & Fulfillment', icon: ShoppingBag },
    { id: 'customers', label: 'Client Accounts', icon: Users },
    { id: 'banners', label: 'Advertising Banners', icon: Image },
    { id: 'customization', label: 'Site Customization', icon: Sliders },
    { id: 'elements', label: 'Buttons & Elements Controller', icon: MousePointerClick },
    { id: 'settings', label: 'Store Settings', icon: Settings },
    { id: 'releases', label: 'Source Code & Releases', icon: Archive }
  ];

  return (
    <div className="min-h-screen bg-[#09090c] text-white flex flex-col md:flex-row">
      
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#101017] border-b border-[#20202e]">
        <div className="flex items-center gap-2.5">
          <img 
            src={settings.logoUrl || '/assets/aistudio/1792832789266_1792835490423edit_539d88fb.jpg'} 
            alt="Zarven Emblem" 
            className="w-7 h-7 rounded-full object-cover border border-[#d4af37]/40 shadow-sm"
          />
          <span className="font-serif text-sm font-bold tracking-widest uppercase">Zarven Admin</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 text-[#a1a1aa] hover:text-white"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-[#0e0e14] border-r border-[#1f1f2c] flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-[#1c1c28]">
            <div className="flex items-center gap-3">
              <img 
                src={settings.logoUrl || '/assets/aistudio/1792832789266_1792835490423edit_539d88fb.jpg'} 
                alt="Zarven Official Emblem" 
                className="w-10 h-10 rounded-full object-cover border border-[#d4af37]/50 shadow-md shadow-black/80 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#d4af37] block leading-tight">
                  Control Center
                </span>
                <span className="font-serif text-base font-bold tracking-wider text-white uppercase truncate block">
                  {settings.siteName || 'Zarven'} Studio
                </span>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-[#181822] text-[10px] font-mono text-[#71717a] truncate flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
              <span className="truncate">{currentUser?.email || 'Administrator Session'}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id as AdminTab);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#1b1b26] text-[#d4af37] font-semibold border-l-2 border-[#d4af37]'
                      : 'text-[#a1a1aa] hover:text-white hover:bg-[#14141c]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#d4af37]' : 'text-[#71717a]'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Live Storefront link & Lock Session */}
        <div className="p-4 border-t border-[#1c1c28] space-y-2">
          <button
            onClick={() => {
              sessionStorage.removeItem('zarven_admin_unlocked');
              onExitAdmin();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-950/30 hover:bg-red-900/40 text-xs text-red-300 rounded-xs border border-red-800/40 transition-colors cursor-pointer"
            title="Lock administrative session and return to storefront"
          >
            <Lock className="w-3.5 h-3.5 text-red-400" />
            <span>Lock Session (লক করুন)</span>
          </button>

          <button
            onClick={onExitAdmin}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#161620] hover:bg-[#20202e] text-xs text-[#d4d4d8] rounded-xs border border-[#272738] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Storefront</span>
          </button>
          
          <div className="pt-2 text-[10px] font-mono text-[#71717a] text-center flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-[#d4af37]" />
            <span>Owner Protected</span>
          </div>
        </div>

      </aside>

      {/* Main Content View */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
        {children}
      </main>

    </div>
  );
};
