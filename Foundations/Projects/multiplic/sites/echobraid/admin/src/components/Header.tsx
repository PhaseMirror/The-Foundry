import React, { useState, useRef, useEffect } from 'react';
import { Search, RotateCw, Bell, ShieldAlert, User, Settings, LogOut, PanelRight } from 'lucide-react';

interface HeaderProps {
  currentUser?: any;
  onProfileClick?: () => void;
  onPreferencesClick?: () => void;
  onLogoutClick?: () => void;
  onLoginClick?: () => void;
  isCopilotOpen?: boolean;
  onToggleCopilot?: () => void;
}

export function Header({ 
  currentUser, 
  onProfileClick, 
  onPreferencesClick, 
  onLogoutClick, 
  onLoginClick,
  isCopilotOpen,
  onToggleCopilot
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileButtonClick = () => {
    if (currentUser) {
      setIsProfileOpen(!isProfileOpen);
    } else if (onLoginClick) {
      onLoginClick();
    }
  };

  return (
    <div className="h-12 bg-[#1e1e1e] border-b border-[#333] flex items-center px-4 justify-between select-none relative z-50">
      {/* Left: Branding / Context */}
      <div className="flex items-center space-x-4">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-full" />
          <div className="relative w-full h-full animate-[spin_4s_linear_infinite]">
            <div className="absolute inset-0 rounded-full border border-emerald-500/30 border-t-emerald-500 border-r-transparent border-b-emerald-500/30 border-l-transparent" />
            <div className="absolute inset-[6px] rounded-full border border-purple-500/30 border-t-transparent border-r-purple-500 border-b-transparent border-l-purple-500/30" />
            <div className="absolute top-0 left-1/2 w-1 h-1 bg-emerald-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_5px_#10b981]" />
            <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-purple-500 rounded-full -translate-x-1/2 translate-y-1/2 shadow-[0_0_5px_#8b5cf6]" />
          </div>
          <div className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] z-10" />
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-xl mx-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-gray-500 group-focus-within:text-blue-400" />
          </div>
          <input
            type="text"
            className="block w-full bg-[#252526] border border-[#333] rounded-md py-1.5 pl-9 pr-3 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            placeholder="Search files, symbols, or features (Ctrl+P)"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
            <span className="text-xs text-gray-600 border border-gray-700 rounded px-1.5 py-0.5">⌘K</span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-3">
        <div className="relative" ref={notifRef}>
          <button 
            className="relative p-2 text-gray-400 hover:text-white hover:bg-[#333] rounded-md transition-colors" 
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#1e1e1e]"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#252526] border border-[#333] rounded-md shadow-xl overflow-hidden z-50">
              <div className="px-4 py-2 border-b border-[#333] bg-[#1e1e1e]">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-[#2a2d2e] cursor-pointer border-b border-[#333] flex items-start">
                  <ShieldAlert size={16} className="mr-3 text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm text-red-200 font-medium">Sector 7G Drift</div>
                    <div className="text-xs text-gray-400 mt-1">Structural drift exceeding threshold. Delta: 0.45</div>
                    <div className="text-[10px] text-gray-500 mt-2">10 minutes ago</div>
                  </div>
                </div>
                <div className="px-4 py-3 hover:bg-[#2a2d2e] cursor-pointer flex items-start">
                  <ShieldAlert size={16} className="mr-3 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm text-amber-200 font-medium">Sector 4A Warning</div>
                    <div className="text-xs text-gray-400 mt-1">Minor drift detected. Delta: 0.12</div>
                    <div className="text-[10px] text-gray-500 mt-2">1 hour ago</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-[#333] mx-2" />

        <button 
          className={`p-2 rounded-md transition-colors ${isCopilotOpen ? 'text-blue-400 bg-[#333]' : 'text-gray-400 hover:text-white hover:bg-[#333]'}`}
          onClick={onToggleCopilot}
          title="Toggle Copilot Panel"
        >
          <PanelRight size={16} />
        </button>

        <div className="relative" ref={profileRef}>
          <button 
            className={`p-1.5 rounded-md transition-colors ${isProfileOpen ? 'bg-[#333] text-white' : 'text-gray-400 hover:text-white hover:bg-[#333]'}`}
            onClick={handleProfileButtonClick}
            title={currentUser ? "Account" : "Sign In"}
          >
            {currentUser ? (
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-medium">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <User size={20} strokeWidth={1.5} />
            )}
          </button>

          {isProfileOpen && currentUser && (
            <div className="absolute right-0 mt-2 w-64 bg-[#252526] border border-[#333] rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="p-4 border-b border-[#333] bg-[#2a2d2e]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm text-white font-bold">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{currentUser.name}</div>
                    <div className="text-xs text-gray-400">{currentUser.email}</div>
                  </div>
                </div>
              </div>
              
              <div className="py-1">
                <button 
                  onClick={() => {
                    if (onProfileClick) onProfileClick();
                    setIsProfileOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#333] hover:text-white flex items-center group"
                >
                  <User size={16} className="mr-3 text-gray-500 group-hover:text-white" />
                  Profile
                </button>
                <button 
                  onClick={() => {
                    if (onPreferencesClick) onPreferencesClick();
                    setIsProfileOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#333] hover:text-white flex items-center group"
                >
                  <Settings size={16} className="mr-3 text-gray-500 group-hover:text-white" />
                  Preferences
                </button>
              </div>

              <div className="border-t border-[#333] py-1">
                <button 
                  onClick={() => {
                    if (onLogoutClick) onLogoutClick();
                    setIsProfileOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[#333] flex items-center group"
                >
                  <LogOut size={16} className="mr-3 group-hover:text-red-300" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
