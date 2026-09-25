import React from 'react';
import { Pause, Smile } from 'lucide-react';

const Planner: React.FC = () => {
  const [selectedDay, setSelectedDay] = React.useState(new Date());
  const [events, setEvents] = React.useState([
    { id: 1, name: 'Talking-Stick Circle', time: '9:00', duration: 60, type: 'circle' },
    { id: 2, name: 'Tool-Build', time: '10:30', duration: 90, type: 'build' },
    { id: 3, name: 'Literacy Return', time: '13:00', duration: 45, type: 'literacy' },
    { id: 4, name: 'Micro-Challenge', time: '14:30', duration: 30, type: 'challenge' },
  ]);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const today = new Date();
  const currentDay = today.getDate();
  const startOfWeek = new Date(today.setDate(currentDay - today.getDay() + 1));

  const timeSlots = Array.from({ length: 10 }, (_, i) => `${8 + i}:00`);

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'circle': return 'bg-[#dce8f5] border-[#b0cce8] text-[#1e4a72]';
      case 'build': return 'bg-[#e8f4ea] border-[#add5b4] text-[#1e4f28]';
      case 'literacy': return 'bg-[#fdf3e7] border-[#e8c98a] text-[#6b3e10]';
      case 'challenge': return 'bg-[#f0eaf7] border-[#c9a8e0] text-[#4a1f72]';
      default: return 'bg-gray-200 border-gray-400 text-gray-800';
    }
  };

  const getDotColor = (type: string) => {
    switch (type) {
      case 'circle': return 'bg-blue-500';
      case 'build': return 'bg-green-500';
      case 'literacy': return 'bg-amber-500';
      case 'challenge': return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
  }

  return (
    <div className="flex flex-col h-screen bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 md:pl-20">
      {/* Zone 1: Top Bar (Sticky) */}
      <header className="sticky top-0 z-30 flex-shrink-0 px-4 py-3 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-sm border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Planner</h1>
            <p className="text-sm text-stone-500">Week 3 of 6 · Feb 24-28</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-sm">
              <Smile size={16} />
              <span>Okay</span>
            </button>
            <button onClick={() => setEvents([...events, {id: events.length + 1, name: 'New Event', time: '12:00', duration: 60, type: 'challenge'}])} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-900">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </button>
            <button className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-900">
              <Pause size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Zone 2: Cycle Progress Strip */}
      <div className="sticky top-[69px] z-30 flex-shrink-0 px-4 py-2 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-sm border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-stone-500">Cycle</span>
          <div className="flex items-center gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`w-6 h-2 rounded-full ${i < 2 ? 'bg-teal-400' : i === 2 ? 'bg-teal-400/50' : 'bg-stone-200 dark:bg-stone-700'}`} />
            ))}
          </div>
          <span className="text-xs font-medium text-stone-500">Week 3 of 6</span>
        </div>
      </div>

      {/* Zone 3: Week Navigation Strip (Sticky) */}
      <div className="sticky top-[113px] z-30 flex-shrink-0 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-sm border-b border-stone-200 dark:border-stone-800">
        <div className="flex justify-around">
          {weekDays.map((day, i) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const isSelected = date.getDate() === selectedDay.getDate() && date.getMonth() === selectedDay.getMonth();
            return (
              <div key={day} onClick={() => setSelectedDay(date)} className={`text-center py-3 border-b-2 ${isSelected ? 'border-teal-400' : 'border-transparent'} w-full cursor-pointer`}>
                <p className="text-xs uppercase text-stone-500">{day}</p>
                <p className={`text-xl font-bold ${isSelected ? 'text-teal-400' : ''}`}>{date.getDate()}</p>
                <div className="flex justify-center gap-1 mt-1">
                  {events.map(e => <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${getDotColor(e.type)} ${isSelected ? 'opacity-100' : 'opacity-30'}`}></div>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Zone 4: Day Planner Body (Scrollable) */}
      <main className="flex-1 flex overflow-y-auto">
        {/* Time Gutter */}
        <div className="w-16 text-right pr-2 pt-4 flex-shrink-0">
          {timeSlots.map(time => (
            <div key={time} className="h-24 text-xs text-stone-400 dark:text-stone-500 relative">
              <span className="absolute -top-1.5">{time}</span>
            </div>
          ))}
        </div>

        {/* Event Column */}
        <div className="flex-1 border-l-2 border-dashed border-stone-200 dark:border-stone-700 relative p-4">
          {events.map(event => {
            const [hour, minute] = event.time.split(':').map(Number);
            const top = ((hour - 8) * 60 + minute) * (24 * 4 / 60) / 16; // 6rem per hour (h-24 -> 96px), so 96px/60min = 1.6px/min. In rems, 6/60 = 0.1rem/min
            const height = event.duration * (24 * 4 / 60) / 16;
            return (
              <div
                key={event.id}
                className={`absolute left-4 right-4 p-3 rounded-lg ${getActivityColor(event.type)}`}
                style={{ top: `${top}rem`, height: `${height}rem` }}
              >
                <p className="font-bold text-sm">{event.name}</p>
                <p className="text-xs opacity-70">Re-read a past Firebook entry</p>
                <button className="absolute bottom-1 right-1 p-1 rounded-full hover:bg-black/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-save"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                </button>
                <button onClick={() => setEvents(events.filter(e => e.id !== event.id))} className="absolute top-1 right-1 p-1 rounded-full hover:bg-black/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            );
          })}
          
          {/* "NOW" Line */}
          <div className="absolute w-full left-0" style={{ top: `${((new Date().getHours() - 8) * 60 + new Date().getMinutes()) * (24 * 4 / 60) / 16}rem` }}>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 z-10"></div>
              <div className="flex-1 h-0.5 bg-red-500"></div>
              <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full -mr-2 z-10">NOW</div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Zone 5: Floating Sovereignty Strip */}
      <div className="absolute bottom-24 right-4 z-40">
        <button className="px-4 py-2 bg-white/80 dark:bg-stone-800/80 backdrop-blur-md rounded-full shadow-lg text-sm font-medium">
          Passing is always okay
        </button>
      </div>
    </div>
  );
};

export default Planner;
