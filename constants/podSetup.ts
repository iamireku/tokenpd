
export type CreationStep = 'IDENTITY' | 'TIMER';
export type LaunchMode = 'SMART' | 'TELEGRAM' | 'URL';

export const PRESETS = [
  { label: '1H', h: 1 },
  { label: '2H', h: 2 },
  { label: '4H', h: 4 },
  { label: '8H', h: 8 },
  { label: '12H', h: 12 },
  { label: '24H', h: 24 },
  { label: '48H', h: 48 },
];

export const SMART_SIGNALS: Record<string, { h: number, m: number, d: number, freq: 'FIXED_DAILY' | 'SLIDING' | 'WINDOW', label: string, tg?: string, url?: string }> = {
  'PI NETWORK': { d: 1, h: 0, m: 0, freq: 'SLIDING', label: 'MINING SESSION' },
  'BEE NETWORK': { d: 1, h: 0, m: 0, freq: 'SLIDING', label: 'MINING SESSION' },
  'ICE NETWORK': { d: 1, h: 0, m: 0, freq: 'SLIDING', label: 'SNOWSTAKE SESSION' },
  'NOTCOIN': { d: 0, h: 0, m: 30, freq: 'WINDOW', label: 'TAP COOLDOWN', tg: 'notcoin_bot' },
  'GRASS': { d: 0, h: 0, m: 0, freq: 'FIXED_DAILY', label: 'EPOCH SYNC' },
  'AVIVE': { d: 0, h: 1, m: 0, freq: 'WINDOW', label: 'VV-MINING SESSION' },
  'NODLE': { d: 0, h: 1, m: 0, freq: 'SLIDING', label: 'NETWORK HARVEST' },
  'XENEA': { d: 1, h: 0, m: 0, freq: 'SLIDING', label: 'NODE OPERATION' },
  'HAMSTER KOMBAT': { d: 0, h: 3, m: 0, freq: 'SLIDING', label: 'ENERGY RECOVERY', tg: 'hamster_kombat_bot' },
  'TAPSWAP': { d: 0, h: 0, m: 30, freq: 'WINDOW', label: 'TAP COOLDOWN', tg: 'tapswap_bot' },
  'YESCOIN': { d: 0, h: 0, m: 30, freq: 'WINDOW', label: 'SWIPE RECHARGE', tg: 'theYescoinBot' },
  'CATIZEN': { d: 0, h: 1, m: 0, freq: 'SLIDING', label: 'AIRDROP FARMING', tg: 'catizenbot' },
  'BLUM': { d: 0, h: 0, m: 20, freq: 'WINDOW', label: 'FARMING SESSION', tg: 'BlumCryptoBot' },
  'X EMPIRE': { d: 0, h: 3, m: 0, freq: 'SLIDING', label: 'PROFIT RECOVERY', tg: 'empirebot' },
  'MEMEFI': { d: 0, h: 1, m: 0, freq: 'WINDOW', label: 'BOSS COOLDOWN', tg: 'memefi_coin_bot' },
  'W-COIN': { d: 0, h: 0, m: 0, freq: 'FIXED_DAILY', label: 'DAILY YIELD CLAIM', tg: 'wcoin_tapbot' },
  'PIXELTAP': { d: 0, h: 2, m: 0, freq: 'SLIDING', label: 'BATTLE ENERGY', tg: 'pixelverse_xyz_bot' },
  'TIME STOPE': { d: 1, h: 0, m: 0, freq: 'SLIDING', label: 'TIME WITNESSING' },
  'SATOSHI APP': { d: 1, h: 0, m: 0, freq: 'SLIDING', label: 'CORE MINING SESSION' },
  'TENAZ': { d: 1, h: 0, m: 0, freq: 'SLIDING', label: 'CLOUD MINING RENEWAL' },
  'SPURPROTOCOL': { d: 1, h: 0, m: 0, freq: 'SLIDING', label: 'QUIZ SYNC' },
  'SYNTAX VERSE': { d: 0, h: 0, m: 0, freq: 'FIXED_DAILY', label: 'LEARN-TO-EARN MINT' },
  'ROLLERCOIN': { d: 0, h: 0, m: 0, freq: 'FIXED_DAILY', label: 'VIRTUAL RACK SYNC' },
  'STEPN': { d: 1, h: 0, m: 0, freq: 'SLIDING', label: 'MOVE ENERGY REFILL' },
  'SWEATCOIN': { d: 1, h: 0, m: 0, freq: 'SLIDING', label: 'DAILY STEP HARVEST' },
  'TAPTOPIA': { d: 0, h: 0, m: 30, freq: 'WINDOW', label: 'TAP EXPEDITION' },
  'DIG IT': { d: 1, h: 0, m: 0, freq: 'SLIDING', label: 'TON MINING SESSION' },
  'WALKEN': { d: 1, h: 0, m: 0, freq: 'SLIDING', label: 'WLKN BERRY COOLDOWN' },
  'CRYPTOTAB': { d: 0, h: 0, m: 0, freq: 'FIXED_DAILY', label: 'HASHING SESSION' }
};
