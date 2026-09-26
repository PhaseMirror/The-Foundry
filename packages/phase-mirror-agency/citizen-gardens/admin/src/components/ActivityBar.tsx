import React from 'react';
import { 
  Files, 
  Globe, 
  Bot, 
  Scale, 
  MessageSquare,
  Briefcase
} from 'lucide-react';
import { ACTIVITY_VIEWS } from '../constants';

interface ActivityBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function ActivityBar({ 
  activeView, 
  onViewChange
}: ActivityBarProps) {
  const items = [
    { id: ACTIVITY_VIEWS.EXPLORER, icon: Files, label: 'Explorer' },
    { id: ACTIVITY_VIEWS.PROJECTS, icon: Briefcase, label: 'Projects' },
    { id: ACTIVITY_VIEWS.CHAT, icon: MessageSquare, label: 'Global Chat' },
    { id: ACTIVITY_VIEWS.MCP, icon: Bot, label: 'MCP Agents' },
    { id: ACTIVITY_VIEWS.GOVERNANCE, icon: Scale, label: 'Governance' },
    { id: ACTIVITY_VIEWS.NETWORK, icon: Globe, label: 'Network' },
  ];

  return (
    <div className="w-12 bg-[#1e1e1e] border-r border-[#333] flex flex-col items-center py-2 select-none z-20 relative">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onViewChange(item.id)}
          className={`p-3 mb-2 rounded-md transition-colors relative group ${
            activeView === item.id 
              ? 'text-white border-l-2 border-blue-500 bg-[#2a2d2e]' 
              : 'text-[#858585] hover:text-white'
          }`}
          title={item.label}
        >
          <item.icon size={24} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}
