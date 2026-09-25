
import React from 'react';
import { 
  Lightbulb, 
  Handshake, 
  Map, 
  Sun, 
  Share2, 
  Heart,
  Droplets,
  Sprout,
  TreePine,
  Flower2
} from 'lucide-react';
import { CreditType, MembershipLevel, Member, CreditBalance, ActivityEvent } from './types';

export const CREDIT_VISUALS: Record<CreditType, { 
  icon: React.ReactNode, 
  metaphor: string, 
  color: string,
  growthIcon: React.ReactNode 
}> = {
  [CreditType.INGENUITY]: {
    icon: <Lightbulb className="w-6 h-6" />,
    metaphor: 'Light bulb / bloom',
    color: 'emerald',
    growthIcon: <Flower2 className="w-10 h-10 text-emerald-400" />
  },
  [CreditType.OPPORTUNITY]: {
    icon: <Handshake className="w-6 h-6" />,
    metaphor: 'Hands / roots',
    color: 'violet',
    growthIcon: <Sprout className="w-10 h-10 text-violet-400" />
  },
  [CreditType.DESIGNATION]: {
    icon: <Map className="w-6 h-6" />,
    metaphor: 'Land / tree',
    color: 'emerald',
    growthIcon: <TreePine className="w-10 h-10 text-emerald-500" />
  },
  [CreditType.SPONSORSHIP]: {
    icon: <Sun className="w-6 h-6" />,
    metaphor: 'Sun / rain',
    color: 'violet',
    growthIcon: <Droplets className="w-10 h-10 text-violet-500" />
  },
  [CreditType.REFERRAL]: {
    icon: <Share2 className="w-6 h-6" />,
    metaphor: 'Network / mycelium',
    color: 'emerald',
    growthIcon: <div className="w-10 h-10 border-2 border-emerald-500 rounded-full flex items-center justify-center">M</div>
  },
  [CreditType.INTRINSIC]: {
    icon: <Heart className="w-6 h-6" />,
    metaphor: 'Heart / soil',
    color: 'violet',
    growthIcon: <div className="w-10 h-10 bg-violet-600 rounded-lg" />
  }
};

export const MOCK_USER: Member = {
  id: 'u-123',
  name: 'Elena Vance',
  email: 'elena@citizengardens.org',
  membershipLevel: MembershipLevel.ASSOCIATE,
  joinedAt: new Date('2023-03-15'),
  participationHours: 840,
  conductViolations: 0,
  intrinsicCredits: 780,
  branchName: 'Sovereign Garden — West End'
};

export const MOCK_BALANCES: CreditBalance[] = [
  { type: CreditType.INGENUITY, balance: 450, lifetimeEarned: 1200, monthlyExchanged: 200 },
  { type: CreditType.OPPORTUNITY, balance: 125, lifetimeEarned: 3500, monthlyExchanged: 0 },
  { type: CreditType.DESIGNATION, balance: 2000, lifetimeEarned: 5000, monthlyExchanged: 1000 },
  { type: CreditType.SPONSORSHIP, balance: 100, lifetimeEarned: 100, monthlyExchanged: 0 },
  { type: CreditType.REFERRAL, balance: 3, lifetimeEarned: 5, monthlyExchanged: 0 },
  { type: CreditType.INTRINSIC, balance: 780, lifetimeEarned: 780, monthlyExchanged: 0 },
];

export const MOCK_ACTIVITY: ActivityEvent[] = [
  { id: '1', timestamp: new Date(), type: CreditType.OPPORTUNITY, description: 'Earned 12 credits for 6 hours at West End', amount: 12 },
  { id: '2', timestamp: new Date(Date.now() - 86400000), type: CreditType.INGENUITY, description: 'Submission "Compost Tracking App" entered accumulation', amount: 0 },
  { id: '3', timestamp: new Date(Date.now() - 172800000), type: CreditType.REFERRAL, description: 'Passed 200 credits to Maria C.', amount: -200 },
  { id: '4', timestamp: new Date(Date.now() - 259200000), type: CreditType.DESIGNATION, description: 'Board approved land designation — yield starts March 1', amount: 0 },
];
