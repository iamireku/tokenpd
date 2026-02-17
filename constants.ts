
import { DiscoveryApp } from './types';

/**
 * TokenPod Client Constants
 * Production Lockdown v6.4.0
 */

export const APP_ID = 'tokenpod_plus_v6';
export const CLIENT_VERSION = '6.4.0';

/**
 * Security Constants
 */
export const PUBLIC_GUEST_SECRET = 'tp-public-signal-v1';

/**
 * Web Push (VAPID) Public Key
 */
export const VAPID_PUBLIC_KEY = 'BBMOhvUJMpiHCBlyuitWOou4wRpofbsQVafJ74RGbGyYwV71w-d2KP5C_HxgLTI73v8ffZLXBz5kW5PsFXOOJ_4';

/**
 * Storage Keys
 */
export const STORAGE_KEY = `${APP_ID}_vault_state`;
export const CONNECTION_KEY = `${APP_ID}_vault_config`;

/**
 * Network Configuration
 * Points to the Vercel/Vite Proxy endpoint
 */
export const MASTER_UPLINK = '/api/proxy';

/**
 * Timing (ms)
 */
export const SPARK_COOLDOWN = 24 * 60 * 60 * 1000; // 24h
export const SEASON_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export const DISCOVERY_HUB_APPS: ReadonlyArray<DiscoveryApp> = Object.freeze([
  {
    id: 'd-pi',
    name: 'PI NETWORK',
    icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/37/8a/75/378a75e3-9993-9c86-13d7-626a57508492/AppIcon-0-0-1x_U007emarketing-0-5-0-0-85-220.png/512x512bb.png',
    description: 'First mobile mining blockchain. Verified Partner Signal.',
    cost: 50,
    trendScore: 98,
    activeUsers: '55M+',
    officialUrl: 'https://minepi.com',
    category: 'MINING',
    isPartner: true
  },
  {
    id: 'd-bee',
    name: 'BEE NETWORK',
    icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/91/7a/20/917a206a-9a9f-8557-017e-97621980004c/AppIcon-0-0-1x_U007emarketing-0-0-0-10-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/512x512bb.png',
    description: 'Gamified mining for social rewards. Verified Partner Signal.',
    cost: 50,
    trendScore: 88,
    activeUsers: '28M+',
    officialUrl: 'https://bee.com',
    category: 'MINING',
    isPartner: true
  },
  {
    id: 'd-xenea',
    name: 'XENEA NODE',
    icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/64/0e/96/640e9603-9112-9c32-1594-555621455219/AppIcon-0-0-1x_U007emarketing-0-6-0-0-85-220.png/512x512bb.png',
    description: 'High-potential L1 node mining project. Verified Partner Signal.',
    cost: 100,
    trendScore: 74,
    activeUsers: '150K+',
    officialUrl: 'https://xenea.net',
    category: 'NODE',
    isPartner: true
  }
]);
