
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: '2020', gardens: 5, produce: 1200 },
  { name: '2021', gardens: 12, produce: 3400 },
  { name: '2022', gardens: 28, produce: 7800 },
  { name: '2023', gardens: 45, produce: 15600 },
  { name: '2024', gardens: 62, produce: 22000 },
];

const ImpactStats: React.FC = () => {
  return (
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-sm border border-white/20">
        <h3 className="text-2xl font-bold mb-6 text-emerald-300">Produce Harvested (lbs)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="name" stroke="#ffffff80" />
              <YAxis stroke="#ffffff80" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#064e3b', border: 'none', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#34d399' }}
              />
              <Bar dataKey="produce" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#34d399' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        {[
          { label: 'Total Gardens', value: '62+', sub: 'Across 12 cities' },
          { label: 'Active Volunteers', value: '2,400+', sub: 'Community members' },
          { label: 'Education Hours', value: '15k+', sub: 'Free workshops' },
          { label: 'Pounds Harvested', value: '22k+', sub: 'Donated & shared' },
        ].map((stat) => (
          <div key={stat.label} className="bg-emerald-900/50 p-6 rounded-2xl border border-emerald-800 hover:border-emerald-500 transition-colors">
            <p className="text-emerald-400 font-medium mb-1">{stat.label}</p>
            <p className="text-4xl font-bold mb-1">{stat.value}</p>
            <p className="text-emerald-100/60 text-sm">{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImpactStats;
