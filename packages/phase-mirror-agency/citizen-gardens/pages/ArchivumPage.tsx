import React, { useState, useEffect } from 'react';
import { Search, Plus, ShieldCheck, ArrowDownTrayIcon, Share2 } from 'lucide-react';
import { agencyService, ArchivumEntry } from '../src/services/AgencyService';

const ArchivumPage: React.FC = () => {
  const [ledger, setLedger] = useState<ArchivumEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [newSiteDomain, setNewSiteDomain] = useState('');
  const [myRegistrations, setMyRegistrations] = useState<ArchivumEntry[]>([]);

  useEffect(() => {
    fetchLedger();
    const saved = JSON.parse(localStorage.getItem('cg_registrations') || '[]');
    setMyRegistrations(saved);
  }, []);

  const fetchLedger = async () => {
    try {
      const data = await agencyService.getArchivumLedger();
      setLedger(data);
    } catch (error) {
      console.error('Failed to fetch ledger', error);
    }
  };

  const downloadReceipt = (entry: ArchivumEntry) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entry, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `archivum-receipt-${entry.id.substring(0, 8)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteDomain) return;

    try {
      const result = await agencyService.registerSite({ domain: newSiteDomain });
      setMyRegistrations(prev => [...prev, result]);
      setIsRegistering(false);
      setNewSiteDomain('');
      fetchLedger(); // Refresh ledger
    } catch (error) {
      alert('Registration failed');
    }
  };

  const filteredLedger = ledger.filter(entry => 
    entry.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    JSON.stringify(entry.metadata).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-32 pb-24 min-h-screen bg-transparent text-zinc-300">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="font-serif text-4xl text-white mb-2">Archivum</h1>
            <p className="text-zinc-500">Immutable governance ledger & site registry (Λᵖ)</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type="text" 
                placeholder="Search by proofHash..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-citizen-green outline-none transition-colors"
              />
            </div>
            <button 
              onClick={() => setIsRegistering(true)}
              className="bg-citizen-green hover:bg-citizen-green/80 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center transition-colors"
            >
              <Plus size={16} className="mr-2" /> Register Site
            </button>
          </div>
        </div>

        {/* User's Browser-Stored Registrations */}
        {myRegistrations.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xs font-bold text-citizen-green uppercase tracking-widest mb-4">Your Browser Registrations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myRegistrations.map((reg) => (
                <div key={reg.id} className="bg-citizen-green/5 border border-citizen-green/20 rounded-xl p-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 flex gap-2">
                    <button 
                      onClick={() => downloadReceipt(reg)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-citizen-green/10 rounded transition-all text-citizen-green"
                      title="Download Local Copy"
                    >
                      <ArrowDownTrayIcon size={14} />
                    </button>
                    <ShieldCheck size={16} className="text-citizen-green mt-1" />
                  </div>
                  <div className="text-[10px] font-mono text-citizen-green/60 mb-1">PROOF HASH</div>
                  <div className="text-sm font-mono text-white mb-3 truncate">{reg.id}</div>
                  <div className="text-xs text-zinc-400">
                    Domain: <span className="text-white">{reg.metadata.domain}</span>
                  </div>
                  <div className="text-[9px] text-zinc-600 mt-4 flex items-center">
                    Saved locally in browser storage
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Ledger */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
          <table className="w-full text-left">
            <thead className="bg-zinc-900/80 text-xs font-mono uppercase text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Receipt CID</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Metadata</th>
                <th className="px-6 py-4">Drift (δ)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredLedger.map((entry) => (
                <tr key={entry.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-mono text-emerald-500 text-xs">{entry.id}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{entry.timestamp}</td>
                  <td className="px-6 py-4 text-sm text-zinc-300">
                    {entry.type === 'Site.Registration' ? `Site: ${entry.metadata.domain}` : entry.type}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    <span className={entry.drift > 0.15 ? 'text-amber-400' : 'text-zinc-500'}>
                      {entry.drift.toFixed(3)}Ξ
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => downloadReceipt(entry)}
                        title="Download Receipt" 
                        className="p-1 hover:text-white text-zinc-500"
                      >
                        <ArrowDownTrayIcon size={14}/>
                      </button>
                      <button title="Share Proof" className="p-1 hover:text-white text-zinc-500"><Share2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLedger.length === 0 && (
            <div className="p-12 text-center text-zinc-600 italic">
              No ledger entries found.
            </div>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      {isRegistering && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="font-serif text-2xl text-white mb-6">Register New Site</h2>
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Domain Name</label>
                <input 
                  type="text" 
                  placeholder="example.citizengardens.org"
                  value={newSiteDomain}
                  onChange={(e) => setNewSiteDomain(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-citizen-green outline-none transition-colors"
                  autoFocus
                />
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                By registering, you generate a unique proof hash. This hash will be stored in your browser to verify ownership without a central server account.
              </p>
              <div className="flex gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsRegistering(false)}
                  className="flex-1 px-4 py-2 border border-zinc-800 text-zinc-400 rounded-lg text-sm hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-citizen-green text-white rounded-lg text-sm font-bold hover:bg-citizen-green/80 transition-colors"
                >
                  Confirm & Proof
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchivumPage;
