import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';
import { useAuthStore } from '../stores/authStore';
import { LogOut } from 'lucide-react';

interface AppShellProps {
  activeView: string;
  onViewChange: (view: string) => void;
  children: ReactNode;
}

const AppShell = ({ activeView, onViewChange, children }: AppShellProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-100">
      <Sidebar
        activeView={activeView as any}
        onViewChange={onViewChange}
        isCollapsed={sidebarCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 shrink-0 bg-[#09090b]/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-sm font-medium text-zinc-300 capitalize">{activeView.replace('-', ' ')}</h2>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 font-mono">{user.username}</span>
                <button
                  onClick={logout}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>

      <RightPanel />
    </div>
  );
};

export default AppShell;
