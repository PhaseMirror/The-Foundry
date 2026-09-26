const Settings = () => {
  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
        <p className="text-zinc-400 text-sm mb-6">Agency server configuration</p>

        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Agency Server Port
              </label>
              <input
                type="text"
                value="8082"
                disabled
                className="w-full bg-zinc-900/50 border border-zinc-700 text-zinc-400 rounded-lg p-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                PM Binary Path
              </label>
              <input
                type="text"
                value="./bin/phase-mirror-gpt"
                disabled
                className="w-full bg-zinc-900/50 border border-zinc-700 text-zinc-400 rounded-lg p-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Archivum WAL
              </label>
              <input
                type="text"
                value="./var/archivum/ledger.jsonl"
                disabled
                className="w-full bg-zinc-900/50 border border-zinc-700 text-zinc-400 rounded-lg p-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Allowed Binaries
              </label>
              <div className="flex flex-wrap gap-2">
                {['coding-commander', 'the-examiner', 'the-publisher', 'finton', 'ataraxia', 'phase-mirror-gpt', 'pirtm-core'].map((bin) => (
                  <span key={bin} className="px-2 py-1 bg-zinc-900/50 border border-zinc-800 rounded text-xs font-mono text-zinc-300">
                    {bin}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
