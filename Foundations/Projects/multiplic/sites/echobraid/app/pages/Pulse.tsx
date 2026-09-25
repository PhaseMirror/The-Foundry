import React from 'react';
import { Activity, CheckCircle, Clock } from 'lucide-react';

const Pulse: React.FC = () => {
  const events = [
    { id: 1, title: 'Weekly Reflection', status: 'upcoming', date: 'Fri, Oct 24' },
    { id: 2, title: 'Monthly Goal Setting', status: 'completed', date: 'Tue, Oct 1' },
    { id: 3, title: 'Quarterly Review', status: 'missed', date: 'Mon, Sep 30' },
  ];

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto animate-fade-in">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
            <Activity size={32} />
          </div>
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Pulse</h1>
        </div>
        <p className="text-lg text-stone-600 dark:text-stone-400">
          Your rhythmic check-ins. Keep the beat of your learning.
        </p>
      </header>

      <div className="grid gap-6">
        {events.map((event) => (
          <div 
            key={event.id}
            className="group bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 flex items-center gap-6 transition-all hover:shadow-lg hover:border-blue-500/50"
          >
            <div className={`p-3 rounded-xl ${
              event.status === 'completed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
              event.status === 'missed' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
              'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
            }`}>
              {event.status === 'completed' ? <CheckCircle size={24} /> : <Clock size={24} />}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-xl font-bold text-stone-800 dark:text-stone-200">{event.title}</h3>
                <span className="text-sm font-medium text-stone-500 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full">
                  {event.date}
                </span>
              </div>
              <p className="text-stone-500 capitalize">{event.status}</p>
            </div>

            <button className="px-6 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-bold text-sm hover:bg-blue-500 hover:text-white transition-colors">
              {event.status === 'upcoming' ? 'Start' : 'View'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pulse;
