# Hotel Booking App

A complete hotel booking system with three apps in one repository:

| App | Folder | Stack | What it does |
| --- | --- | --- | --- |
| API server | `server/` | Node.js, Express, MongoDB, Stripe, Cloudinary | Hotels, rooms, bookings, payments, reviews, auth and admin endpoints |
| Mobile app | `mobile/` | Expo / React Native, React Navigation, Redux Toolkit | Guest booking flow and role-aware admin screens |
| Admin panel | `admin/` | React, Vite, Tailwind CSS | Web dashboard for managing hotels, rooms, bookings and users |

## အကျဉ်း — ဒီ project က ဘာလဲ? (At a glance)

| | |
| --- | --- |
| **Project** | Hotel Booking App |
| **အမျိုးအစား** | Full-stack hotel booking system — repo ထဲမှာ app ၃ ခု (API + mobile + web admin) |
| **ဘာလုပ်ပေးလဲ** | Hotel/room/booking စီမံ, ငွေပေးချေမှု မှတ်တမ်း, review, auth နဲ့ role အလိုက် admin dashboard, guest အတွက် ခန်းယူ flow |
| **Tech** | Node.js + Express + MongoDB · Expo / React Native + Redux Toolkit · React + Vite + Tailwind · Stripe + Cloudinary (optional) |
| **Ports** | API `5000` · Admin web `5173` · Mobile Expo (QR / a / i / w) |
| **Demo login** | `admin@test.com` / `staff@test.com` / `guest@test.com` — password တူညီ **`123456`** |
| **အခြေအနေ** | Seeded demo data (hotel ၃, အခန်း ၃၀, booking ၃) ။ တကယ့် Stripe/Cloudinary key မပါပါ — test mode ပဲ သုံးပါ။ |

**In short (English):** A complete hotel booking system with three apps in one repo: an Express/MongoDB API, an Expo/React Native guest+admin mobile app, and a React/Vite admin dashboard. Handles hotels, rooms, bookings, payments, reviews and role-based access. Demo accounts are included; no real payment or cloud credentials.

## Quick start

You need **Node.js 18+**, **npm**, and a running **MongoDB** (local or Atlas).

```bash
# 1. Install dependencies for all three apps (from the repository root)
npm run install:all

# 2. Configure the server
cd server
cp .env.example .env          # Windows: copy .env.example .env
# edit .env: MONGODB_URI, JWT_SECRET, and (optionally) Cloudinary / Stripe keys

# 3. Start the API (port 5000 by default)
npm run dev

# 4. Load demo data (in a second terminal, from server/)
npm run seed

# 5. Start the web admin panel (third terminal, from repository root)
npm run dev:admin            # http://localhost:5173

# 6. Start the mobile app (fourth terminal, from repository root)
npm run start:mobile         # then press a / i / w, or scan the QR with Expo Go
```

You can also run each app directly:

```bash
cd server  && npm install && npm run dev    # API
cd mobile  && npm install && npm start      # Expo
cd admin   && npm install && npm run dev    # Vite admin
```

## Demo logins

The seed script creates these accounts (password is `123456` for all three):

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@test.com` | `123456` |
| Staff | `staff@test.com` | `123456` |
| Guest | `guest@test.com` | `123456` |

Seed data also includes **3 hotels**, **30 rooms**, **8 amenities** and **3 bookings**.

## Where to read more

- [DOCUMENTATION.md](DOCUMENTATION.md) — the full guide: architecture, schemas, every endpoint with request/response examples, business logic, configuration, seeding, troubleshooting and admin panel notes.
- [PROJECT_TREE.md](PROJECT_TREE.md) — complete folder tree with a purpose for every important file.
- [server/.env.example](server/.env.example) — every backend environment variable.
- [admin/.env.example](admin/.env.example) — the admin panel API URL.

## A note about secrets

All `.env` files in this repository are **examples only**. No real secrets, live Stripe keys, Cloudinary credentials or production database passwords are included. Copy an example to `.env` and fill in your own values; `.env` files are git-ignored. For local payments, use **Stripe test mode** keys only.
