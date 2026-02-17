# TokenPod | Smart Earning Assistant
> **Version 6.9 "Point Reform"**  
> *A high-performance, cloud-synced dashboard for managing Web3 mining cycles and daily rewards.*

---

## 🚀 Overview
TokenPod is a smart utility designed for reward hunters. It simplifies the management of multiple earning signals (Pi Network, Bee, Node mining, etc.) into a single, secure, and fast PWA interface.

### Core Philosophy
- **Speed First**: Local-first UX with background Master Database synchronization.
- **Privacy Centric**: No emails, no passwords, no private keys. Identity is strictly `Nickname + 4-Digit PIN`.
- **Verified Systems**: Sharded ledger architecture ensures data integrity and scalability across 20 database segments.

---

## 🛠 Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: Google Apps Script (GAS) – Sharded Architecture (20 Segments).
- **Infrastructure**: Vercel (Hosting), Serverless Proxy (`api/proxy.js`).
- **Security**: HMAC SHA-256 Request Signing, Local-device Hashing.

---

## 🔒 Security Protocols

### 1. Identity & Recovery
TokenPod+ uses a **Vault Identity** model. Users register with a Nickname and a 4-digit PIN. 
- The PIN is hashed using **SHA-256** locally before transmission.
- The actual PIN is never stored in the database.

### 2. HMAC Request Signing
Every economic or sensitive action (`CLAIM_POD`, `DAILY_BONUS`, `PURCHASE_UNLOCK`) requires a signature (`_sig`) and a timestamp (`_ts`).
- **Secret Hierarchy**: Signing uses the `hashedPin` for users and a `sessionToken` for admins.
- **Signature Matching**: The backend reconstructs the payload string to verify the HMAC signature before writing data.

---

## 📂 Backend Deployment (MANDATORY)
The backend is modularized into 7 files to prevent Google Apps Script size limits and maintain clean logic.

### Deployment Steps:
1.  Go to [script.google.com](https://script.google.com).
2.  Create 7 files with the **exact** names found in the `/backend` folder:
    - `Main.gs`
    - `Security.gs`
    - `Database.gs`
    - `Core.gs`
    - `Economy.gs`
    - `Admin.gs`
    - `Notifications.gs`
3.  Copy the code from the local project into these files.
4.  **Deploy** > **New Deployment** > **Web App**.
5.  Set `Execute as: Me` and `Who has access: Anyone`.
6.  Copy the **Web App URL**.

---

## 🌐 Production Hosting (Vercel)
TokenPod is optimized for Vercel using a serverless proxy to bypass CORS and manage environment variables securely.

### Environment Variables
Add these to your Vercel Project Settings:
- `GAS_SCRIPT_URL`: Your Google Apps Script Web App URL.

### The Proxy
The `api/proxy.js` function forwards client requests to the Ledger. This allows you to update your backend URL in the Vercel Dashboard without changing frontend code.

---

## 💎 Features & Logic (v6.9)

### 1. Pod Management (The "One Pod" Rule)
Multiple signals for the same project are merged into one container. A "Pi Network" Pod can track "Mining," "Node," and "Ambassador" timers individually within one card.

### 2. Focus Mode (The Harvest Chain)
Enables rapid-fire claiming.
- **GapStop Protocol**: Enforces a 10-second sync window per claim to ensure database stability.
- **Standby Mode**: Pulses in a radar view when the queue is empty, waiting for the next signal.

### 3. Points Economy
- **v6.9 Reform**: Standard app claims (`CLAIM_POD`) reset timers but grant **0P**. 
- **Earning**: Points are exclusively earned via `DAILY_BONUS`, `IGNITE_SPARK` (Growth Lab), and `REDEEM_PROTOCOL`.
- **Decay**: 10% point reduction at the start of every month to keep the economy active.

### 4. Growth Lab
- **Global Pulse**: Real-time trending data aggregated from all 20 shards.
- **Verified Signals**: Distinguishes between vetted partners (`ShieldCheck`) and external community projects (`AlertTriangle`).

---

## 👨‍✈️ Admin Command Center
Accessible via a secret tap sequence on the primary logo (Default: 5 taps).
- **Network Map**: Visualize load across the 20 database shards.
- **Economy Control**: Inject points or terminate malicious sessions.
- **Broadcast System**: Push global notifications to all user dashboards.

---

## 📜 License
Personal and Private Use Only. 

*TokenPod | Simple. Fast. Verified.*