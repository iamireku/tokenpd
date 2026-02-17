import { AppIdentity, Task, AppStatus, LifestyleRank, UserState } from './types';

export const detectOS = (): 'ANDROID' | 'IOS' | 'WEB' => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  if (/android/i.test(userAgent)) return 'ANDROID';
  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) return 'IOS';
  return 'WEB';
};

export const isStandalone = (): boolean => {
  return (window.matchMedia('(display-mode: standalone)').matches) || ((window.navigator as any).standalone) || document.referrer.includes('android-app://');
};

/**
 * Converts a standard Google Drive share link into a direct image URL
 */
export const formatDriveUrl = (url: string): string => {
  if (!url || !url.includes('drive.google.com')) return url;
  const match = url.match(/\/d\/(.+?)\/(view|edit|usp)/) || url.match(/id=(.+?)(&|$)/);
  const fileId = match ? match[1] : null;
  return fileId ? `https://lh3.googleusercontent.com/u/0/d/${fileId}` : url;
};

export const getPersistentVault = (state: any): Partial<UserState> => {
  const persistentKeys = [
    'accountId', 'nickname', 'hashedPin', 'points', 'adPoints', 
    'referrals', 'referredBy', 'referralCode', 'usedCodes', 
    'isPremium', 'isActivated', 'joinedAt', 'lastSyncAt', 'lastSeenAt',
    'apps', 'tasks', 'pointHistory', 'messages', 'theme', 
    'unlockedDiscoveryIds', 'lastSeasonResetAt', 'analyticsUnlocked', 
    'notificationsEnabled', 'pushSubscription', 'rank', 'promoRegistry',
    'isMaintenanceMode', 'trendingProjects', 'adConsent', 'lastSparkAt', 
    'lastBonusAt', 'hasInstallBonus', 'adminUnlockTaps', 'pollActivity', 'votedSurveys'
  ];

  return Object.keys(state)
    .filter(key => persistentKeys.includes(key))
    .reduce((obj: any, key) => {
      obj[key] = state[key];
      return obj;
    }, {});
};

export const getPodLimit = (rank: LifestyleRank, isPremium: boolean): number => {
  if (isPremium || rank === LifestyleRank.VISIONARY) return Infinity;
  if (rank === LifestyleRank.ELITE) return 32;
  if (rank === LifestyleRank.PRO) return 16;
  return 8;
};

export const hasPremiumBenefits = (isPremium: boolean, rank: LifestyleRank): boolean => {
  return isPremium || rank === LifestyleRank.VISIONARY;
};

export function stableStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return '[' + obj.map(item => stableStringify(item)).join(',') + ']';
  }

  const sortedKeys = Object.keys(obj)
    .filter(k => obj[k] !== undefined && k !== '_sig' && k !== '_ts')
    .sort();

  const result = sortedKeys.map(key => {
    const value = obj[key];
    return JSON.stringify(key) + ':' + stableStringify(value);
  });

  return '{' + result.join(',') + '}';
}

export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function generateSignature(payload: any, secret: string, timestamp: number): Promise<string> {
  const salt = "tokenpod-secure-v6"; 
  const payloadStr = stableStringify(payload);
  const message = `${payloadStr}:${timestamp}:${secret}:${salt}`;
  return await sha256(message);
}

export const triggerHaptic = (style: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
  if (!window.navigator || !window.navigator.vibrate) return;
  const patterns = { 
    light: [10], 
    medium: [25], 
    heavy: [60],
    success: [10, 30, 10],
    error: [50, 20, 50]
  };
  window.navigator.vibrate(patterns[style]);
};

/**
 * Synthesizes a feedback blip using Web Audio API
 */
export const playFeedbackSound = (type: 'harvest' | 'uplink' | 'click' = 'click') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'harvest') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1); // E6
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'uplink') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.02);
      osc.start(now);
      osc.stop(now + 0.02);
    }
  } catch (e) {
    console.warn("Audio feedback failed", e);
  }
};

