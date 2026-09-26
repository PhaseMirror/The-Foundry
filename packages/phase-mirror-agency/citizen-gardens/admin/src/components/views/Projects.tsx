import React, { useState } from 'react';
import { Briefcase, Plus, MoreVertical, Search, Filter, Users, Calendar, CheckCircle2, Clock } from 'lucide-react';

export function Projects() {
  const [projects] = useState([
    { id: 1, name: 'Phase Mirror Core', status: 'active', progress: 75, members: 4, dueDate: '2026-04-15', description: 'Core engine development and invariant enforcement.' },
    { id: 2, name: 'Multiplic Dashboard', status: 'active', progress: 90, members: 2, dueDate: '2026-03-20', description: 'Admin interface for multi-site management.' },
    { id: 3, name: 'Citizen Gardens Landing', status: 'completed', progress: 100, members: 3, dueDate: '2026-02-28', description: 'Public facing narrative site.' },
    { id: 4, name: 'Lambda Proof Integration', status: 'planning', progress: 10, members: 5, dueDate: '2026-05-01', description: 'Zero-knowledge proof verification layer.' },
  ]);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#333] bg-[#252526]">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-white flex items-center">
            <Briefcase className="mr-2 text-blue-400" />
            Project Management
          </h1>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-colors">
          <Plus size={16} className="mr-2" />
          New Project
        </button>
      </div>

      <div className="p-6 border-b border-[#333] flex items-center justify-between bg-[#1e1e1e]">
        <div className="relative w-64">
          <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search projects..." className="w-full bg-[#252526] border border-[#333] rounded-md pl-9 pr-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500" />
        </div>
        <button className="flex items-center px-3 py-1.5 bg-[#252526] border border-[#333] hover:bg-[#333] text-gray-300 rounded-md text-sm transition-colors">
          <Filter size={14} className="mr-2" />
          Filter
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="bg-[#252526] border border-[#333] rounded-lg p-5 hover:border-[#444] transition-colors flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                <button className="text-gray-500 hover:text-white"><MoreVertical size={16} /></button>
              </div>
              <p className="text-sm text-gray-400 mb-6 flex-1">{project.description}</p>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-[#1e1e1e] rounded-full h-1.5 border border-[#333]">
                    <div className={`h-1.5 rounded-full ${project.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${project.progress}%` }}></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-[#333]">
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <div className="flex items-center" title="Team Members">
                      <Users size={14} className="mr-1.5" />
                      {project.members}
                    </div>
                    <div className="flex items-center" title="Due Date">
                      <Calendar size={14} className="mr-1.5" />
                      {project.dueDate}
                    </div>
                  </div>
                  <div>
                    {project.status === 'completed' ? (
                      <span className="flex items-center text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded border border-green-400/20">
                        <CheckCircle2 size={12} className="mr-1" /> Completed
                      </span>
                    ) : project.status === 'active' ? (
                      <span className="flex items-center text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded border border-blue-400/20">
                        <Clock size={12} className="mr-1" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center text-xs text-gray-400 bg-gray-400/10 px-2 py-1 rounded border border-gray-400/20">
                        <Clock size={12} className="mr-1" /> Planning
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
