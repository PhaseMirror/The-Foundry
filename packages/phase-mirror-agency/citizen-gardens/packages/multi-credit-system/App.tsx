
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { CreditPod } from './components/CreditPod';
import { PathwayView } from './components/PathwayView';
import { 
  MOCK_USER, 
  MOCK_BALANCES, 
  MOCK_ACTIVITY, 
  CREDIT_VISUALS 
} from './constants';
import { 
  TrendingUp, 
  Plus, 
  Send, 
  ArrowLeftRight, 
  ShoppingBag, 
  Vote, 
  Timer,
  AlertCircle,
  FileText,
  BarChart3,
  User
} from 'lucide-react';
import { getGeminiExplanation } from './services/geminiService';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'public' | 'dashboard' | 'admin'>('dashboard');
  const [selectedCredit, setSelectedCredit] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCredit) {
      getGeminiExplanation(selectedCredit).then(setAiInsight);
    }
  }, [selectedCredit]);

  const renderPublic = () => (
    <div className="space-y-20 pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
              A Living <span className="text-emerald-500">Economy</span> for Human <span className="text-violet-500">Growth</span>.
            </h1>
            <p className="text-xl text-slate-400 mb-10 max-w-lg leading-relaxed">
              Citizen Gardens is more than a network. It's a circulatory system that recognizes your ingenuity, opportunity, and intrinsic value through a multi-credit ledger.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setActiveTab('dashboard')} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20">
                Join the Garden
              </button>
              <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all">
                Read the Bylaws
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-violet-500/20 blur-3xl" />
            <img src="https://picsum.photos/800/600?nature=1" alt="Garden" className="rounded-3xl relative z-10 shadow-2xl grayscale hover:grayscale-0 transition-all duration-700" />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: 'Ingenuity', desc: 'Rewarding creative solutions and productivity gains.', color: 'emerald' },
          { title: 'Opportunity', desc: 'Validating volunteering time and service hours.', color: 'violet' },
          { title: 'Intrinsic', desc: 'A soul-bound reputation representing your conduct.', color: 'emerald' },
        ].map((item, i) => (
          <div key={i} className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all">
            <h3 className={`text-2xl font-bold mb-4 text-${item.color}-400`}>{item.title}</h3>
            <p className="text-slate-400">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );

  const renderDashboard = () => (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Main Dashboard Area */}
      <div className="lg:col-span-9 space-y-8">
        {/* Welcome */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold">Welcome, {MOCK_USER.name}</h2>
            <p className="text-slate-400">Your Garden is thriving. You have {MOCK_USER.intrinsicCredits} reputation points.</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Branch</div>
            <div className="text-emerald-400 font-medium">{MOCK_USER.branchName}</div>
          </div>
        </div>

        {/* Credit Pods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {MOCK_BALANCES.map((bal) => (
            <CreditPod 
              key={bal.type} 
              balance={bal} 
              onClick={() => setSelectedCredit(bal.type)} 
            />
          ))}
        </div>

        {/* Pathway Section */}
        <PathwayView member={MOCK_USER} />

        {/* Charts & Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Growth Velocity
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { name: 'Mon', val: 400 },
                  { name: 'Tue', val: 600 },
                  { name: 'Wed', val: 550 },
                  { name: 'Thu', val: 800 },
                  { name: 'Fri', val: 950 },
                  { name: 'Sat', val: 1100 },
                  { name: 'Sun', val: 1050 },
                ]}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="val" stroke="#10b981" fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Timer className="w-5 h-5 text-violet-400" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {MOCK_ACTIVITY.map((event) => (
                <div key={event.id} className="flex gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition-colors">
                  <div className={`p-2 rounded-lg bg-slate-800 ${event.amount && event.amount > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {CREDIT_VISUALS[event.type].icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{event.description}</p>
                    <p className="text-[10px] text-slate-500">{event.timestamp.toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Quick Actions */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 sticky top-24">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { icon: Plus, label: 'Log Hours', color: 'emerald' },
              { icon: FileText, label: 'Submit Ingenuity', color: 'emerald' },
              { icon: Send, label: 'Pass Credits', color: 'violet' },
              { icon: ArrowLeftRight, label: 'Exchange Credits', color: 'violet' },
              { icon: ShoppingBag, label: 'Redeem Credits', color: 'slate' },
              { icon: Vote, label: 'Active Proposals', color: 'emerald', badge: '3' },
            ].map((action, i) => (
              <button key={i} className="w-full flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl transition-all group">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-slate-800 group-hover:bg-slate-700 text-${action.color}-400`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-200">{action.label}</span>
                </div>
                {action.badge && (
                  <span className="bg-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{action.badge}</span>
                )}
              </button>
            ))}
          </div>

          {selectedCredit && (
            <div className="mt-8 p-4 bg-violet-600/10 border border-violet-500/20 rounded-2xl">
              <h4 className="text-xs font-bold text-violet-400 mb-2 uppercase">AI Guardian Insight</h4>
              <p className="text-xs text-slate-400 italic leading-relaxed">
                {aiInsight || 'Loading wisdom...'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Branch Management</h2>
          <p className="text-slate-400">Administration portal for {MOCK_USER.branchName}</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-xl text-sm font-bold hover:bg-emerald-500">
            <Plus className="w-4 h-4" /> Batch Distribute
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-sm font-bold hover:bg-slate-700">
            <BarChart3 className="w-4 h-4" /> Reports
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Members', val: '142', delta: '+12%', icon: User },
          { label: 'Hours Logged (Week)', val: '1,240', delta: '+5%', icon: Timer },
          { label: 'Credits Distributed', val: '45.2k', delta: '-2%', icon: TrendingUp },
          { label: 'Incident Reports', val: '0', delta: 'stable', icon: AlertCircle },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-800 rounded-lg"><stat.icon className="w-5 h-5 text-slate-400" /></div>
              <span className={`text-[10px] font-bold ${stat.delta.startsWith('+') ? 'text-emerald-400' : 'text-slate-500'}`}>{stat.delta}</span>
            </div>
            <div className="text-2xl font-bold">{stat.val}</div>
            <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Member Roster Placeholder Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold">Member Roster</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Filter members..." 
              className="bg-slate-800 border-none rounded-lg px-4 py-1 text-sm focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950 text-slate-500 uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Level</th>
              <th className="px-6 py-4">Intrinsic</th>
              <th className="px-6 py-4">Hours</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="hover:bg-slate-800/30">
                <td className="px-6 py-4 font-medium">Member #{i}00{i}</td>
                <td className="px-6 py-4 text-emerald-400">Associate</td>
                <td className="px-6 py-4">780</td>
                <td className="px-6 py-4">840</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-500 hover:text-white mr-4">Edit</button>
                  <button className="text-violet-400 hover:text-violet-300">Journal</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'public' && renderPublic()}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'admin' && renderAdmin()}
    </Layout>
  );
};

export default App;
