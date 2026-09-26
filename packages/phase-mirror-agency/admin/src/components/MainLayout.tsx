import React, { useState } from 'react';
import { ActivityBar } from './ActivityBar';
import { SideBar } from './SideBar';
import { Editor } from './Editor';
import { BottomPanel } from './BottomPanel';
import { StatusBar } from './StatusBar';
import { Header } from './Header';
import { CopilotPanel } from './CopilotPanel';
import { Network } from './views/Network';
import { Projects } from './views/Projects';
import { MCPAgents } from './views/MCPAgents';
import { Governance } from './views/Governance';
import { GlobalChat } from './views/GlobalChat';
import { ACTIVITY_VIEWS, PANEL_VIEWS } from '../constants';
import { LoginModal } from './modals/LoginModal';
import { ProfileModal } from './modals/ProfileModal';
import { PreferencesModal } from './modals/PreferencesModal';
import { AnimatePresence } from 'motion/react';

export function MainLayout() {
  const [activeView, setActiveView] = useState<string>(ACTIVITY_VIEWS.EXPLORER);
  const [activeFile, setActiveFile] = useState<any>(null);
  const [activePanelTab, setActivePanelTab] = useState<string>(PANEL_VIEWS.TERMINAL);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);

  // User State
  const [currentUser, setCurrentUser] = useState<any>({
    name: 'Phase Mirror Dev',
    email: 'dev@phasemirror.io',
    bio: 'Lead Developer on the Phase Mirror project.'
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [userPreferences, setUserPreferences] = useState<any>({});

  // Layout State
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [copilotWidth, setCopilotWidth] = useState(320);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(192);
  const [isDragging, setIsDragging] = useState<'sidebar' | 'copilot' | 'bottom' | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState(true);
  const [activeNetworkTab, setActiveNetworkTab] = useState('registry');

  // Drag Handlers
  const startDragging = (type: 'sidebar' | 'copilot' | 'bottom') => {
    setIsDragging(type);
  };

  const stopDragging = () => {
    setIsDragging(null);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    if (isDragging === 'sidebar') {
      const newWidth = e.clientX - 48; // 48 is ActivityBar width
      if (newWidth > 150 && newWidth < 600) {
        setSidebarWidth(newWidth);
      }
    } else if (isDragging === 'copilot') {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 200 && newWidth < 800) {
        setCopilotWidth(newWidth);
      }
    } else if (isDragging === 'bottom') {
      const newHeight = window.innerHeight - e.clientY - 24; // 24 is StatusBar height
      if (newHeight > 100 && newHeight < 600) {
        setBottomPanelHeight(newHeight);
      }
    }
  };

  const renderMainContent = () => {
    switch (activeView) {
      case ACTIVITY_VIEWS.EXPLORER:
        return <Editor activeFile={activeFile} onCloseFile={() => setActiveFile(null)} />;
      case ACTIVITY_VIEWS.PROJECTS:
        return <Projects />;
      case ACTIVITY_VIEWS.NETWORK:
        return <Network activeTab={activeNetworkTab} />;
      case ACTIVITY_VIEWS.MCP:
        return <MCPAgents />;
      case ACTIVITY_VIEWS.GOVERNANCE:
        return <Governance activeFile={activeFile} />;
      case ACTIVITY_VIEWS.CHAT:
        return <GlobalChat />;
      default:
        return <Editor activeFile={activeFile} onCloseFile={() => setActiveFile(null)} />;
    }
  };

  return (
    <div 
      className={`flex flex-col h-screen bg-[#1e1e1e] text-[#cccccc] overflow-hidden ${isDragging ? 'cursor-col-resize select-none' : ''}`}
      onMouseMove={onMouseMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
    >
      {/* Top Header */}
      <Header 
        currentUser={currentUser}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onProfileClick={() => setIsProfileModalOpen(true)}
        onPreferencesClick={() => setIsPreferencesModalOpen(true)}
        onLogoutClick={() => setCurrentUser(null)}
        isCopilotOpen={isCopilotOpen}
        onToggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Rail */}
        <ActivityBar 
          activeView={activeView} 
          onViewChange={setActiveView} 
        />
        
        {/* Sidebar */}
        {activeView !== ACTIVITY_VIEWS.PROJECTS && (
          <SideBar 
            activeView={activeView} 
            activeNetworkTab={activeNetworkTab}
            onNetworkTabChange={setActiveNetworkTab}
            onFileSelect={(file) => {
              setActiveFile(file);
              if (activeView !== ACTIVITY_VIEWS.EXPLORER && activeView !== ACTIVITY_VIEWS.GOVERNANCE) {
                 setActiveView(ACTIVITY_VIEWS.EXPLORER);
              }
            }} 
            width={sidebarWidth}
            currentUser={currentUser}
          />
        )}

        {/* Sidebar Resizer */}
        {activeView !== ACTIVITY_VIEWS.PROJECTS && (
          <div 
            className="w-1 hover:bg-blue-500 cursor-col-resize hover:z-50 active:bg-blue-600 transition-colors"
            onMouseDown={() => startDragging('sidebar')}
          />
        )}
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 relative border-r border-[#333]">
          {renderMainContent()}
          
          {activeView === ACTIVITY_VIEWS.EXPLORER && isPanelExpanded && (
            <div 
              className="h-1 hover:bg-blue-500 cursor-row-resize hover:z-50 active:bg-blue-600 transition-colors"
              onMouseDown={() => startDragging('bottom')}
            />
          )}

          {activeView === ACTIVITY_VIEWS.EXPLORER && (
            <BottomPanel 
              activeTab={activePanelTab} 
              onTabChange={setActivePanelTab}
              isExpanded={isPanelExpanded}
              onToggleExpand={() => setIsPanelExpanded(!isPanelExpanded)}
              height={bottomPanelHeight}
            />
          )}
        </div>

        {/* Copilot Resizer */}
        {isCopilotOpen && (
          <div 
            className="w-1 hover:bg-blue-500 cursor-col-resize hover:z-50 active:bg-blue-600 transition-colors"
            onMouseDown={() => startDragging('copilot')}
          />
        )}

        {/* Right Panel: Copilot */}
        {isCopilotOpen && (
          <CopilotPanel width={copilotWidth} />
        )}
      </div>
      
      {/* Status Bar */}
      <StatusBar />

      <AnimatePresence>
        {isLoginModalOpen && (
          <LoginModal 
            isOpen={isLoginModalOpen} 
            onClose={() => setIsLoginModalOpen(false)} 
            onLogin={(user) => {
              setCurrentUser(user);
              setIsLoginModalOpen(false);
            }}
          />
        )}
        {isProfileModalOpen && (
          <ProfileModal 
            isOpen={isProfileModalOpen} 
            onClose={() => setIsProfileModalOpen(false)} 
            currentUser={currentUser}
            onSave={(user) => {
              setCurrentUser(user);
              setIsProfileModalOpen(false);
            }}
          />
        )}
        {isPreferencesModalOpen && (
          <PreferencesModal 
            isOpen={isPreferencesModalOpen} 
            onClose={() => setIsPreferencesModalOpen(false)} 
            initialPreferences={userPreferences}
            onSave={(prefs) => {
              setUserPreferences(prefs);
              setIsPreferencesModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
