import { useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  FileText,
  Settings,
  Bell,
  Users,
  ShieldCheck,
  Image as ImageIcon,
  Map,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SessionTimeoutIndicator } from '@/components/admin/SessionTimeoutIndicator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type TabType =
  | 'basvurular'
  | 'formlar'
  | 'guncellemeler'
  | 'bildirimler'
  | 'kurallar'
  | 'galeri'
  | 'canliharita'
  | 'kullanicilar'
  | 'yetkilendirme';

interface AdminLayoutProps {
  children: ReactNode;
  activeTab?: TabType;
}

const sidebarItems = [
  { id: 'basvurular' as TabType, label: 'Başvurular', icon: FileText, path: '/admin?tab=basvurular' },
  { id: 'formlar' as TabType, label: 'Form Şablonları', icon: Settings, path: '/admin?tab=formlar' },
  { id: 'guncellemeler' as TabType, label: 'Güncellemeler', icon: Bell, path: '/admin?tab=guncellemeler' },
  { id: 'bildirimler' as TabType, label: 'Bildirimler', icon: Bell, path: '/admin/notification-editor' },
  { id: 'kurallar' as TabType, label: 'Kurallar', icon: Shield, path: '/admin/rules-editor' },
  { id: 'galeri' as TabType, label: 'Medya Galeri', icon: ImageIcon, path: '/admin/gallery' },
  { id: 'canliharita' as TabType, label: 'Canlı Harita', icon: Map, path: '/admin/whiteboard-editor' },
  { id: 'kullanicilar' as TabType, label: 'Kullanıcılar', icon: Users, path: '/admin?tab=kullanicilar' },
  { id: 'yetkilendirme' as TabType, label: 'Yetki Yönetimi', icon: ShieldCheck, path: '/admin/manage-access' },
];

// Helper to detect active tab from location
const getActiveTabFromPath = (pathname: string, search: string): TabType => {
  if (pathname === '/admin/rules-editor') return 'kurallar';
  if (pathname === '/admin/gallery') return 'galeri';
  if (pathname === '/admin/whiteboard-editor') return 'canliharita';
  if (pathname === '/admin/manage-access') return 'yetkilendirme';
  if (pathname === '/admin/notification-editor') return 'bildirimler';

  // Check query params for main admin tabs
  const params = new URLSearchParams(search);
  const tab = params.get('tab') as TabType | null;
  return tab || 'basvurular';
};

export const AdminLayout = ({ children, activeTab: propActiveTab }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Note: Auth/role/2FA is handled by AdminRouteGuard at route-level (/admin/*).
  const activeTab = propActiveTab || getActiveTabFromPath(location.pathname, location.search);

  const handleTabClick = (item: (typeof sidebarItems)[number]) => {
    navigate(item.path);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside 
        className={`bg-card border-r border-border flex flex-col shrink-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className={`border-b border-border ${isCollapsed ? 'p-3' : 'p-6'}`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <Shield className={`text-primary shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-8 h-8'}`} />
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-lg text-foreground">Admin Panel</h1>
                <p className="text-xs text-muted-foreground">Yönetim Paneli</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="mt-4">
              <SessionTimeoutIndicator />
            </div>
          )}
        </div>

        <nav className={`flex-1 overflow-y-auto ${isCollapsed ? 'p-2' : 'p-4'}`}>
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const buttonContent = (
                <button
                  onClick={() => handleTabClick(item)}
                  className={`w-full flex items-center rounded-lg transition-all duration-200 ${
                    isCollapsed 
                      ? 'justify-center p-3' 
                      : 'gap-3 px-4 py-3'
                  } ${
                    activeTab === item.id
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              );

              if (isCollapsed) {
                return (
                  <li key={item.id}>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        {buttonContent}
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={10}>
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  </li>
                );
              }

              return <li key={item.id}>{buttonContent}</li>;
            })}
          </ul>
        </nav>

        <div className={`border-t border-border ${isCollapsed ? 'p-2' : 'p-4'} space-y-2`}>
          {/* Toggle Button */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size={isCollapsed ? 'icon' : 'default'}
                className={`${isCollapsed ? 'w-full' : 'w-full'}`}
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <PanelLeft className="w-5 h-5" />
                ) : (
                  <>
                    <PanelLeftClose className="w-5 h-5 mr-2" />
                    <span>Menüyü Kapat</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" sideOffset={10}>
                Menüyü Aç
              </TooltipContent>
            )}
          </Tooltip>

          {/* Home Button */}
          {isCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="w-full" onClick={() => navigate('/')}>
                  <Shield className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                Ana Sayfaya Dön
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
              Ana Sayfaya Dön
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};

export default AdminLayout;
