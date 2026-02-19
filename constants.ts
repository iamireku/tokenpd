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
 * REPLACE THE STRING BELOW WITH YOUR ACTUAL PUBLIC KEY GENERATED FROM YOUR VAPID PROVIDER
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

/**
 * Discovery Hub Fallback Signals
 */
export const DISCOVERY_HUB_APPS: DiscoveryApp[] = [
  {
    id: 'd1',
    name: 'PI NETWORK',
    icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/31/45/ae/3145ae77-0c87-5456-00fe-656c1f6f925c/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/200x200ia-75.webp',
    description: 'First digital currency you can mine on your phone.',
    cost: 0,
    trendScore: 98,
    activeUsers: '55M+',
    officialUrl: 'https://minepi.com',
    category: 'MINING'
  },
  {
    id: 'd2',
    name: 'BEE NETWORK',
    icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/91/7a/20/917a206a-9a9f-8557-017e-97621980004c/AppIcon-0-0-1x_U007emarketing-0-0-0-10-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/512x512bb.png',
    description: 'Phone-based crypto mining network.',
    cost: 0,
    trendScore: 85,
    activeUsers: '24M+',
    officialUrl: 'https://bee.com',
    category: 'MINING'
  }
];