export const exportVault = (state: any) => {
  const vault = getPersistentVault(state);
  const data = JSON.stringify(vault, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tokenpod_backup_${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const fetchAppIcon = async (name: string): Promise<string> => {
  if (!name || name === 'NEW APP') return `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`;
  try {
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(name)}&entity=software&limit=1`);
    const data = await response.json();
    if (data.results && data.results.length > 0) return data.results[0].artworkUrl100.replace('100x100bb', '512x512bb');
  } catch (error) { console.warn("Icon Fetch failed:", error); }
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`;
};

export const getSmartLaunchUrl = (name: string): string => {
  const os = detectOS();
  const query = encodeURIComponent(name);
  if (os === 'ANDROID') return `https://play.google.com/store/search?q=${query}&c=apps`;
  if (os === 'IOS') return `https://www.google.com/search?q=site:apps.apple.com+${query}`;
  return `https://www.google.com/search?q=${query}+app+official+site`;
};

export const calculateNextDueAt = (task: Partial<Task>, fromTime: number = Date.now()): number => {
  const hours = task.customHours ?? 24;
  const mins = task.customMinutes ?? 0;
  const durationMs = (hours * 3600000) + (mins * 60000);
  
  if (task.frequency === 'FIXED_DAILY') {
    const d = new Date(fromTime);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    return d.getTime();
  }
  if (task.frequency === 'WINDOW') {
    const d = new Date(fromTime);
    d.setHours(0, 0, 0, 0);
    const safeDuration = Math.max(durationMs, 60000);
    while (d.getTime() <= fromTime) d.setTime(d.getTime() + safeDuration);
    return d.getTime();
  }
  return fromTime + durationMs;
};

export const getTaskStatus = (task: Task, now: number): AppStatus => {
  const diff = task.nextDueAt - now;
  if (diff <= 0) return AppStatus.READY;
  if (diff < 300000) return AppStatus.URGENT; 
  return AppStatus.ACTIVE;
};

export const getAppStatus = (appId: string, tasks: Task[], now: number): AppStatus => {
  const appTasks = tasks.filter(t => t.appId === appId);
  if (appTasks.length === 0) return AppStatus.ACTIVE;
  const statuses = appTasks.map(t => getTaskStatus(t, now));
  if (statuses.includes(AppStatus.READY)) return AppStatus.READY;
  if (statuses.includes(AppStatus.URGENT)) return AppStatus.URGENT;
  return AppStatus.ACTIVE;
};

export const getStatusColor = (status: AppStatus): string => {
  switch (status) {
    case AppStatus.READY: return 'var(--status-ready)';
    case AppStatus.URGENT: return 'var(--status-urgent)';
    default: return 'var(--status-active)';
  }
};

export const calculateYieldVelocity = (tasks: Task[], isPremium: boolean, rank: LifestyleRank, hasInstallBonus: boolean = false): number => {
  if (tasks.length === 0) return 0;
  let multiplier = hasPremiumBenefits(isPremium, rank) ? 2 : 1;
  if (hasInstallBonus) multiplier *= 1.05;
  return tasks.reduce((acc, task) => {
    const cycleHours = (task.customHours || 24) + (task.customMinutes || 0) / 60;
    return acc + (24 / cycleHours) * multiplier;
  }, 0);
};

export const getReadinessDistribution = (tasks: Task[], now: number): number[] => {
  const buckets = Array(12).fill(0);
  tasks.forEach(task => {
    const diffHours = (task.nextDueAt - now) / 3600000;
    if (diffHours >= 0 && diffHours < 12) buckets[Math.floor(diffHours)]++;
  });
  return buckets;
};

export const formatTimeLeft = (ms: number): string => {
  if (ms <= 0) return 'Ready';
  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  const secs = Math.floor((ms % 60000) / 1000);

  if (hours > 0) return `${hours}h ${mins}m`;
  if (ms < 300000) { 
    return `${mins}m ${secs}s`;
  }
  return `${mins}m`;
};

export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

export const getRankForPoints = (points: number): LifestyleRank => {
  if (points >= 1000) return LifestyleRank.VISIONARY;
  if (points >= 500) return LifestyleRank.ELITE;
  if (points >= 100) return LifestyleRank.PRO;
  return LifestyleRank.MEMBER;
};

export const calculatePointDecay = (points: number): number => Math.floor(points * 0.9);
export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getAverageEfficiency = (tasks: Task[]): number => {
  if (tasks.length === 0) return 100;
  const validTasks = tasks.filter(t => t.lastCompletedAt !== undefined);
  if (validTasks.length === 0) return 100;
  const sum = validTasks.reduce((acc, t) => acc + (t.efficiency || 100), 0);
  return Math.round(sum / validTasks.length);
};

export const getDaysUntilSeasonEnd = (): number => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const diffTime = Math.abs(nextMonth.getTime() - now.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
