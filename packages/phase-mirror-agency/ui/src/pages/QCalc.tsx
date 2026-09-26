import { useQCalcStore } from '../stores/qcalcStore';

const QCalc = () => {
  const { job, setLambdaM, setTimeEnd, toggleStratum, run, reset } = useQCalcStore();
  const [lambdaM, setLocalLambdaM] = useState(job.lambdaM ?? 0.8);
  const [timeEnd, setLocalTimeEnd] = useState(job.timeEnd ?? 200);

  const handleRun = () => {
    setLambdaM(lambdaM);
    setTimeEnd(timeEnd);
    run();
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Q-Calculator</h1>
        <p className="text-zinc-400 text-sm mb-6">Embedded WASM / REST compute substrate</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-[#0c0c0e] border border-zinc-800 rounded-xl p-6">
            <div className="mb-4">
              <label className="text-xs text-zinc-300 flex justify-between mb-1">
                <span>Lambda M</span>
                <span className="font-mono text-sky-400">{lambdaM}</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={lambdaM}
                onChange={(e) => setLocalLambdaM(parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            <div className="mb-6">
              <label className="text-xs text-zinc-300 flex justify-between mb-1">
                <span>Time Horizon</span>
                <span className="font-mono text-zinc-400">{timeEnd}s</span>
              </label>
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={timeEnd}
                onChange={(e) => setLocalTimeEnd(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRun}
                disabled={job.status === 'running'}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-sky-600 hover:bg-sky-500 text-white disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                Run
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white bg-zinc-900/30 border border-zinc-800"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#0c0c0e] border border-zinc-800 rounded-xl p-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Compute Status</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-zinc-900/30 p-3 rounded border border-zinc-800">
                <div className="text-[10px] text-zinc-500 font-mono uppercase">Status</div>
                <div className="text-lg font-mono text-zinc-200 capitalize">{job.status}</div>
              </div>
              <div className="bg-zinc-900/30 p-3 rounded border border-zinc-800">
                <div className="text-[10px] text-zinc-500 font-mono uppercase">Progress</div>
                <div className="text-lg font-mono text-zinc-200">{job.progress}%</div>
              </div>
              <div className="bg-zinc-900/30 p-3 rounded border border-zinc-800">
                <div className="text-[10px] text-zinc-500 font-mono uppercase">Contraction</div>
                <div className="text-lg font-mono text-zinc-200">{job.contraction.toFixed(4)}</div>
              </div>
              <div className="bg-zinc-900/30 p-3 rounded border border-zinc-800">
                <div className="text-[10px] text-zinc-500 font-mono uppercase">Operator Norm</div>
                <div className="text-lg font-mono text-zinc-200">{job.operatorNorm.toFixed(4)}</div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Event Stream</h3>
              <div className="space-y-1 font-mono text-xs h-40 overflow-y-auto bg-zinc-900/20 rounded-lg p-3 border border-zinc-800">
                {job.logs.length === 0 ? (
                  <span className="text-zinc-700 italic">No events recorded.</span>
                ) : (
                  job.logs.map((log, i) => (
                    <div key={i} className="text-zinc-400 border-l-2 border-zinc-800 pl-2 py-0.5">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QCalc;
