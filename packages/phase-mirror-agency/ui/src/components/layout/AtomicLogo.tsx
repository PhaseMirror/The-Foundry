const AtomicLogo = ({ collapsed }: { collapsed?: boolean }) => (
  <div
    className={`
      bg-sky-900/20 rounded-lg flex items-center justify-center border border-sky-500/30 text-sky-400 relative overflow-hidden group shadow-[0_0_15px_rgba(14,165,233,0.15)]
      transition-all duration-300
      ${collapsed ? 'w-8 h-8' : 'w-8 h-8'}
    `}
  >
    <div className="absolute inset-0 bg-sky-500/10 blur-sm"></div>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 relative z-10">
      <circle cx="12" cy="12" r="3" className="fill-sky-500/20 stroke-none" />
      <path d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z" className="opacity-30" />
      <path d="M12 21c4.97 0 9-2.03 9-4.5S16.97 12 12 12s-9 2.03-9 4.5 4.03 4.5 9 4.5z" className="opacity-60 rotate-45 origin-center" />
      <path d="M12 21c4.97 0 9-2.03 9-4.5S16.97 12 12 12s-9 2.03-9 4.5 4.03 4.5 9 4.5z" className="opacity-60 -rotate-45 origin-center" />
    </svg>
  </div>
);

export default AtomicLogo;
