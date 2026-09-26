import React, { useState } from 'react';
import { 
  Server, 
  Activity, 
  GitBranch, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Edit,
  Play,
  Trash2,
  Github
} from 'lucide-react';

interface NetworkProps {
  activeTab?: string;
}

export function Network({ activeTab = 'registry' }: NetworkProps) {
  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300">
      {/* Global Header & Status Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#333] bg-[#252526]">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-white flex items-center">
            <Server className="mr-2 text-blue-400" />
            Multiplic Dashboard
          </h1>
          <div className="h-6 w-px bg-[#444] mx-2"></div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-[#1e1e1e] px-2 py-1 rounded border border-[#333]">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-xs font-mono">Express :3000</span>
            </div>
            <div className="flex items-center bg-[#1e1e1e] px-2 py-1 rounded border border-[#333]">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-xs font-mono">Sync :9001</span>
            </div>
            <div className="flex items-center bg-[#1e1e1e] px-2 py-1 rounded border border-[#333]">
              <GitBranch size={12} className="text-gray-400 mr-2" />
              <span className="text-xs font-mono text-blue-400">a1b2c3d</span>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-[#333] rounded-md transition-colors text-gray-400 hover:text-white">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'registry' && <SiteRegistryPanel />}
        {activeTab === 'import' && <ImportRegisterPanel />}
        {activeTab === 'webhook' && <WebhookSyncPanel />}
        {activeTab === 'build' && <BuildStatusPanel />}
        {activeTab === 'route' && <RouteMapPanel />}
      </div>
    </div>
  );
}

function SiteRegistryPanel() {
  const sites = [
    { key: 'citizengardens.org', root: 'sites/citizengardens.org', framework: 'react', dist: true, desc: 'Main landing page' },
    { key: 'citizengardens.org/lambdaproof', root: 'sites/lambdaproof', framework: 'react', dist: true, desc: 'Interactive narrative site' },
    { key: 'admin.citizengardens.org', root: 'sites/admin', framework: 'react', dist: false, desc: 'Admin dashboard' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white mb-4">Site Registry (multiplic.json)</h2>
      <div className="bg-[#252526] border border-[#333] rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1e1e1e] border-b border-[#333] text-gray-400">
            <tr>
              <th className="px-4 py-3 font-medium">Site Key</th>
              <th className="px-4 py-3 font-medium">Root Path</th>
              <th className="px-4 py-3 font-medium">Framework</th>
              <th className="px-4 py-3 font-medium">dist/ Status</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333]">
            {sites.map((site, i) => (
              <tr key={i} className="hover:bg-[#2a2d2e] transition-colors">
                <td className="px-4 py-3 font-mono text-blue-400">{site.key}</td>
                <td className="px-4 py-3 font-mono text-gray-400">{site.root}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-[#333] rounded text-xs">{site.framework}</span>
                </td>
                <td className="px-4 py-3">
                  {site.dist ? (
                    <CheckCircle2 size={16} className="text-green-500" />
                  ) : (
                    <span title="Missing dist/ folder">
                      <AlertCircle size={16} className="text-red-500" />
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 truncate max-w-[200px]">{site.desc}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#333] rounded" title="Edit">
                      <Edit size={14} />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-[#333] rounded" title="Trigger Build">
                      <Play size={14} />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-[#333] rounded" title="Remove">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ImportRegisterPanel() {
  const [mode, setMode] = useState('manual');

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-lg font-semibold text-white">Import / Register Site</h2>
      
      <div className="flex bg-[#252526] p-1 rounded-lg border border-[#333] w-fit">
        <button 
          className={`px-4 py-1.5 text-sm rounded-md transition-colors ${mode === 'manual' ? 'bg-[#333] text-white' : 'text-gray-400 hover:text-gray-200'}`}
          onClick={() => setMode('manual')}
        >
          Manual Entry
        </button>
        <button 
          className={`px-4 py-1.5 text-sm rounded-md transition-colors flex items-center ${mode === 'github' ? 'bg-[#333] text-white' : 'text-gray-400 hover:text-gray-200'}`}
          onClick={() => setMode('github')}
        >
          <Github size={14} className="mr-2" />
          GitHub Repo Import
        </button>
      </div>

      <div className="bg-[#252526] p-6 rounded-lg border border-[#333] space-y-4">
        {mode === 'manual' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Site Key</label>
              <input type="text" placeholder="domain.tld or domain.tld/subpath" className="w-full bg-[#1e1e1e] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Root Path</label>
              <input type="text" placeholder="sites/slugified-key" className="w-full bg-[#1e1e1e] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Framework</label>
              <select className="w-full bg-[#1e1e1e] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                <option value="react">React</option>
                <option value="angular">Angular</option>
                <option value="vue">Vue</option>
                <option value="static">Static HTML</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
              <textarea rows={3} className="w-full bg-[#1e1e1e] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"></textarea>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Repo URL</label>
              <input type="text" placeholder="MultiplicityFoundation/CG-Website" className="w-full bg-[#1e1e1e] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Target Subdirectory</label>
              <input type="text" placeholder="sites/citizengardens.org" className="w-full bg-[#1e1e1e] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Branch</label>
              <input type="text" defaultValue="main" className="w-full bg-[#1e1e1e] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div className="p-4 bg-[#1e1e1e] border border-[#333] rounded-md mt-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Dry Run Preview</h3>
              <pre className="text-xs font-mono text-gray-300 overflow-x-auto">
{`{
  "citizengardens.org": {
    "root": "sites/citizengardens.org",
    "framework": "react"
  }
}`}
              </pre>
            </div>
          </>
        )}
        
        <div className="pt-4 border-t border-[#333] flex justify-end">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-colors">
            Validate & Register
          </button>
        </div>
      </div>
    </div>
  );
}

function WebhookSyncPanel() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Webhook / Sync Config</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-[#252526] p-6 rounded-lg border border-[#333]">
            <h3 className="text-sm font-medium text-white mb-4">Endpoint Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Webhook Endpoint URL</label>
                <div className="flex">
                  <input type="text" readOnly value="https://your-server.com/sync" className="flex-1 bg-[#1e1e1e] border border-[#333] rounded-l-md px-3 py-2 text-sm text-gray-300 font-mono" />
                  <button className="px-3 py-2 bg-[#333] hover:bg-[#444] border border-l-0 border-[#333] rounded-r-md text-sm text-white transition-colors">Copy</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">SYNC_SECRET Manager</label>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-[#1e1e1e] border border-[#333] rounded-md px-3 py-2 text-sm text-gray-300 font-mono flex items-center">
                    <span className="text-gray-500 mr-2">••••••••••••••••</span>
                    <span>a8f2</span>
                  </div>
                  <button className="px-4 py-2 bg-[#333] hover:bg-[#444] border border-[#333] rounded-md text-sm text-white transition-colors">Rotate</button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Remember to update the GitHub repo secret (SYNC_SECRET) after rotating.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#252526] p-6 rounded-lg border border-[#333]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white">Rate Limit Monitor</h3>
              <span className="text-xs text-gray-400">10 req/min limit</span>
            </div>
            <div className="h-24 flex items-end space-x-1">
              {/* Mock sparkline */}
              {[2, 4, 1, 6, 3, 8, 2, 1, 4, 5, 2, 1, 3, 2, 1, 4, 9, 2, 1, 3].map((val, i) => (
                <div key={i} className={`flex-1 rounded-t-sm ${val >= 8 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ height: `${val * 10}%` }}></div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#252526] rounded-lg border border-[#333] flex flex-col h-[500px]">
          <div className="p-4 border-b border-[#333] bg-[#1e1e1e] rounded-t-lg">
            <h3 className="text-sm font-medium text-white">Sync Log Feed</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2">
            <div className="p-2 rounded bg-[#1e1e1e] border border-[#333]">
              <div className="flex justify-between text-gray-500 mb-1">
                <span>2026-03-15 14:30:22</span>
                <span>IP: 192.168.1.105</span>
              </div>
              <div className="flex items-center text-green-400 mb-1">
                <CheckCircle2 size={12} className="mr-1" /> HMAC Validation Pass
              </div>
              <div className="text-gray-300">git pull origin main -- success</div>
            </div>
            <div className="p-2 rounded bg-[#1e1e1e] border border-[#333]">
              <div className="flex justify-between text-gray-500 mb-1">
                <span>2026-03-15 14:15:05</span>
                <span>IP: 10.0.0.42</span>
              </div>
              <div className="flex items-center text-red-400 mb-1">
                <XCircle size={12} className="mr-1" /> HMAC Validation Fail
              </div>
              <div className="text-gray-500">Invalid signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BuildStatusPanel() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Build Status & Dist Inspector</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#252526] p-6 rounded-lg border border-[#333]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-md font-medium text-white">citizengardens.org</h3>
              <p className="text-xs text-gray-400 mt-1">Last built: 10 mins ago (45s duration)</p>
            </div>
            <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors flex items-center">
              <Play size={12} className="mr-1" /> Trigger Build
            </button>
          </div>
          
          <div className="bg-[#1e1e1e] p-3 rounded border border-[#333] font-mono text-xs text-gray-300 mt-4">
            <div className="flex items-center text-gray-400 mb-2">
              <FolderIcon /> dist/
            </div>
            <div className="pl-4 space-y-1">
              <div className="flex items-center"><FileIcon /> index.html</div>
              <div className="flex items-center text-gray-400"><FolderIcon /> assets/</div>
              <div className="pl-4 space-y-1">
                <div className="flex items-center"><FileIcon /> index-a1b2c3d.js</div>
                <div className="flex items-center"><FileIcon /> style-x9y8z7.css</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-[#333]">
            <a href="#" className="text-xs text-blue-400 hover:text-blue-300 flex items-center">
              <Github size={12} className="mr-1" /> View CI Pipeline Run
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteMapPanel() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Route Map</h2>
      
      <div className="bg-[#252526] p-6 rounded-lg border border-[#333] min-h-[400px] flex items-center justify-center">
        <div className="font-mono text-sm text-gray-300 bg-[#1e1e1e] p-6 rounded-lg border border-[#333] shadow-lg">
          <div className="text-blue-400 font-bold mb-4">Browser → Nginx :80 → Node :3000</div>
          <div className="pl-4 border-l-2 border-[#444] space-y-4">
            <div>
              <div className="flex items-center text-gray-400 mb-1">
                <span className="mr-2">└─</span> multiplic.json lookup (hostname / subpath)
              </div>
              
              <div className="pl-8 space-y-3 mt-3">
                <div className="bg-[#2a2d2e] p-3 rounded border border-[#444] cursor-pointer hover:border-blue-500 transition-colors">
                  <div className="font-bold text-white">citizengardens.org</div>
                  <div className="text-xs text-gray-500 mt-1">sites/citizengardens.org/dist</div>
                  
                  <div className="pl-4 mt-2 border-l border-[#444]">
                    <div className="bg-[#333] p-2 rounded border border-[#555] cursor-pointer hover:border-blue-500 transition-colors">
                      <div className="font-bold text-gray-200">/lambdaproof</div>
                      <div className="text-xs text-gray-500 mt-1">sites/lambdaproof/dist</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#2a2d2e] p-3 rounded border border-[#444] cursor-pointer hover:border-blue-500 transition-colors">
                  <div className="font-bold text-white">admin.citizengardens.org</div>
                  <div className="text-xs text-gray-500 mt-1">sites/admin/dist</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-[#444]">
              <div className="flex items-center text-gray-400">
                <span className="mr-2">└─</span> sites/&lt;folder&gt;/dist (static + SPA fallback)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple icons for the file tree
const FolderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 text-blue-400"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
);

const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 text-gray-400"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
);
