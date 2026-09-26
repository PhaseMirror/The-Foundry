
export enum MembershipLevel {
  YOUTH = 'Youth (14–17)',
  MEMBER = 'Member',
  SPONSOR = 'Sponsor',
  AFFILIATE = 'Affiliate',
  ASSOCIATE = 'Associate',
  MANAGER = 'Manager',
  GENERAL_MANAGER = 'General Manager',
  DISTRICT_MANAGER = 'District Manager',
  REGIONAL_MANAGER = 'Regional Manager',
  OFFICER = 'Officer',
  VICE_PRESIDENT = 'Vice President',
  CHIEF_OFFICER = 'Chief Officer',
  EVP = 'EVP',
  PRESIDENT = 'President'
}

export enum CreditType {
  INGENUITY = 'Ingenuity',
  OPPORTUNITY = 'Opportunity',
  DESIGNATION = 'Designation',
  SPONSORSHIP = 'Sponsorship',
  REFERRAL = 'Referral/Sharing',
  INTRINSIC = 'Intrinsic'
}

export enum SubmissionStatus {
  SUBMITTED = 'SUBMITTED',
  REVIEWING = 'REVIEWING',
  IMPLEMENTED = 'IMPLEMENTED',
  ACCUMULATING = 'ACCUMULATING',
  REWARDED = 'REWARDED',
  REJECTED = 'REJECTED'
}

export interface Member {
  id: string;
  name: string;
  email: string;
  membershipLevel: MembershipLevel;
  joinedAt: Date;
  participationHours: number;
  conductViolations: number;
  intrinsicCredits: number;
  branchName: string;
}

export interface CreditBalance {
  type: CreditType;
  balance: number;
  lifetimeEarned: number;
  monthlyExchanged: number;
}

export interface ActivityEvent {
  id: string;
  timestamp: Date;
  description: string;
  amount?: number;
  type: CreditType;
}
