
export enum LifestyleRank {
  MEMBER = 'Member',
  PRO = 'Pro',
  ELITE = 'Elite',
  VISIONARY = 'Visionary'
}

export enum Theme {
  SYSTEM = 'SYSTEM',
  LIGHT = 'LIGHT',
  DARK = 'DARK'
}

export enum AppStatus {
  READY = 'READY',
  ACTIVE = 'ACTIVE',
  URGENT = 'URGENT'
}

export type PodStatus = AppStatus;

export interface AppIdentity {
  id: string;
  name: string;
  icon: string;
  fallbackStoreUrl: string;
}

export type Pod = AppIdentity;

export interface Task {
  id: string;
  appId: string;
  name: string;
  frequency: 'SLIDING' | 'FIXED_DAILY' | 'WINDOW';
  customHours?: number;
  customMinutes?: number;
  nextDueAt: number;
  streak: number;
  efficiency: number;
  totalLatencyMs: number;
  taskDuration: number;
  notificationEnabled: boolean;
  createdAt: number;
  lastCompletedAt?: number;
}

export interface PointRecord {
  id: string;
  timestamp: number;
  type: 'BONUS' | 'RANK_UP' | 'CLAIM_BONUS' | 'DAILY_BONUS' | 'PURCHASE' | 'FOCUS_BONUS' | 'REFERRAL' | 'SYSTEM' | 'REDEEM_PROTOCOL';
  amount: number;
  description: string;
}

export interface DiscoveryApp {
  id: string;
  name: string;
  icon: string;
  description: string;
  cost: number;
  trendScore: number; 
  activeUsers: string;
  officialUrl: string;
  category: 'MINING' | 'NODE' | 'SOCIAL';
  isPartner?: boolean;
}

export interface TrendingProject {
  name: string;
  count: number;
  icon?: string;
  votes?: number; 
}

export type MessageUrgency = 'NORMAL' | 'URGENT' | 'CRITICAL';
export type MessageType = 'BANNER' | 'APP' | 'MODAL' | 'SURVEY' | 'POD' | 'INTERCEPT';

export interface SystemMessage {
  id: string;
  type: MessageType;
  urgency: MessageUrgency;
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  referralCode?: string;
  isRead: boolean;
  createdAt: number;
  surveyOptions?: string[]; 
}

export interface Toast {
  id: string;
  message: string;
  type: 'SUCCESS' | 'ERROR' | 'INFO';
  duration?: number;
  action?: { label: string; onClick: () => void };
  count?: number;
  key?: string; // Used for merging
}

export type RewardType = 'PREMIUM' | 'POINTS' | 'RANK_ELITE';

export type ProtocolCode = PromoCode;
export type BroadcastType = MessageType;
export type BroadcastUrgency = MessageUrgency;
export type ProtocolRewardType = RewardType;

export interface PromoCode {
  id: string;
  code: string;
  reward: RewardType;
  rewardValue?: number; 
  maxClaims: number;
  currentClaims: number;
  isUsed: boolean; 
  expiryDate?: number; 
  createdAt: number;
}

export interface AnomalyReport {
  id: string;
  accountId: string;
  nickname: string;
  timestamp: number;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface AdminStats {
  totalUsers: number;
  activeLast24h: number;
  premiumUsers: number;
  isMaintenanceMode: boolean;
  protocols?: PromoCode[];
  surveyIntelligence?: any[];
  error?: string;
  sessionToken?: string;
  totalPoints?: number;
  recentAnomalies?: AnomalyReport[];
  flaggedAnomaliesCount?: number;
  trendingProjects?: TrendingProject[];
  success?: boolean;
  feedbackCount?: number;
  integrityScore?: number;
  shardLoads?: number[];
}

export interface UserState {
  accountId: string;       
  nickname: string;      
  hashedPin: string;     
  points: number;        
  adPoints: number;      
  referrals: number;     
  referredBy?: string;   
  referralCode: string;  
  usedCodes: string[];   
  isPremium: boolean;    
  isActivated: boolean;  
  joinedAt: number;      
  lastSyncAt: number;    
  lastSeenAt: number;    
  
  apps: AppIdentity[];
  tasks: Task[];
  pointHistory: PointRecord[];
  
  messages: SystemMessage[];
  theme: Theme;
  unlockedDiscoveryIds: string[];
  lastSeasonResetAt: number;
  analyticsUnlocked: boolean;
  notificationsEnabled: boolean;
  pushSubscription?: any; // Web Push Subscription Object
  rank: LifestyleRank;
  
  isAdmin?: boolean;
  unlockedTrendingSlots?: number;
  promoRegistry: PromoCode[];
  isDirty: boolean; 
  isInitialized: boolean;
  gasUrl?: string; 

  isMaintenanceMode?: boolean;
  trendingProjects?: TrendingProject[];
  adConsent: boolean;
  
  lastSparkAt?: number;
  lastBonusAt?: number;
  hasInstallBonus?: boolean;

  adminUnlockTaps?: number;
  pollActivity?: { id: string; choice: string; at: number }[];
  votedSurveys?: string[];
  
  // History for Undo feature
  history?: {
    lastDeletedApp?: AppIdentity;
    lastDeletedTasks?: Task[];
  };
}

export type AppView = 'DASHBOARD' | 'CREATE' | 'LAB' | 'SETTINGS' | 'FOCUS' | 'ECONOMY' | 'ADMIN' | 'ADMIN_AUTH' | 'GUIDE' | 'CONTACT';
