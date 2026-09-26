
export interface CreditCard {
  id: string;
  type: string;
  icon: string;
  balance?: number;
  progress?: number;
  status: string;
  accentColor: string;
  glowColor: string;
  bottomBar: string;
  sparklineData: number[];
}

const generateSparkline = () => Array.from({ length: 12 }, () => Math.floor(Math.random() * 80) + 20);

export const CREDIT_CARD_DATA: CreditCard[] = [
  {
    id: 'ingenuity',
    type: 'Ingenuity',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v-5a6 6 0 0 0-12 0v5m6 8v-3m-3.5 0h7"/></svg>`,
    balance: 2847,
    status: 'Exchangeable • Transferable',
    accentColor: '#2DD4BF',
    glowColor: 'rgba(45,212,191,0.15)',
    bottomBar: 'bg-[#2DD4BF]',
    sparklineData: generateSparkline(),
  },
  {
    id: 'opportunity',
    type: 'Opportunity',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    balance: 1923,
    status: 'Vesting • Exchangeable',
    accentColor: '#2DD4BF', // Placeholder for gradient
    glowColor: 'rgba(45,212,191,0.12)',
    bottomBar: 'bg-gradient-to-r from-[#2DD4BF] to-[#8B5CF6]',
    sparklineData: generateSparkline(),
  },
  {
    id: 'designation',
    type: 'Designation',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
    balance: 981,
    status: 'Delegated',
    accentColor: '#8B5CF6',
    glowColor: 'rgba(139,92,246,0.15)',
    bottomBar: 'bg-[#8B5CF6]',
    sparklineData: generateSparkline(),
  },
  {
    id: 'sponsorship',
    type: 'Sponsorship',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
    balance: 5028,
    status: 'Yield-bearing',
    accentColor: '#D4A855',
    glowColor: 'rgba(212,168,85,0.12)',
    bottomBar: 'bg-[#D4A855]',
    sparklineData: generateSparkline(),
  },
  {
    id: 'referral',
    type: 'Referral',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>`,
    balance: 312,
    status: 'Claimable',
    accentColor: '#A78BFA', // Violet-Rose
    glowColor: 'rgba(167,139,250,0.12)',
    bottomBar: 'bg-[#A78BFA]',
    sparklineData: generateSparkline(),
  },
  {
    id: 'intrinsic',
    type: 'Intrinsic',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    progress: 75,
    status: 'Soul-Bound',
    accentColor: '#F0F0F5',
    glowColor: 'rgba(240,240,245,0.08)',
    bottomBar: 'bg-gradient-to-r from-white/20 via-white/80 to-white/20 animate-pulse',
    sparklineData: [],
  },
];
