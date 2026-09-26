
import React from 'react';

const gardens = [
  {
    id: 1,
    name: "Sunnyside Community Plot",
    city: "Brooklyn, NY",
    tags: ["Organic", "Public Access"],
    img: "https://picsum.photos/seed/garden1/600/400"
  },
  {
    id: 2,
    name: "Highland Heights Rooftop",
    city: "Atlanta, GA",
    tags: ["Rooftop", "Education"],
    img: "https://picsum.photos/seed/garden2/600/400"
  },
  {
    id: 3,
    name: "Mission District Greens",
    city: "San Francisco, CA",
    tags: ["Volunteer Run", "Food Justice"],
    img: "https://picsum.photos/seed/garden3/600/400"
  },
  {
    id: 4,
    name: "EcoUrban Commons",
    city: "Seattle, WA",
    tags: ["Composting", "Seeds"],
    img: "https://picsum.photos/seed/garden4/600/400"
  },
  {
    id: 5,
    name: "Crescent Park Patch",
    city: "New Orleans, LA",
    tags: ["Community Hub", "Diverse"],
    img: "https://picsum.photos/seed/garden5/600/400"
  },
  {
    id: 6,
    name: "Wicker Park Roots",
    city: "Chicago, IL",
    tags: ["School Program", "Bees"],
    img: "https://picsum.photos/seed/garden6/600/400"
  }
];

const GardenGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {gardens.map((garden) => (
        <div key={garden.id} className="group cursor-pointer">
          <div className="relative h-64 overflow-hidden rounded-2xl mb-4">
            <img 
              src={garden.img} 
              alt={garden.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              {garden.tags.map(tag => (
                <span key={tag} className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-emerald-800 shadow-sm">{tag}</span>
              ))}
            </div>
          </div>
          <h3 className="text-xl font-bold text-emerald-950 mb-1">{garden.name}</h3>
          <div className="flex items-center gap-1 text-stone-500 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            {garden.city}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GardenGrid;
