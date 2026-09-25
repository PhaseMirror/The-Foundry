import React, { useState } from 'react';
import { Scale, FileText, AlertTriangle, CheckCircle, Users, Edit2, Trash2, Shield, Activity } from 'lucide-react';
import { PrimeLattice } from './PrimeLattice';
import { GlobalActivity } from './GlobalActivity';
import { DissonanceGraph } from './DissonanceGraph';

interface GovernanceProps {
  activeFile?: any;
}

export function Governance({ activeFile }: GovernanceProps) {
  const adrs = [
    { id: '001', title: 'Autonomy vs Governance in L0', status: 'tension', date: '2023-10-12', author: 'Architect-Alpha' },
    { id: '002', title: 'Prime Indexing Strategy', status: 'accepted', date: '2023-10-15', author: 'Architect-Beta' },
    { id: '003', title: 'Recursive Feedback Limits', status: 'draft', date: '2023-10-20', author: 'Architect-Gamma' },
  ];

  const [users, setUsers] = useState([
    { id: '1', name: 'Admin', email: 'info@citizengardens.org', role: 'admin', status: 'active' },
    { id: '2', name: 'Phase Mirror Dev', email: 'dev@phasemirror.io', role: 'user', status: 'active' },
    { id: '3', name: 'Architect-Alpha', email: 'alpha@citizengardens.org', role: 'user', status: 'active' },
  ]);

  if (activeFile?.id === 'lattice') {
    return <PrimeLattice />;
  }

  if (activeFile?.id === 'activity') {
    return <GlobalActivity />;
  }

  if (activeFile?.id === 'dissonance') {
    return (
      <div className="flex-1 bg-[#1e1e1e] flex flex-col">
        <div className="p-6 border-b border-[#333]">
          <h2 className="text-xl font-light text-white mb-2 flex items-center">
            <Activity className="mr-2 text-blue-400" size={24} />
            Dissonance Graph
          </h2>
          <p className="text-gray-400 text-sm">Visualize system tensions and architectural dissonance.</p>
        </div>
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Dissonance Graph</h3>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="filter-primary" defaultChecked className="rounded bg-[#333] border-gray-600" />
                <label htmlFor="filter-primary" className="text-xs text-gray-400">Primary Modules</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="filter-agents" defaultChecked className="rounded bg-[#333] border-gray-600" />
                <label htmlFor="filter-agents" className="text-xs text-gray-400">Agents</label>
              </div>
            </div>
          </div>
          <DissonanceGraph />
        </div>
      </div>
    );
  }

  if (activeFile?.id === 'user_management') {
    return (
      <div className="flex-1 bg-[#1e1e1e] flex flex-col">
        <div className="p-6 border-b border-[#333] flex justify-between items-center">
          <div>
            <h2 className="text-xl font-light text-white mb-2 flex items-center">
              <Shield className="mr-2 text-blue-400" size={24} />
              User Management
            </h2>
            <p className="text-gray-400 text-sm">Manage system users, roles, and permissions.</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Add User
          </button>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-[#252526] border border-[#333] rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#333] text-gray-400">
                <tr>
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-[#2a2d2e] text-gray-300">
                    <td className="p-4">
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-gray-500 text-xs">{user.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs border ${
                        user.role === 'admin' ? 'bg-purple-900/20 border-purple-500/50 text-purple-400' :
                        'bg-blue-900/20 border-blue-500/50 text-blue-400'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded text-xs border bg-green-900/20 border-green-500/50 text-green-400">
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-gray-400 hover:text-white p-1 transition-colors mr-2" title="Edit User">
                        <Edit2 size={16} />
                      </button>
                      <button className="text-gray-400 hover:text-red-400 p-1 transition-colors" title="Delete User">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (activeFile?.id === 'members_list') {
    return (
      <div className="flex-1 bg-[#1e1e1e] flex flex-col">
        <div className="p-6 border-b border-[#333]">
          <h2 className="text-xl font-light text-white mb-2 flex items-center">
            <Users className="mr-2 text-blue-400" size={24} />
            Members List
          </h2>
          <p className="text-gray-400 text-sm">View all active members in the system.</p>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(user => (
              <div key={user.id} className="bg-[#252526] border border-[#333] rounded-lg p-4 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center text-lg text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-white">{user.name}</div>
                  <div className="text-gray-500 text-xs">{user.role === 'admin' ? 'Administrator' : 'Member'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#1e1e1e] flex flex-col">
      <div className="p-6 border-b border-[#333]">
        <h2 className="text-xl font-light text-white mb-2">Governance & Compliance</h2>
        <p className="text-gray-400 text-sm">Active ADRs, L0 Invariants, and Legal Risk Flags.</p>
      </div>

      <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Dissonance Graph</h3>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="filter-primary" defaultChecked className="rounded bg-[#333] border-gray-600" />
                <label htmlFor="filter-primary" className="text-xs text-gray-400">Primary Modules</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="filter-agents" defaultChecked className="rounded bg-[#333] border-gray-600" />
                <label htmlFor="filter-agents" className="text-xs text-gray-400">Agents</label>
              </div>
            </div>
          </div>
          <DissonanceGraph />
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Active Architectural Tensions</h3>
          <div className="space-y-3">
            {adrs.filter(a => a.status === 'tension').map(adr => (
              <div key={adr.id} className="bg-amber-900/10 border border-amber-500/30 p-4 rounded-lg flex items-start">
                <AlertTriangle className="text-amber-500 mt-1 mr-4" size={20} />
                <div>
                  <h4 className="text-white font-medium mb-1">{adr.title}</h4>
                  <p className="text-amber-200/70 text-sm mb-2">Unresolved conflict between Agent Autonomy and L0 Constraints.</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>ADR-{adr.id}</span>
                    <span>{adr.author}</span>
                    <button className="text-blue-400 hover:underline">View Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">ADR Registry</h3>
          <div className="bg-[#252526] border border-[#333] rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#333] text-gray-400">
                <tr>
                  <th className="p-3 font-medium">ID</th>
                  <th className="p-3 font-medium">Title</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Author</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {adrs.map(adr => (
                  <tr key={adr.id} className="hover:bg-[#2a2d2e] text-gray-300">
                    <td className="p-3 font-mono text-xs">{adr.id}</td>
                    <td className="p-3">{adr.title}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs border ${
                        adr.status === 'tension' ? 'bg-amber-900/20 border-amber-500/50 text-amber-400' :
                        adr.status === 'accepted' ? 'bg-green-900/20 border-green-500/50 text-green-400' :
                        'bg-gray-700 border-gray-600 text-gray-300'
                      }`}>
                        {adr.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">{adr.date}</td>
                    <td className="p-3 text-gray-500">{adr.author}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
