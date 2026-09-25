import React from 'react';
import { Activity, Calendar, Clock, CheckCircle } from 'lucide-react';

type PulseEvent = {
  id: string;
  title: string;
  date: string;
  status: 'upcoming' | 'completed' | 'missed';
  description: string;
};

const MOCK_EVENTS: PulseEvent[] = [
  {
    id: '1',
    title: 'Weekly Reflection',
    date: 'Every Friday',
    status: 'upcoming',
    description: 'Take a moment to reflect on your week.'
  },
  {
    id: '2',
    title: 'Monthly Goal Setting',
    date: 'First of the month',
    status: 'completed',
    description: 'Set your intentions for the month ahead.'
  }
];

const PulsePage: React.FC = () => {
  return (
    <div className="container mx-auto px-8 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Activity className="text-brand-accent" size={32} />
        <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Pulse</h1>
      </div>
      
      <p className="text-lg text-stone-600 dark:text-stone-400 mb-12 max-w-2xl">
        Track your rhythm. Stay in sync with your learning journey.
      </p>

      <div className="grid gap-6 max-w-3xl">
        {MOCK_EVENTS.map((event) => (
          <div 
            key={event.id}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 flex items-start gap-6 transition-all hover:shadow-lg"
          >
            <div className={`p-3 rounded-xl ${
              event.status === 'completed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
              event.status === 'missed' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
              'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
              {event.status === 'completed' ? <CheckCircle size={24} /> : <Clock size={24} />}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-stone-800 dark:text-stone-200">{event.title}</h3>
                <span className="text-sm font-medium text-stone-500 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full">
                  {event.date}
                </span>
              </div>
              <p className="text-stone-600 dark:text-stone-400">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PulsePage;
