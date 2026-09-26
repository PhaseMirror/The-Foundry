import React, { useState, useRef } from 'react';
import { ChevronRight, ChevronDown, FileText, Folder, AlertCircle, Activity, ShieldAlert, Bot, Hash, Volume2, Lock, Plus, Upload, Trash2, MoreVertical, MoveRight, Database, Box, Map, Key } from 'lucide-react';
import { MOCK_FILES } from '../constants';

interface SideBarProps {
  activeView: string;
  onFileSelect: (file: any) => void;
  width: number;
  currentUser?: any;
  activeNetworkTab?: string;
  onNetworkTabChange?: (tab: string) => void;
}

const FileTreeItem = ({ item, depth = 0, onSelect, onDelete, onAddFile, onAddFolder, onUpload, onMove }: any) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(item.id, file.name);
    }
    setShowMenu(false);
  };

  return (
    <div>
      <div 
        className="flex items-center py-1 px-2 hover:bg-[#2a2d2e] cursor-pointer text-sm text-[#cccccc] group relative"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => {
          if (item.type === 'folder') setIsOpen(!isOpen);
          else onSelect(item);
        }}
      >
        <span className="mr-1 opacity-70">
          {item.type === 'folder' ? (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <span className="w-3.5 inline-block" />
          )}
        </span>
        <span className="mr-2 opacity-90">
          {item.type === 'folder' ? (
            <Folder size={14} className="text-blue-400" />
          ) : (
            <FileText size={14} className="text-gray-400" />
          )}
        </span>
        <span className="truncate flex-1">{item.name}</span>
        
        {/* Context Menu Trigger */}
        <div 
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#333] rounded ml-auto"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          <MoreVertical size={14} />
        </div>

        {/* Context Menu */}
        {showMenu && (
          <div 
            className="absolute right-2 top-6 bg-[#252526] border border-[#333] rounded shadow-xl z-50 py-1 min-w-[120px]"
            onClick={(e) => e.stopPropagation()}
            onMouseLeave={() => setShowMenu(false)}
          >
            {item.type === 'folder' && (
              <>
                <div 
                  className="px-3 py-1.5 hover:bg-[#007acc] hover:text-white flex items-center text-xs"
                  onClick={() => { onAddFile(item.id); setShowMenu(false); }}
                >
                  <FileText size={12} className="mr-2" /> New File
                </div>
                <div 
                  className="px-3 py-1.5 hover:bg-[#007acc] hover:text-white flex items-center text-xs"
                  onClick={() => { onAddFolder(item.id); setShowMenu(false); }}
                >
                  <Folder size={12} className="mr-2" /> New Folder
                </div>
                <div 
                  className="px-3 py-1.5 hover:bg-[#007acc] hover:text-white flex items-center text-xs"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={12} className="mr-2" /> Upload File
                </div>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} />
                <div className="h-px bg-[#333] my-1" />
              </>
            )}
            <div 
              className="px-3 py-1.5 hover:bg-[#007acc] hover:text-white flex items-center text-xs"
              onClick={() => { onMove(item.id); setShowMenu(false); }}
            >
              <MoveRight size={12} className="mr-2" /> Move
            </div>
            <div 
              className="px-3 py-1.5 hover:bg-red-600 hover:text-white flex items-center text-xs text-red-400"
              onClick={() => { onDelete(item.id); setShowMenu(false); }}
            >
              <Trash2 size={12} className="mr-2" /> Delete
            </div>
          </div>
        )}

        {item.hasTension && !showMenu && (
          <span className="ml-auto text-amber-500" title="Active Tension">
            <AlertCircle size={12} />
          </span>
        )}
      </div>
      {item.type === 'folder' && isOpen && item.children && (
        <div>
          {item.children.map((child: any) => (
            <FileTreeItem 
              key={child.id} 
              item={child} 
              depth={depth + 1} 
              onSelect={onSelect}
              onDelete={onDelete}
              onAddFile={onAddFile}
              onAddFolder={onAddFolder}
              onUpload={onUpload}
              onMove={onMove}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function SideBar({ activeView, onFileSelect, width, currentUser, activeNetworkTab, onNetworkTabChange }: SideBarProps) {
  const [files, setFiles] = useState<any[]>(MOCK_FILES);
  const [hasChanges, setHasChanges] = useState(false);

  const handleDelete = (id: string) => {
    const removeNode = (nodes: any[]): any[] => {
      return nodes.filter(node => {
        if (node.id === id) return false;
        if (node.children) {
          node.children = removeNode(node.children);
        }
        return true;
      });
    };
    setFiles(removeNode([...files]));
    setHasChanges(true);
  };

  const handleAddFile = (parentId: string) => {
    const name = prompt("Enter file name:");
    if (!name) return;
    
    const addNode = (nodes: any[]): any[] => {
      return nodes.map(node => {
        if (node.id === parentId && node.type === 'folder') {
          return {
            ...node,
            children: [...(node.children || []), { id: Date.now().toString(), name, type: 'file', language: 'plaintext' }]
          };
        }
        if (node.children) {
          return { ...node, children: addNode(node.children) };
        }
        return node;
      });
    };
    setFiles(addNode([...files]));
    setHasChanges(true);
  };

  const handleAddFolder = (parentId: string) => {
    const name = prompt("Enter folder name:");
    if (!name) return;
    
    const addNode = (nodes: any[]): any[] => {
      return nodes.map(node => {
        if (node.id === parentId && node.type === 'folder') {
          return {
            ...node,
            children: [...(node.children || []), { id: Date.now().toString(), name, type: 'folder', children: [] }]
          };
        }
        if (node.children) {
          return { ...node, children: addNode(node.children) };
        }
        return node;
      });
    };
    setFiles(addNode([...files]));
    setHasChanges(true);
  };

  const handleUpload = (parentId: string, fileName: string) => {
    const addNode = (nodes: any[]): any[] => {
      return nodes.map(node => {
        if (node.id === parentId && node.type === 'folder') {
          return {
            ...node,
            children: [...(node.children || []), { id: Date.now().toString(), name: fileName, type: 'file', language: 'plaintext' }]
          };
        }
        if (node.children) {
          return { ...node, children: addNode(node.children) };
        }
        return node;
      });
    };
    setFiles(addNode([...files]));
    setHasChanges(true);
  };

  const handleMove = (id: string) => {
    const destName = prompt("Enter destination folder name (leave empty for root):");
    if (destName === null) return;

    let nodeToMove: any = null;

    // First find and remove the node
    const removeNode = (nodes: any[]): any[] => {
      return nodes.filter(node => {
        if (node.id === id) {
          nodeToMove = node;
          return false;
        }
        if (node.children) {
          node.children = removeNode(node.children);
        }
        return true;
      });
    };

    let newFiles = removeNode([...files]);

    if (!nodeToMove) return;

    // Then add it to the new location
    if (destName.trim() === '') {
      newFiles.push(nodeToMove);
    } else {
      let added = false;
      const addNode = (nodes: any[]): any[] => {
        return nodes.map(node => {
          if (node.name === destName && node.type === 'folder') {
            added = true;
            return {
              ...node,
              children: [...(node.children || []), nodeToMove]
            };
          }
          if (node.children) {
            return { ...node, children: addNode(node.children) };
          }
          return node;
        });
      };
      newFiles = addNode(newFiles);
      if (!added) {
        alert(`Folder "${destName}" not found.`);
        return; // Don't update state if folder not found
      }
    }

    setFiles(newFiles);
    setHasChanges(true);
  };

  const handleRootUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles([...files, { id: Date.now().toString(), name: file.name, type: 'file', language: 'plaintext' }]);
      setHasChanges(true);
    }
  };

  const rootFileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div 
      className="bg-[#252526] border-r border-[#333] flex flex-col text-sm flex-shrink-0"
      style={{ width }}
    >
      <div className="h-9 px-4 flex items-center justify-between text-[#bbbbbb] text-xs font-bold uppercase tracking-wider bg-[#252526] border-b border-[#333]">
        <span>{activeView.toUpperCase()}</span>
        {activeView === 'explorer' && (
          <div className="flex items-center space-x-1">
            <button className="p-1 hover:bg-[#333] rounded" onClick={() => {
              const name = prompt("Enter file name:");
              if (name) {
                setFiles([...files, { id: Date.now().toString(), name, type: 'file', language: 'plaintext' }]);
                setHasChanges(true);
              }
            }} title="New File">
              <FileText size={14} />
            </button>
            <button className="p-1 hover:bg-[#333] rounded" onClick={() => {
              const name = prompt("Enter folder name:");
              if (name) {
                setFiles([...files, { id: Date.now().toString(), name, type: 'folder', children: [] }]);
                setHasChanges(true);
              }
            }} title="New Folder">
              <Folder size={14} />
            </button>
            <button className="p-1 hover:bg-[#333] rounded" onClick={() => rootFileInputRef.current?.click()} title="Upload File">
              <Upload size={14} />
            </button>
            <input type="file" ref={rootFileInputRef} className="hidden" onChange={handleRootUpload} />
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {activeView === 'explorer' && (
          <div className="flex flex-col min-h-full">
            <div className="py-2 flex-1">
              {files.map((file) => (
                <FileTreeItem 
                  key={file.id} 
                  item={file} 
                  onSelect={onFileSelect}
                  onDelete={handleDelete}
                  onAddFile={handleAddFile}
                  onAddFolder={handleAddFolder}
                  onUpload={handleUpload}
                  onMove={handleMove}
                />
              ))}
            </div>
            {hasChanges && (
              <div className="p-4 border-t border-[#333] mt-auto sticky bottom-0 bg-[#252526] z-10 flex flex-col space-y-2">
                <button 
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors"
                  onClick={() => setHasChanges(false)}
                >
                  Sync Changes
                </button>
                <button 
                  className="w-full py-1.5 bg-[#333] hover:bg-[#444] text-white rounded text-xs font-medium transition-colors"
                >
                  Preview
                </button>
              </div>
            )}
          </div>
        )}
        
        {activeView === 'projects' && (
          <div className="p-4 text-xs text-gray-500">
            Select a project from the main dashboard to view its details and tasks.
          </div>
        )}
        
        {activeView === 'network' && (
          <div className="p-0">
            <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase mt-2">Network Panels</div>
            <div 
              className={`px-4 py-2 cursor-pointer flex items-center ${activeNetworkTab === 'registry' ? 'bg-[#37373d] text-white' : 'hover:bg-[#2a2d2e] text-[#cccccc]'}`}
              onClick={() => onNetworkTabChange?.('registry')}
            >
              <Database size={14} className="mr-2 text-blue-400" />
              <span>Site Registry</span>
            </div>
            <div 
              className={`px-4 py-2 cursor-pointer flex items-center ${activeNetworkTab === 'import' ? 'bg-[#37373d] text-white' : 'hover:bg-[#2a2d2e] text-[#cccccc]'}`}
              onClick={() => onNetworkTabChange?.('import')}
            >
              <Plus size={14} className="mr-2 text-purple-400" />
              <span>Import / Register</span>
            </div>
            <div 
              className={`px-4 py-2 cursor-pointer flex items-center ${activeNetworkTab === 'webhook' ? 'bg-[#37373d] text-white' : 'hover:bg-[#2a2d2e] text-[#cccccc]'}`}
              onClick={() => onNetworkTabChange?.('webhook')}
            >
              <Key size={14} className="mr-2 text-emerald-400" />
              <span>Webhook Sync</span>
            </div>
            <div 
              className={`px-4 py-2 cursor-pointer flex items-center ${activeNetworkTab === 'build' ? 'bg-[#37373d] text-white' : 'hover:bg-[#2a2d2e] text-[#cccccc]'}`}
              onClick={() => onNetworkTabChange?.('build')}
            >
              <Box size={14} className="mr-2 text-amber-400" />
              <span>Build Status</span>
            </div>
            <div 
              className={`px-4 py-2 cursor-pointer flex items-center ${activeNetworkTab === 'route' ? 'bg-[#37373d] text-white' : 'hover:bg-[#2a2d2e] text-[#cccccc]'}`}
              onClick={() => onNetworkTabChange?.('route')}
            >
              <Map size={14} className="mr-2 text-pink-400" />
              <span>Route Map</span>
            </div>
          </div>
        )}



        {activeView === 'mcp' && (
          <div className="p-0">
            <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase mt-2">Running Processes</div>
            <div className="hover:bg-[#2a2d2e] px-4 py-2 cursor-pointer flex items-center justify-between">
              <div className="flex items-center">
                <Bot size={14} className="mr-2 text-green-400" />
                <span>Agent-01</span>
              </div>
              <span className="text-xs text-green-500">RUNNING</span>
            </div>
            <div className="hover:bg-[#2a2d2e] px-4 py-2 cursor-pointer flex items-center justify-between">
              <div className="flex items-center">
                <Bot size={14} className="mr-2 text-green-400" />
                <span>Agent-02</span>
              </div>
              <span className="text-xs text-green-500">RUNNING</span>
            </div>
            <div className="hover:bg-[#2a2d2e] px-4 py-2 cursor-pointer flex items-center justify-between">
              <div className="flex items-center">
                <Bot size={14} className="mr-2 text-amber-400" />
                <span>Agent-03</span>
              </div>
              <span className="text-xs text-amber-500">WARN</span>
            </div>
          </div>
        )}

        {activeView === 'governance' && (
          <div className="p-0">
            <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase mt-2">Dashboards</div>
            <div 
              className="hover:bg-[#2a2d2e] px-4 py-2 cursor-pointer flex items-center"
              onClick={() => onFileSelect({ type: 'governance_page', id: 'lattice', name: 'Prime Lattice' })}
            >
              <Activity size={14} className="mr-2 text-blue-400" />
              <span>Prime Lattice</span>
            </div>
            <div 
              className="hover:bg-[#2a2d2e] px-4 py-2 cursor-pointer flex items-center"
              onClick={() => onFileSelect({ type: 'governance_page', id: 'activity', name: 'Global Activity' })}
            >
              <Activity size={14} className="mr-2 text-blue-400" />
              <span>Global Activity Log</span>
            </div>
            <div 
              className="hover:bg-[#2a2d2e] px-4 py-2 cursor-pointer flex items-center"
              onClick={() => onFileSelect({ type: 'governance_page', id: 'dissonance', name: 'Dissonance Graph' })}
            >
              <Activity size={14} className="mr-2 text-blue-400" />
              <span>Dissonance Graph</span>
            </div>

            <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase mt-4">Open Tensions</div>
            <div className="hover:bg-[#2a2d2e] px-4 py-2 cursor-pointer flex items-start">
              <AlertCircle size={14} className="mr-2 text-amber-500 mt-0.5" />
              <span>Autonomy vs Gov</span>
            </div>
            
            <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase mt-4">L0 Invariants</div>
            <div className="hover:bg-[#2a2d2e] px-4 py-2 cursor-pointer flex items-center">
              <ShieldAlert size={14} className="mr-2 text-blue-400" />
              <span>Entropy Max</span>
            </div>
            <div className="hover:bg-[#2a2d2e] px-4 py-2 cursor-pointer flex items-center">
              <ShieldAlert size={14} className="mr-2 text-blue-400" />
              <span>Recursion Depth</span>
            </div>
            {currentUser?.role === 'admin' ? (
              <div 
                className="hover:bg-[#2a2d2e] px-4 py-2 cursor-pointer flex items-center"
                onClick={() => onFileSelect({ type: 'governance_page', id: 'user_management', name: 'User Management' })}
              >
                <ShieldAlert size={14} className="mr-2 text-blue-400" />
                <span>User Management</span>
              </div>
            ) : (
              <div 
                className="hover:bg-[#2a2d2e] px-4 py-2 cursor-pointer flex items-center"
                onClick={() => onFileSelect({ type: 'governance_page', id: 'members_list', name: 'Members List' })}
              >
                <ShieldAlert size={14} className="mr-2 text-blue-400" />
                <span>Members List</span>
              </div>
            )}
          </div>
        )}



        {activeView === 'chat' && (
          <div className="p-0">
            <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase mt-2">Text Channels</div>
            <div className="hover:bg-[#2a2d2e] px-4 py-1 cursor-pointer flex items-center text-white bg-[#2a2d2e]">
              <Hash size={14} className="mr-2 text-gray-400" />
              <span>general-dissonance</span>
            </div>
            <div className="hover:bg-[#2a2d2e] px-4 py-1 cursor-pointer flex items-center text-gray-400">
              <Hash size={14} className="mr-2 text-gray-500" />
              <span>ops-alerts</span>
            </div>
            <div className="hover:bg-[#2a2d2e] px-4 py-1 cursor-pointer flex items-center text-gray-400">
              <Hash size={14} className="mr-2 text-gray-500" />
              <span>random</span>
            </div>
            <div className="hover:bg-[#2a2d2e] px-4 py-1 cursor-pointer flex items-center text-gray-400">
              <Lock size={14} className="mr-2 text-gray-500" />
              <span>admin-only</span>
            </div>

            <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase mt-4">Voice Channels</div>
            <div className="hover:bg-[#2a2d2e] px-4 py-1 cursor-pointer flex items-center text-gray-400">
              <Volume2 size={14} className="mr-2 text-gray-500" />
              <span>War Room</span>
            </div>

            <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase mt-4">Online — 4</div>
            <div className="hover:bg-[#2a2d2e] px-4 py-1 cursor-pointer flex items-center opacity-80">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span>Architect-Alpha</span>
            </div>
            <div className="hover:bg-[#2a2d2e] px-4 py-1 cursor-pointer flex items-center opacity-80">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span>DevOps-Lead</span>
            </div>
            <div className="hover:bg-[#2a2d2e] px-4 py-1 cursor-pointer flex items-center opacity-80">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span>Agent-01</span> <span className="ml-1 text-[10px] bg-blue-600 text-white px-1 rounded">BOT</span>
            </div>
            <div className="hover:bg-[#2a2d2e] px-4 py-1 cursor-pointer flex items-center opacity-80">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span>Phase Mirror Dev</span> <span className="ml-1 text-[10px] text-gray-500">(You)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
