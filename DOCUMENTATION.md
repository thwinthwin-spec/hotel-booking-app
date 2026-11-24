# Hotel Booking App — Full Documentation

This is the single reference for the whole project: a MongoDB-backed Express REST API, an Expo/React Native mobile app, and a React + Vite + Tailwind admin panel. Every file path in this document is relative to `hotel-booking-app/`.

> **Read this first:** [README.md](README.md) for a five-minute quick start, and [PROJECT_TREE.md](PROJECT_TREE.md) for the canonical file-by-file tree.

---

## Contents

| Part | Topic |
| --- | --- |
| [1](#part-1--project-structure) | Project structure and file purposes |
| [2](#part-2--data-models-and-schemas) | Data models and schemas |
| [3](#part-3--api-reference) | API reference — every endpoint |
| [4](#part-4--middleware) | Middleware map |
| [5](#part-5--business-logic) | Business logic (availability, pricing, statuses, auto-cancel) |
| [6](#part-6--configuration-and-scripts) | Configuration, environment variables and scripts |
| [10](#part-10--mobile-api-services) | Mobile API services |
| [11](#part-11--mobile-components) | Mobile components |
| [12](#part-12--mobile-utilities-and-state) | Mobile utilities and state |
| [13](#part-13--seed-data) | Seed data |
| [14](#part-14--setup-and-troubleshooting) | Setup and common errors |
| [15](#part-15--admin-web-panel) | Admin web panel |

Parts 7–9 are intentionally not used: client-side screens, navigation and validation are folded into Parts 10–12 to keep this document readable.

---

## Architecture at a glance

```text
Mobile (Expo)  ──┐
                 ├─→  Express REST API  ─→  MongoDB
Admin (Vite)   ──┘         │
                           ├─→  Cloudinary  (room images)
                           ├─→  Stripe      (card intents + webhook)
                           └─→  Nodemailer  (booking / cancellation email)
```

All three apps talk to the API over HTTP. The API base URL is `http://localhost:5000/api` by default. The mobile app uses `10.0.2.2` for the Android emulator; the admin panel uses `localhost:5173` as its dev origin. Authentication is a JWT returned by `POST /api/auth/register` or `POST /api/auth/login`, sent as `Authorization: Bearer <token>`.

---

## Part 1 — Project structure

### 1.1 Folder tree

```text
hotel-booking-app/
├── server/
│   ├── config/
│   │   ├── cloudinary.js
│   │   ├── db.js
│   │   ├── email.js
│   │   └── stripe.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── booking.controller.js
│   │   ├── hotel.controller.js
│   │   ├── payment.controller.js
│   │   ├── review.controller.js
│   │   ├── room.controller.js
│   │   └── admin.controller.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── notFound.js
│   │   ├── role.js
│   │   ├── upload.js
│   │   └── validate.js
│   ├── models/
│   │   ├── Amenity.js
│   │   ├── Booking.js
│   │   ├── Hotel.js
│   │   ├── Payment.js
│   │   ├── Review.js
│   │   ├── Room.js
│   │   └── User.js
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── auth.routes.js
│   │   ├── booking.routes.js
│   │   ├── hotel.routes.js
│   │   ├── index.js
│   │   ├── payment.routes.js
│   │   ├── review.routes.js
│   │   └── room.routes.js
│   ├── utils/
│   │   ├── autoCancel.js
│   │   ├── dateHelper.js
│   │   ├── email.js
│   │   ├── generateToken.js
│   │   └── priceCalculator.js
│   ├── seed/
│   │   └── seedData.js
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   └── server.js
├── mobile/
│   ├── src/
│   │   ├── api/
│   │   │   ├── authApi.js
│   │   │   ├── axios.js
│   │   │   ├── bookingApi.js
│   │   │   ├── hotelApi.js
│   │   │   ├── paymentApi.js
│   │   │   └── roomApi.js
│   │   ├── components/
│   │   │   ├── BookingCard.js
│   │   │   ├── Button.js
│   │   │   ├── DateRangePicker.js
│   │   │   ├── EmptyState.js
│   │   │   ├── Header.js
│   │   │   ├── HotelCard.js
│   │   │   ├── InputField.js
│   │   │   ├── Loader.js
│   │   │   ├── RoomCard.js
│   │   │   └── StarRating.js
│   │   ├── navigation/
│   │   │   ├── AppNavigator.js
│   │   │   ├── AuthStack.js
│   │   │   ├── BookingStack.js
│   │   │   └── MainTabs.js
│   │   ├── redux/
│   │   │   ├── authSlice.js
│   │   │   ├── bookingSlice.js
│   │   │   ├── roomSlice.js
│   │   │   └── store.js
│   │   ├── screens/
│   │   │   ├── auth/
│   │   │   │   ├── LoginScreen.js
│   │   │   │   ├── RegisterScreen.js
│   │   │   │   └── SplashScreen.js
│   │   │   ├── home/
│   │   │   │   ├── HomeScreen.js
│   │   │   │   ├── HotelDetailScreen.js
│   │   │   │   ├── HotelListScreen.js
│   │   │   │   └── RoomDetailScreen.js
│   │   │   ├── booking/
│   │   │   │   ├── BookingScreen.js
│   │   │   │   ├── BookingDetailScreen.js
│   │   │   │   ├── MyBookingsScreen.js
│   │   │   │   └── PaymentScreen.js
│   │   │   ├── profile/
│   │   │   │   ├── EditProfileScreen.js
│   │   │   │   └── ProfileScreen.js
│   │   │   └── admin/
│   │   │       ├── AdminDashboardScreen.js
│   │   │       ├── ManageBookingsScreen.js
│   │   │       └── ManageRoomsScreen.js
│   │   └── utils/
│   │       ├── constants.js
│   │       ├── formatters.js
│   │       └── validators.js
│   ├── App.js
│   ├── app.json
│   ├── babel.config.js
│   ├── package.json
│   └── .npmrc
├── admin/
│   ├── src/
│   │   ├── api/
│   │   │   ├── authApi.js
│   │   │   ├── axios.js
│   │   │   ├── bookingApi.js
│   │   │   ├── hotelApi.js
│   │   │   ├── roomApi.js
│   │   │   └── userApi.js
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── Table.jsx
│   │   └── pages/
│   │       ├── BookingsPage.jsx
│   │       ├── DashboardPage.jsx
│   │       ├── HotelsPage.jsx
│   │       ├── LoginPage.jsx
│   │       ├── RoomsPage.jsx
│   │       └── UsersPage.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── dist/                    # generated by `npm run build`
│   │   ├── index.html
│   │   └── assets/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── README.md
│   ├── tailwind.config.js
│   └── vite.config.js
├── .gitignore
├── README.md
├── DOCUMENTATION.md
├── PROJECT_TREE.md
├── make-zip.ps1
└── package.json
```

### 1.2 File purpose summary

The exhaustive, folder-grouped purpose table is in [PROJECT_TREE.md](PROJECT_TREE.md). The summary below is the quick map.

| Folder | Key files | Purpose |
| --- | --- | --- |
| `server/config/` | `db.js`, `cloudinary.js`, `stripe.js`, `email.js` | Third-party clients and MongoDB connection |
| `server/controllers/` | `*.controller.js` | Request handling, validation-adjacent checks, response shaping |
| `server/middleware/` | `auth.js`, `role.js`, `upload.js`, `validate.js`, `errorHandler.js`, `notFound.js` | Cross-cutting request processing |
| `server/models/` | `User.js`, `Hotel.js`, `Room.js`, `Booking.js`, `Payment.js`, `Review.js`, `Amenity.js` | Mongoose schemas and indexes |
| `server/routes/` | `*.routes.js`, `index.js` | URL-to-controller mapping under `/api` |
| `server/utils/` | `priceCalculator.js`, `dateHelper.js`, `autoCancel.js`, `email.js`, `generateToken.js` | Shared domain logic and jobs |
| `server/seed/` | `seedData.js` | Demo data generator |
| `server/` | `server.js`, `.env.example`, `package.json` | App bootstrap and configuration template |
| `mobile/src/api/` | `axios.js`, `*Api.js` | Typed API calls and token interceptor |
| `mobile/src/components/` | `Button.js`, `HotelCard.js`, `RoomCard.js`, `BookingCard.js`, … | Reusable UI |
| `mobile/src/screens/` | `auth/`, `home/`, `booking/`, `profile/`, `admin/` | One screen per route |
| `mobile/src/navigation/` | `AppNavigator.js`, `AuthStack.js`, `BookingStack.js`, `MainTabs.js` | React Navigation stacks and role guards |
| `mobile/src/redux/` | `store.js`, `authSlice.js`, `bookingSlice.js`, `roomSlice.js` | Global client state |
| `mobile/src/utils/` | `constants.js`, `formatters.js`, `validators.js` | Design tokens, formatting, client validation |
| `mobile/` | `App.js`, `app.json`, `babel.config.js`, `package.json` | Expo entry point and config |
| `admin/src/api/` | `axios.js`, `*Api.js` | Axios instance with JWT interceptor + per-resource calls |
| `admin/src/components/` | `Layout.jsx`, `ProtectedRoute.jsx`, `Table.jsx`, `Modal.jsx`, `StatCard.jsx` | Admin shell and shared widgets |
| `admin/src/pages/` | `LoginPage.jsx`, `DashboardPage.jsx`, `HotelsPage.jsx`, `RoomsPage.jsx`, `BookingsPage.jsx`, `UsersPage.jsx` | Web admin routes |
| `admin/` | `index.html`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `.env.example` | Vite/Tailwind build configuration |

---

## Part 2 — Data models and schemas

The **complete Mongoose source lives in `server/models/*.js`** (one file per model). The tables below are a quick reference; field names, enums and indexes mirror those files exactly. All schemas use `{ timestamps: true }`, so every document has `createdAt` and `updatedAt`.

### 2.1 `User` — `server/models/User.js`

| Field | Type | Required | Default | Enum / notes | Ref | Index |
| --- | --- | --- | --- | --- | --- | --- |
| `name` | String | Yes | — | trimmed | — | — |
| `email` | String | Yes | — | lowercase, trimmed | — | `unique`, `index` |
| `password` | String | Yes | — | **always bcrypt-hashed**; stripped by `toJSON` | — | — |
| `phone` | String | No | `''` | trimmed | — | — |
| `role` | String | No | `'guest'` | `guest`, `staff`, `admin` | — | `index` |
| `avatar` | String | No | `''` | URL | — | — |
| `isActive` | Boolean | No | `true` | inactive users cannot log in | — | — |

```json
{
  "_id": "665f1a2b8c9d4e0012345678",
  "name": "Guest One",
  "email": "guest@test.com",
  "password": "$2a$10$...(bcrypt hash)...",
  "phone": "0912345678",
  "role": "guest",
  "avatar": "",
  "isActive": true,
  "createdAt": "2026-06-03T10:00:00.000Z",
  "updatedAt": "2026-06-03T10:00:00.000Z"
}
```

> Responses **never** include `password`: `userSchema.methods.toJSON` deletes it, and controllers additionally use `.select('-password')`.

### 2.2 `Hotel` — `server/models/Hotel.js`

| Field | Type | Required | Default | Enum / notes | Ref | Index |
| --- | --- | --- | --- | --- | --- | --- |
| `name` | String | Yes | — | trimmed | — | `index` |
| `description` | String | No | `''` | — | — | — |
| `address` | String | No | `''` | — | — | — |
| `city` | String | No | `''` | used by `?city=` filter | — | `index` |
| `country` | String | No | `''` | — | — | — |
| `images` | [String] | No | `[]` | URLs | — | — |
| `rating` | Number | No | `0` | `min: 0`, `max: 5` | — | — |
| `amenities` | [ObjectId] | No | `[]` | — | `Amenity` | — |
| `contact.phone` | String | No | `''` | nested object | — | — |
| `contact.email` | String | No | `''` | nested object | — | — |
| `createdBy` | ObjectId | No | — | admin who created it | `User` | — |

```json
{
  "_id": "665f1a2b8c9d4e0012345679",
  "name": "Aureum Yangon Hotel",
  "description": "Comfortable stay in the heart of Yangon.",
  "address": "12 Bogyoke Road",
  "city": "Yangon",
  "country": "Myanmar",
  "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200"],
  "rating": 4.5,
  "amenities": ["665f1a2b8c9d4e0012345680"],
  "contact": { "phone": "+95 1 234 567", "email": "yangon@aureum.test" },
  "createdBy": "665f1a2b8c9d4e0012345677",
  "createdAt": "2026-06-03T10:00:00.000Z",
  "updatedAt": "2026-06-03T10:00:00.000Z"
}
```

### 2.3 `Room` — `server/models/Room.js`

| Field | Type | Required | Default | Enum / notes | Ref | Index |
| --- | --- | --- | --- | --- | --- | --- |
| `hotel` | ObjectId | Yes | — | parent hotel | `Hotel` | `index` |
| `roomNumber` | String | Yes | — | trimmed; unique **within** a hotel | — | compound with `hotel` |
| `type` | String | No | `'single'` | `single`, `double`, `suite`, `deluxe` | — | — |
| `pricePerNight` | Number | Yes | — | `min: 0` | — | — |
| `capacity.adults` | Number | No | `1` | `min: 0` | — | — |
| `capacity.children` | Number | No | `0` | `min: 0` | — | — |
| `amenities` | [ObjectId] | No | `[]` | — | `Amenity` | — |
| `images` | [String] | No | `[]` | Cloudinary `secure_url` values | — | — |
| `totalRooms` | Number | No | `1` | `min: 1` (inventory count) | — | — |
| `isAvailable` | Boolean | No | `true` | manual on/off switch | — | — |
| `description` | String | No | `''` | — | — | — |

Unique compound index: `{ hotel: 1, roomNumber: 1 }`.

```json
{
  "_id": "665f1a2b8c9d4e0012345681",
  "hotel": "665f1a2b8c9d4e0012345679",
  "roomNumber": "101",
  "type": "deluxe",
  "pricePerNight": 75000,
  "capacity": { "adults": 2, "children": 1 },
  "amenities": ["665f1a2b8c9d4e0012345680"],
  "images": ["https://res.cloudinary.com/demo/image/upload/v1/hotel-booking/rooms/a.jpg"],
  "totalRooms": 3,
  "isAvailable": true,
  "description": "City view with king bed.",
  "createdAt": "2026-06-03T10:00:00.000Z",
  "updatedAt": "2026-06-03T10:00:00.000Z"
}
```

> The mobile constants file lists `Standard, Superior, Deluxe, Suite, Family` for UI filters; the persisted schema enum is `single, double, suite, deluxe`. Use the schema values when writing to the API.

### 2.4 `Booking` — `server/models/Booking.js`

| Field | Type | Required | Default | Enum / notes | Ref | Index |
| --- | --- | --- | --- | --- | --- | --- |
| `user` | ObjectId | Yes | — | booking owner | `User` | `index` |
| `hotel` | ObjectId | Yes | — | denormalized for admin filters | `Hotel` | `index` |
| `room` | ObjectId | Yes | — | booked room | `Room` | `index` |
| `checkIn` | Date | Yes | — | `YYYY-MM-DD` parsed as UTC midnight | — | `index` |
| `checkOut` | Date | Yes | — | must be after `checkIn` | — | `index` |
| `guests.adults` | Number | No | `1` | `min: 0` | — | — |
| `guests.children` | Number | No | `0` | `min: 0` | — | — |
| `nights` | Number | Yes | — | computed by `priceCalculator` | — | — |
| `pricePerNight` | Number | Yes | — | snapshot at booking time | — | — |
| `subtotal` | Number | Yes | — | `nights × pricePerNight` | — | — |
| `tax` | Number | Yes | — | `10%` of subtotal | — | — |
| `totalPrice` | Number | Yes | — | `subtotal + tax` | — | — |
| `status` | String | No | `'pending'` | `pending`, `confirmed`, `checked_in`, `checked_out`, `cancelled` | — | `index` |
| `paymentStatus` | String | No | `'unpaid'` | `unpaid`, `paid`, `refunded` | — | `index` |
| `paymentMethod` | String | No | `'cash'` | `stripe`, `cash` | — | — |
| `specialRequests` | String | No | `''` | guest notes | — | — |
| `cancellationReason` | String | No | `''` | set on cancel / auto-cancel | — | — |

Composite index used by the availability query: `{ room: 1, checkIn: 1, checkOut: 1 }`.

```json
{
  "_id": "665f1a2b8c9d4e0012345682",
  "user": "665f1a2b8c9d4e0012345678",
  "hotel": "665f1a2b8c9d4e0012345679",
  "room": "665f1a2b8c9d4e0012345681",
  "checkIn": "2026-06-10T00:00:00.000Z",
  "checkOut": "2026-06-13T00:00:00.000Z",
  "guests": { "adults": 2, "children": 0 },
  "nights": 3,
  "pricePerNight": 75000,
  "subtotal": 225000,
  "tax": 22500,
  "totalPrice": 247500,
  "status": "confirmed",
  "paymentStatus": "paid",
  "paymentMethod": "cash",
  "specialRequests": "Quiet floor please.",
  "cancellationReason": "",
  "createdAt": "2026-06-03T10:00:00.000Z",
  "updatedAt": "2026-06-03T10:00:00.000Z"
}
```

### 2.5 `Payment` — `server/models/Payment.js`

| Field | Type | Required | Default | Enum / notes | Ref | Index |
| --- | --- | --- | --- | --- | --- | --- |
| `booking` | ObjectId | Yes | — | one payment per booking | `Booking` | `unique`, `index` |
| `user` | ObjectId | Yes | — | payer | `User` | `index` |
| `amount` | Number | Yes | — | charged amount in smallest currency unit | — | — |
| `currency` | String | No | `'usd'` | lowercase | — | — |
| `stripePaymentIntentId` | String | No | `''` | `pi_...`; empty for cash | — | — |
| `status` | String | No | `'pending'` | `pending`, `succeeded`, `failed`, `refunded` | — | `index` |
| `method` | String | No | `'stripe'` | `stripe`, `cash` | — | — |

```json
{
  "_id": "665f1a2b8c9d4e0012345683",
  "booking": "665f1a2b8c9d4e0012345682",
  "user": "665f1a2b8c9d4e0012345678",
  "amount": 247500,
  "currency": "usd",
  "stripePaymentIntentId": "pi_3PabcXYZ",
  "status": "succeeded",
  "method": "stripe",
  "createdAt": "2026-06-03T10:05:00.000Z",
  "updatedAt": "2026-06-03T10:06:00.000Z"
}
```

### 2.6 `Review` — `server/models/Review.js`

| Field | Type | Required | Default | Enum / notes | Ref | Index |
| --- | --- | --- | --- | --- | --- | --- |
| `user` | ObjectId | Yes | — | reviewer | `User` | `index` |
| `room` | ObjectId | Yes | — | reviewed room | `Room` | `index` |
| `booking` | ObjectId | Yes | — | proof of stay; one review per booking | `Booking` | `unique`, `index` |
| `rating` | Number | Yes | — | integer `1`–`5` | — | — |
| `comment` | String | No | `''` | trimmed | — | — |

```json
{
  "_id": "665f1a2b8c9d4e0012345684",
  "user": "665f1a2b8c9d4e0012345678",
  "room": "665f1a2b8c9d4e0012345681",
  "booking": "665f1a2b8c9d4e0012345682",
  "rating": 5,
  "comment": "Clean room and friendly staff.",
  "createdAt": "2026-06-15T09:00:00.000Z",
  "updatedAt": "2026-06-15T09:00:00.000Z"
}
```

### 2.7 `Amenity` — `server/models/Amenity.js`

| Field | Type | Required | Default | Enum / notes | Ref | Index |
| --- | --- | --- | --- | --- | --- | --- |
| `name` | String | Yes | — | trimmed; global unique | — | `unique` |
| `icon` | String | No | `''` | emoji or icon name | — | — |
| `category` | String | No | `'general'` | trimmed, e.g. `connectivity` | — | — |

```json
{
  "_id": "665f1a2b8c9d4e0012345680",
  "name": "WiFi",
  "icon": "📶",
  "category": "connectivity",
  "createdAt": "2026-06-03T10:00:00.000Z",
  "updatedAt": "2026-06-03T10:00:00.000Z"
}
```

### 2.8 Relationships

```text
User 1 ──< Booking >── 1 Hotel
                    └── 1 Room ──< Review
User 1 ──< Payment >── 1 Booking
Hotel 1 ──< Room
Hotel * ──< Amenity    Room * ──< Amenity
```

---

## Part 3 — API reference

Base URL: `http://localhost:5000/api`.

### 3.0 Global middleware and conventions

Every request except the Stripe webhook passes through, in order:

1. `cors()` — origins from `CLIENT_ORIGIN`
2. `morgan('dev')` — request logging (skipped in tests)
3. `express.json()` — JSON body parsing
4. route-level middleware (listed per endpoint below)
5. controller
6. `notFound` for unmatched routes, then `errorHandler` for errors

**Bearer authentication** means `Authorization: Bearer <token>`. Missing/invalid/expired tokens produce `401`. Role checks produce `403`.

**Canonical error shapes:**

```json
{ "message": "Validation failed", "errors": [ { "field": "email", "msg": "Invalid email" } ] }
```

```json
{ "message": "Forbidden: insufficient permissions" }
```

```json
{ "message": "Resource not found: id" }
```

### 3.1 Endpoint index

| # | Method | Path | Access | Success |
| --- | --- | --- | --- | --- |
| 1 | POST | `/api/auth/register` | Public | `201 {token,user}` |
| 2 | POST | `/api/auth/login` | Public | `200 {token,user}` |
| 3 | GET | `/api/auth/me` | Bearer | `200 user` |
| 4 | PUT | `/api/auth/profile` | Bearer | `200 {message,user}` |
| 5 | GET | `/api/hotels` | Public | `200 {items,page,pages,total}` |
| 6 | GET | `/api/hotels/:id` | Public | `200 hotel + rooms[]` |
| 7 | POST | `/api/hotels` | admin | `201 {message,hotel}` |
| 8 | PUT | `/api/hotels/:id` | admin | `200 {message,hotel}` |
| 9 | DELETE | `/api/hotels/:id` | admin | `200 {message}` |
| 10 | GET | `/api/rooms` | Public | `200 {items,page,pages,total}` |
| 11 | GET | `/api/rooms/:id` | Public | `200 room` |
| 12 | POST | `/api/rooms` | admin, multipart | `201 {message,room}` |
| 13 | PUT | `/api/rooms/:id` | admin | `200 {message,room}` |
| 14 | DELETE | `/api/rooms/:id` | admin | `200 {message}` |
| 15 | POST | `/api/bookings` | Bearer | `201 {message,booking}`; `409` if unavailable |
| 16 | GET | `/api/bookings/my` | Bearer | `200 {items,page,pages,total}` |
| 17 | GET | `/api/bookings/:id` | Bearer, owner/admin | `200 booking` |
| 18 | PUT | `/api/bookings/:id/cancel` | Bearer | `200 {message,booking}` |
| 19 | GET | `/api/bookings` | admin/staff | `200 {items,page,pages,total}` |
| 20 | PUT | `/api/bookings/:id/status` | admin/staff | `200 {message,booking}` |
| 21 | POST | `/api/payments/create-intent` | Bearer | `200 {clientSecret,paymentIntentId,amount,currency}` |
| 22 | POST | `/api/payments/webhook` | Stripe signature | `200 {received:true}` |
| 23 | POST | `/api/payments/cash` | Bearer | `200 {message,payment,booking}` |
| 24 | POST | `/api/reviews` | Bearer | `201 {message,review}` |
| 25 | GET | `/api/reviews/room/:roomId` | Public | `200 {items}` |
| 26 | GET | `/api/admin/dashboard` | admin/staff | `200 metrics` |
| 27 | GET | `/api/admin/users` | admin | `200 {items,page,pages,total}` |
| 28 | PUT | `/api/admin/users/:id/role` | admin | `200 {message,user}` |

### 3.2 Auth

#### 3.2.1 POST `/api/auth/register`

Creates a guest account and returns a ready-to-use JWT. Full code: `server/controllers/auth.controller.js`.

**Middleware chain:** `express.json()` → `validate(registerRules)` → `register`

**Request body**

```json
{
  "name": "Guest One",
  "email": "guest@test.com",
  "password": "secret123",
  "phone": "0912345678"
}
```

**Success — 201 Created**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "665f1a2b8c9d4e0012345678",
    "name": "Guest One",
    "email": "guest@test.com",
    "phone": "0912345678",
    "role": "guest",
    "avatar": "",
    "isActive": true,
    "createdAt": "2026-06-03T10:00:00.000Z",
    "updatedAt": "2026-06-03T10:00:00.000Z"
  }
}
```

**Error — 409 Conflict (email already registered)**

```json
{ "message": "Email is already registered" }
```

**Error — 400 Bad Request (validation)**

```json
{
  "message": "Validation failed",
  "errors": [
    { "field": "email", "msg": "Please provide a valid email" },
    { "field": "password", "msg": "Password must be at least 6 characters" }
  ]
}
```

| Status | Meaning |
| --- | --- |
| `201` | Account created, token returned |
| `400` | Validation failed |
| `409` | Email already registered |
| `500` | Server error |

#### 3.2.2 POST `/api/auth/login`

**Middleware chain:** `express.json()` → `validate(loginRules)` → `login`

**Request body**

```json
{ "email": "guest@test.com", "password": "123456" }
```

**Success — 200 OK**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "665f1a2b8c9d4e0012345678",
    "name": "Guest One",
    "email": "guest@test.com",
    "role": "guest",
    "isActive": true
  }
}
```

**Error — 401 Unauthorized**

```json
{ "message": "Invalid email or password" }
```

**Error — 403 Forbidden (deactivated account)**

```json
{ "message": "This account has been deactivated" }
```

| Status | Meaning |
| --- | --- |
| `200` | Login successful |
| `400` | Validation failed |
| `401` | Wrong email or password |
| `403` | Account deactivated |
| `500` | Server error |

#### 3.2.3 GET `/api/auth/me`

**Middleware chain:** `express.json()` → `auth` → `getMe`

**Request:** no body; header `Authorization: Bearer <token>`.

**Success — 200 OK**

```json
{
  "_id": "665f1a2b8c9d4e0012345678",
  "name": "Guest One",
  "email": "guest@test.com",
  "phone": "0912345678",
  "role": "guest",
  "avatar": "",
  "isActive": true,
  "createdAt": "2026-06-03T10:00:00.000Z",
  "updatedAt": "2026-06-03T10:00:00.000Z"
}
```

**Error — 401 Unauthorized**

```json
{ "message": "No token provided, authorization denied" }
```

| Status | Meaning |
| --- | --- |
| `200` | Current user returned |
| `401` | Missing, invalid or expired token |
| `404` | User no longer exists |
| `500` | Server error |

#### 3.2.4 PUT `/api/auth/profile`

All fields are optional; only supplied fields are updated.

**Middleware chain:** `express.json()` → `auth` → `updateProfile`

**Request body**

```json
{ "name": "Guest Updated", "phone": "0999999999", "avatar": "https://cdn.example.com/a.png" }
```

**Success — 200 OK**

```json
{
  "message": "Profile updated",
  "user": {
    "_id": "665f1a2b8c9d4e0012345678",
    "name": "Guest Updated",
    "email": "guest@test.com",
    "phone": "0999999999",
    "role": "guest",
    "avatar": "https://cdn.example.com/a.png"
  }
}
```

**Error — 401 Unauthorized**

```json
{ "message": "Token has expired" }
```

| Status | Meaning |
| --- | --- |
| `200` | Profile updated |
| `400` | Validation failed |
| `401` | Missing/invalid/expired token |
| `404` | User not found |
| `500` | Server error |

### 3.3 Hotels

#### 3.3.1 GET `/api/hotels`

Query parameters: `page` (default `1`), `limit` (default `10`), `search` (name/description), `city`.

**Middleware chain:** `express.json()` → `getHotels` (public)

**Request:** `GET /api/hotels?page=1&limit=10&search=yangon&city=Yangon`

**Success — 200 OK**

```json
{
  "items": [
    {
      "_id": "665f1a2b8c9d4e0012345679",
      "name": "Aureum Yangon Hotel",
      "city": "Yangon",
      "country": "Myanmar",
      "rating": 4.5,
      "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200"]
    }
  ],
  "page": 1,
  "pages": 1,
  "total": 1
}
```

**Error — 400 Bad Request**

```json
{ "message": "Validation failed", "errors": [ { "field": "page", "msg": "Page must be a positive integer" } ] }
```

| Status | Meaning |
| --- | --- |
| `200` | Paginated hotel list |
| `400` | Invalid pagination/filter values |
| `500` | Server error |

#### 3.3.2 GET `/api/hotels/:id`

**Middleware chain:** `express.json()` → `getHotelById` (public). Returns the hotel with its rooms populated into `rooms[]`.

**Request:** `GET /api/hotels/665f1a2b8c9d4e0012345679`

**Success — 200 OK**

```json
{
  "_id": "665f1a2b8c9d4e0012345679",
  "name": "Aureum Yangon Hotel",
  "city": "Yangon",
  "rating": 4.5,
  "rooms": [
    {
      "_id": "665f1a2b8c9d4e0012345681",
      "roomNumber": "101",
      "type": "deluxe",
      "pricePerNight": 75000,
      "isAvailable": true
    }
  ]
}
```

**Error — 404 Not Found**

```json
{ "message": "Hotel not found" }
```

| Status | Meaning |
| --- | --- |
| `200` | Hotel plus `rooms[]` |
| `404` | Unknown id (or malformed ObjectId) |
| `500` | Server error |

#### 3.3.3 POST `/api/hotels`

**Middleware chain:** `express.json()` → `auth` → `authorize('admin')` → `validate(hotelRules)` → `createHotel`

**Request body**

```json
{
  "name": "Aureum Yangon Hotel",
  "description": "Comfortable stay in the heart of Yangon.",
  "address": "12 Bogyoke Road",
  "city": "Yangon",
  "country": "Myanmar",
  "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200"],
  "rating": 4.5,
  "amenities": ["665f1a2b8c9d4e0012345680"],
  "contact": { "phone": "+95 1 234 567", "email": "yangon@aureum.test" }
}
```

**Success — 201 Created**

```json
{ "message": "Hotel created", "hotel": { "_id": "665f1a2b8c9d4e0012345679", "name": "Aureum Yangon Hotel", "city": "Yangon" } }
```

**Error — 403 Forbidden**

```json
{ "message": "Forbidden: insufficient permissions" }
```

| Status | Meaning |
| --- | --- |
| `201` | Hotel created |
| `400` | Validation failed |
| `401` | Missing/invalid token |
| `403` | Not an admin |
| `500` | Server error |

#### 3.3.4 PUT `/api/hotels/:id`

**Middleware chain:** `express.json()` → `auth` → `authorize('admin')` → `updateHotel`

**Request body (partial update)**

```json
{ "name": "Aureum Yangon Suites", "rating": 4.8 }
```

**Success — 200 OK**

```json
{ "message": "Hotel updated", "hotel": { "_id": "665f1a2b8c9d4e0012345679", "name": "Aureum Yangon Suites", "rating": 4.8 } }
```

**Error — 404 Not Found**

```json
{ "message": "Hotel not found" }
```

| Status | Meaning |
| --- | --- |
| `200` | Hotel updated |
| `400` | Validation failed |
| `401` | Missing/invalid token |
| `403` | Not an admin |
| `404` | Hotel not found |
| `500` | Server error |

#### 3.3.5 DELETE `/api/hotels/:id`

**Middleware chain:** `express.json()` → `auth` → `authorize('admin')` → `deleteHotel`

**Request:** `DELETE /api/hotels/665f1a2b8c9d4e0012345679` (no body).

**Success — 200 OK**

```json
{ "message": "Hotel deleted" }
```

**Error — 404 Not Found**

```json
{ "message": "Hotel not found" }
```

| Status | Meaning |
| --- | --- |
| `200` | Hotel deleted |
| `401` | Missing/invalid token |
| `403` | Not an admin |
| `404` | Hotel not found |
| `500` | Server error |

### 3.4 Rooms

#### 3.4.1 GET `/api/rooms`

Filters: `hotelId`, `city`, `minPrice`, `maxPrice`, `capacity`, `type`, `checkIn`, `checkOut`, `page`, `limit`. `checkIn`/`checkOut` trigger the availability overlap filter described in [Part 5](#53-status-flow).

**Middleware chain:** `express.json()` → `getRooms` (public)

**Request:** `GET /api/rooms?hotelId=...&city=Yangon&minPrice=50000&maxPrice=100000&capacity=2&type=deluxe&checkIn=2026-06-10&checkOut=2026-06-13&page=1&limit=10`

**Success — 200 OK**

```json
{
  "items": [
    {
      "_id": "665f1a2b8c9d4e0012345681",
      "hotel": { "_id": "665f1a2b8c9d4e0012345679", "name": "Aureum Yangon Hotel", "city": "Yangon" },
      "roomNumber": "101",
      "type": "deluxe",
      "pricePerNight": 75000,
      "capacity": { "adults": 2, "children": 1 },
      "images": [],
      "isAvailable": true
    }
  ],
  "page": 1,
  "pages": 1,
  "total": 1
}
```

**Error — 400 Bad Request**

```json
{ "message": "Validation failed", "errors": [ { "field": "minPrice", "msg": "minPrice must be a number" } ] }
```

| Status | Meaning |
| --- | --- |
| `200` | Paginated, filtered room list |
| `400` | Invalid filter values |
| `500` | Server error |

#### 3.4.2 GET `/api/rooms/:id`

**Middleware chain:** `express.json()` → `getRoomById` (public)

**Request:** `GET /api/rooms/665f1a2b8c9d4e0012345681`

**Success — 200 OK**

```json
{
  "_id": "665f1a2b8c9d4e0012345681",
  "hotel": { "_id": "665f1a2b8c9d4e0012345679", "name": "Aureum Yangon Hotel" },
  "roomNumber": "101",
  "type": "deluxe",
  "pricePerNight": 75000,
  "capacity": { "adults": 2, "children": 1 },
  "amenities": [],
  "images": [],
  "totalRooms": 3,
  "isAvailable": true
}
```

**Error — 404 Not Found**

```json
{ "message": "Room not found" }
```

| Status | Meaning |
| --- | --- |
| `200` | Room returned |
| `404` | Unknown id |
| `500` | Server error |

#### 3.4.3 POST `/api/rooms`

`multipart/form-data`; up to 5 images in the `images[]` field. Multer keeps buffers in memory, and `uploadRoomImages` in `server/config/cloudinary.js` uploads them to Cloudinary.

**Middleware chain:** `express.json()` → `auth` → `authorize('admin')` → `upload.array('images', 5)` → `roomRules` → `validate` → `createRoom` (rules require `hotel`, `roomNumber` and `pricePerNight`)

**Request body (form fields)**

```text
hotel=665f1a2b8c9d4e0012345679
roomNumber=102
type=deluxe
pricePerNight=75000
capacity[adults]=2
capacity[children]=1
totalRooms=3
description=City view with king bed.
images[]=<binary file 1>
images[]=<binary file 2>
```

**Success — 201 Created**

```json
{
  "message": "Room created",
  "room": {
    "_id": "665f1a2b8c9d4e0012345681",
    "hotel": "665f1a2b8c9d4e0012345679",
    "roomNumber": "102",
    "type": "deluxe",
    "pricePerNight": 75000,
    "images": ["https://res.cloudinary.com/.../rooms/a.jpg"]
  }
}
```

**Error — 400 Bad Request (upload)**

```json
{ "message": "Upload error: File too large" }
```

| Status | Meaning |
| --- | --- |
| `201` | Room created, images uploaded |
| `400` | Validation or upload error (non-image, >5 files, >5 MB each) |
| `401` | Missing/invalid token |
| `403` | Not an admin |
| `404` | Parent hotel not found |
| `500` | Server error |

#### 3.4.4 PUT `/api/rooms/:id`

**Middleware chain:** `express.json()` → `auth` → `authorize('admin')` → `upload.array('images', 5)` → `validate` → `updateRoom`

**Request body (partial update)**

```json
{ "pricePerNight": 82000, "isAvailable": false }
```

**Success — 200 OK**

```json
{ "message": "Room updated", "room": { "_id": "665f1a2b8c9d4e0012345681", "pricePerNight": 82000, "isAvailable": false } }
```

**Error — 409 Conflict (duplicate room number in the same hotel)**

```json
{ "message": "Duplicate value for roomNumber" }
```

| Status | Meaning |
| --- | --- |
| `200` | Room updated |
| `400` | Validation failed |
| `401` | Missing/invalid token |
| `403` | Not an admin |
| `404` | Room not found |
| `409` | Duplicate `hotel + roomNumber` |
| `500` | Server error |

#### 3.4.5 DELETE `/api/rooms/:id`

**Middleware chain:** `express.json()` → `auth` → `authorize('admin')` → `deleteRoom`

**Request:** `DELETE /api/rooms/665f1a2b8c9d4e0012345681`

**Success — 200 OK**

```json
{ "message": "Room deleted" }
```

**Error — 403 Forbidden**

```json
{ "message": "Forbidden: insufficient permissions" }
```

| Status | Meaning |
| --- | --- |
| `200` | Room deleted |
| `401` | Missing/invalid token |
| `403` | Not an admin |
| `404` | Room not found |
| `500` | Server error |

### 3.5 Bookings

#### 3.5.1 POST `/api/bookings`

Checks availability, computes pricing, and creates a `pending` / `unpaid` booking. Full code: `server/controllers/booking.controller.js`.

**Middleware chain:** `express.json()` → `auth` → `validate(bookingRules)` → `createBooking`

**Request body**

```json
{
  "hotelId": "665f1a2b8c9d4e0012345679",
  "roomId": "665f1a2b8c9d4e0012345681",
  "checkIn": "2026-06-10",
  "checkOut": "2026-06-13",
  "adults": 2,
  "children": 0,
  "specialRequests": "Quiet floor please."
}
```

**Success — 201 Created**

```json
{
  "message": "Booking created",
  "booking": {
    "_id": "665f1a2b8c9d4e0012345682",
    "user": "665f1a2b8c9d4e0012345678",
    "hotel": "665f1a2b8c9d4e0012345679",
    "room": "665f1a2b8c9d4e0012345681",
    "checkIn": "2026-06-10T00:00:00.000Z",
    "checkOut": "2026-06-13T00:00:00.000Z",
    "guests": { "adults": 2, "children": 0 },
    "nights": 3,
    "subtotal": 225000,
    "tax": 22500,
    "totalPrice": 247500,
    "status": "pending",
    "paymentStatus": "unpaid",
    "paymentMethod": "cash"
  }
}
```

**Error — 409 Conflict (room unavailable for the dates)**

```json
{ "message": "Room is not available for the selected dates" }
```

| Status | Meaning |
| --- | --- |
| `201` | Booking created |
| `400` | Validation failed / bad date range / capacity exceeded |
| `401` | Missing/invalid token |
| `404` | Hotel or room not found |
| `409` | Room unavailable for the requested dates |
| `500` | Server error |

#### 3.5.2 GET `/api/bookings/my`

**Middleware chain:** `express.json()` → `auth` → `getMyBookings`

**Request:** `GET /api/bookings/my?page=1&limit=10`, Bearer header.

**Success — 200 OK**

```json
{
  "items": [
    {
      "_id": "665f1a2b8c9d4e0012345682",
      "hotel": { "name": "Aureum Yangon Hotel", "city": "Yangon" },
      "room": { "roomNumber": "101", "images": [] },
      "checkIn": "2026-06-10T00:00:00.000Z",
      "checkOut": "2026-06-13T00:00:00.000Z",
      "totalPrice": 247500,
      "status": "confirmed",
      "paymentStatus": "paid"
    }
  ],
  "page": 1,
  "pages": 1,
  "total": 1
}
```

**Error — 401 Unauthorized**

```json
{ "message": "Token is not valid" }
```

| Status | Meaning |
| --- | --- |
| `200` | Bookings owned by the token user |
| `401` | Missing/invalid token |
| `400` | Invalid pagination |
| `500` | Server error |

#### 3.5.3 GET `/api/bookings/:id`

Owner or staff/admin only.

**Middleware chain:** `express.json()` → `auth` → `getBookingById` (handler checks `req.user.id === booking.user._id` or role)

**Request:** `GET /api/bookings/665f1a2b8c9d4e0012345682`, Bearer header.

**Success — 200 OK**

```json
{
  "_id": "665f1a2b8c9d4e0012345682",
  "user": { "_id": "665f1a2b8c9d4e0012345678", "name": "Guest One" },
  "hotel": { "_id": "665f1a2b8c9d4e0012345679", "name": "Aureum Yangon Hotel" },
  "room": { "_id": "665f1a2b8c9d4e0012345681", "roomNumber": "101" },
  "checkIn": "2026-06-10T00:00:00.000Z",
  "checkOut": "2026-06-13T00:00:00.000Z",
  "nights": 3,
  "totalPrice": 247500,
  "status": "checked_out",
  "paymentStatus": "paid"
}
```

**Error — 403 Forbidden (not the owner)**

```json
{ "message": "Not authorized to view this booking" }
```

| Status | Meaning |
| --- | --- |
| `200` | Booking returned |
| `401` | Missing/invalid token |
| `403` | Neither owner nor staff/admin |
| `404` | Booking not found |
| `500` | Server error |

#### 3.5.4 PUT `/api/bookings/:id/cancel`

Cancels a booking, writes `cancellationReason`, and triggers a cancellation email via `server/utils/email.js`.

**Middleware chain:** `express.json()` → `auth` → `cancelBooking`

**Request body (optional reason)**

```json
{ "cancellationReason": "Travel plans changed" }
```

**Success — 200 OK**

```json
{
  "message": "Booking cancelled",
  "booking": {
    "_id": "665f1a2b8c9d4e0012345682",
    "status": "cancelled",
    "cancellationReason": "Travel plans changed"
  }
}
```

**Error — 400 Bad Request**

```json
{ "message": "This booking can no longer be cancelled" }
```

| Status | Meaning |
| --- | --- |
| `200` | Booking cancelled |
| `400` | Cancellation not allowed at this stage |
| `401` | Missing/invalid token |
| `403` | Not the owner |
| `404` | Booking not found |
| `500` | Server error |

#### 3.5.5 GET `/api/bookings`

Admin/staff listing with filters `status`, `paymentStatus`, `from`, `to`, plus pagination.

**Middleware chain:** `express.json()` → `auth` → `authorize('admin', 'staff')` → `getAllBookings`

**Request:** `GET /api/bookings?status=confirmed&paymentStatus=paid&from=2026-06-01&to=2026-06-30&page=1&limit=10`

**Success — 200 OK**

```json
{
  "items": [
    {
      "_id": "665f1a2b8c9d4e0012345682",
      "user": { "name": "Guest One", "email": "guest@test.com" },
      "hotel": { "name": "Aureum Yangon Hotel" },
      "status": "confirmed",
      "paymentStatus": "paid",
      "totalPrice": 247500,
      "createdAt": "2026-06-03T10:00:00.000Z"
    }
  ],
  "page": 1,
  "pages": 1,
  "total": 1
}
```

**Error — 401 Unauthorized**

```json
{ "message": "No token provided, authorization denied" }
```

| Status | Meaning |
| --- | --- |
| `200` | Filtered bookings |
| `400` | Invalid filter/date/pagination values |
| `401` | Missing/invalid token |
| `403` | Guest role |
| `500` | Server error |

#### 3.5.6 PUT `/api/bookings/:id/status`

**Middleware chain:** `express.json()` → `auth` → `authorize('admin', 'staff')` → `updateBookingStatus`

**Request body**

```json
{ "status": "checked_in" }
```

Allowed values: `pending`, `confirmed`, `checked_in`, `checked_out`, `cancelled`.

**Success — 200 OK**

```json
{
  "message": "Booking status updated",
  "booking": { "_id": "665f1a2b8c9d4e0012345682", "status": "checked_in" }
}
```

**Error — 400 Bad Request**

```json
{ "message": "Invalid status transition: pending -> checked_out" }
```

Allowed transitions are enforced in `server/controllers/booking.controller.js`: `pending → confirmed|cancelled`, `confirmed → checked_in|cancelled`, `checked_in → checked_out`; terminal states have no forward transitions.

| Status | Meaning |
| --- | --- |
| `200` | Status updated |
| `400` | Invalid or disallowed status transition |
| `401` | Missing/invalid token |
| `403` | Guest role |
| `404` | Booking not found |
| `500` | Server error |

### 3.6 Payments

#### 3.6.1 POST `/api/payments/create-intent`

Creates a Stripe PaymentIntent in **test mode** for a booking. Full code: `server/controllers/payment.controller.js` and `server/config/stripe.js`.

**Middleware chain:** `express.json()` → `auth` → `createPaymentIntent`

**Request body**

```json
{ "bookingId": "665f1a2b8c9d4e0012345682" }
```

**Success — 200 OK**

```json
{
  "clientSecret": "pi_3PabcXYZ_secret_abc123",
  "paymentIntentId": "pi_3PabcXYZ",
  "amount": 24750000,
  "currency": "usd",
  "payment": {
    "_id": "665f1a2b8c9d4e0012345683",
    "booking": "665f1a2b8c9d4e0012345682",
    "amount": 247500,
    "currency": "usd",
    "stripePaymentIntentId": "pi_3PabcXYZ",
    "status": "pending",
    "method": "stripe"
  }
}
```

> `amount` in the response is the Stripe charge in **cents** (`booking.totalPrice × 100`). The stored `Payment.amount` keeps the booking total.

**Error — 400 Bad Request**

```json
{ "message": "Booking is already paid" }
```

| Status | Meaning |
| --- | --- |
| `200` | PaymentIntent created |
| `400` | Booking not payable / invalid request |
| `401` | Missing/invalid token |
| `403` | Not the booking owner |
| `404` | Booking not found |
| `500` | Stripe or server error |

#### 3.6.2 POST `/api/payments/webhook`

Receives raw Stripe events. **This route is mounted before `express.json()`** so the exact raw bytes are available for signature verification; use `stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)`.

**Middleware chain:** `express.raw({ type: 'application/json' })` → handler (no JWT, signature instead)

**Request body:** raw Stripe JSON event, headers `Stripe-Signature` and `Content-Type: application/json`.

```json
{
  "id": "evt_1PabcXYZ",
  "object": "event",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_3PabcXYZ",
      "object": "payment_intent",
      "amount": 247500,
      "currency": "usd",
      "metadata": { "bookingId": "665f1a2b8c9d4e0012345682" }
    }
  }
}
```

**Success — 200 OK**

```json
{ "received": true }
```

**Error — 400 Bad Request (bad signature)**

```json
{ "message": "Webhook signature failed: No signatures found matching the expected signature for payload" }
```

| Status | Meaning |
| --- | --- |
| `200` | Event accepted (also for unhandled event types) |
| `400` | Missing/invalid `Stripe-Signature` or malformed payload |
| `500` | Handler error (Stripe will retry) |

#### 3.6.3 POST `/api/payments/cash`

Marks a booking as paid by cash; creates/updates the `Payment` document with `method: 'cash'`.

**Middleware chain:** `express.json()` → `auth` → `payWithCash`

**Request body**

```json
{ "bookingId": "665f1a2b8c9d4e0012345682" }
```

**Success — 200 OK**

```json
{
  "message": "Cash payment recorded",
  "payment": {
    "_id": "665f1a2b8c9d4e0012345683",
    "booking": "665f1a2b8c9d4e0012345682",
    "amount": 247500,
    "method": "cash",
    "status": "succeeded"
  },
  "booking": {
    "_id": "665f1a2b8c9d4e0012345682",
    "paymentStatus": "paid",
    "status": "confirmed"
  }
}
```

**Error — 404 Not Found**

```json
{ "message": "Booking not found" }
```

| Status | Meaning |
| --- | --- |
| `200` | Cash payment recorded |
| `400` | Booking already paid or invalid request |
| `401` | Missing/invalid token |
| `403` | Not the booking owner |
| `404` | Booking not found |
| `500` | Server error |

### 3.7 Reviews

#### 3.7.1 POST `/api/reviews`

Only the booking owner can review, only after the booking status is `checked_out`, and only once per booking.

**Middleware chain:** `express.json()` → `auth` → `validate(reviewRules)` → `createReview`

**Request body**

```json
{
  "bookingId": "665f1a2b8c9d4e0012345682",
  "rating": 5,
  "comment": "Clean room and friendly staff."
}
```

**Success — 201 Created**

```json
{
  "message": "Review created",
  "review": {
    "_id": "665f1a2b8c9d4e0012345684",
    "user": "665f1a2b8c9d4e0012345678",
    "room": "665f1a2b8c9d4e0012345681",
    "booking": "665f1a2b8c9d4e0012345682",
    "rating": 5,
    "comment": "Clean room and friendly staff."
  }
}
```

**Error — 400 Bad Request (stay not finished)**

```json
{ "message": "You can review only after check-out" }
```

**Error — 409 Conflict (duplicate)**

```json
{ "message": "Duplicate value for booking" }
```

| Status | Meaning |
| --- | --- |
| `201` | Review created |
| `400` | Invalid rating or booking not checked out |
| `401` | Missing/invalid token |
| `403` | Not the booking owner |
| `404` | Booking not found |
| `409` | Booking already reviewed |
| `500` | Server error |

#### 3.7.2 GET `/api/reviews/room/:roomId`

**Middleware chain:** `express.json()` → `getRoomReviews` (public)

**Request:** `GET /api/reviews/room/665f1a2b8c9d4e0012345681`

**Success — 200 OK**

```json
{
  "items": [
    {
      "_id": "665f1a2b8c9d4e0012345684",
      "user": { "_id": "665f1a2b8c9d4e0012345678", "name": "Guest One" },
      "rating": 5,
      "comment": "Clean room and friendly staff.",
      "createdAt": "2026-06-15T09:00:00.000Z"
    }
  ]
}
```

**Error — 404 Not Found**

```json
{ "message": "Room not found" }
```

| Status | Meaning |
| --- | --- |
| `200` | Reviews for the room |
| `404` | Room not found |
| `500` | Server error |

### 3.8 Admin

#### 3.8.1 GET `/api/admin/dashboard`

**Middleware chain:** `express.json()` → `auth` → `authorize('admin', 'staff')` → `getDashboard`

**Request:** `GET /api/admin/dashboard`, Bearer header.

**Success — 200 OK**

```json
{
  "totalBookings": 128,
  "totalRevenue": 9450000,
  "occupancyRate": 68.4,
  "totalUsers": 42,
  "totalHotels": 3,
  "totalRooms": 30,
  "recentBookings": [
    {
      "_id": "665f1a2b8c9d4e0012345682",
      "guest": "Guest One",
      "hotel": "Aureum Yangon Hotel",
      "status": "confirmed",
      "totalPrice": 247500,
      "createdAt": "2026-06-03T10:00:00.000Z"
    }
  ]
}
```

**Error — 403 Forbidden**

```json
{ "message": "Forbidden: insufficient permissions" }
```

| Status | Meaning |
| --- | --- |
| `200` | Dashboard metrics |
| `401` | Missing/invalid token |
| `403` | Guest role |
| `500` | Server error |

#### 3.8.2 GET `/api/admin/users`

**Middleware chain:** `express.json()` → `auth` → `authorize('admin')` → `getUsers`

**Request:** `GET /api/admin/users?page=1&limit=10&search=guest`

**Success — 200 OK**

```json
{
  "items": [
    {
      "_id": "665f1a2b8c9d4e0012345678",
      "name": "Guest One",
      "email": "guest@test.com",
      "role": "guest",
      "isActive": true,
      "createdAt": "2026-06-03T10:00:00.000Z"
    }
  ],
  "page": 1,
  "pages": 1,
  "total": 1
}
```

**Error — 401 Unauthorized**

```json
{ "message": "No token provided, authorization denied" }
```

| Status | Meaning |
| --- | --- |
| `200` | Paginated users |
| `400` | Invalid pagination |
| `401` | Missing/invalid token |
| `403` | Not an admin |
| `500` | Server error |

#### 3.8.3 PUT `/api/admin/users/:id/role`

**Middleware chain:** `express.json()` → `auth` → `authorize('admin')` → `updateUserRole`

**Request body**

```json
{ "role": "staff" }
```

Allowed values: `guest`, `staff`, `admin`.

**Success — 200 OK**

```json
{
  "message": "User role updated",
  "user": {
    "_id": "665f1a2b8c9d4e0012345678",
    "name": "Guest One",
    "email": "guest@test.com",
    "role": "staff"
  }
}
```

**Error — 400 Bad Request**

```json
{ "message": "Invalid role" }
```

| Status | Meaning |
| --- | --- |
| `200` | Role updated |
| `400` | Invalid role value |
| `401` | Missing/invalid token |
| `403` | Not an admin |
| `404` | User not found |
| `500` | Server error |

---

## Part 4 — Middleware

All files are in `server/middleware/`. Applied globally in `server/server.js` or per-route in `server/routes/*.routes.js`.

| File | Responsibility | How it is used |
| --- | --- | --- |
| `auth.js` | Reads `Bearer <token>`, verifies JWT with `JWT_SECRET`, sets `req.user = { id, role }` | `auth` on every protected route; `401` for missing/expired/invalid token |
| `role.js` | `authorize(...roles)` factory checks `req.user.role` | `authorize('admin')`, `authorize('admin','staff')` after `auth`; `403` on mismatch |
| `upload.js` | Multer `memoryStorage`, images only, max 5 files × 5 MB | `upload.array('images', 5)` on `POST /api/rooms` |
| `validate.js` | Runs `express-validator` rule arrays and returns the canonical `400` error shape | `validate(rules)` on auth/booking/review routes (rules defined in `server/routes/*.routes.js`) |
| `errorHandler.js` | Converts `CastError`→404, duplicate key→409, `ValidationError`→400, Multer errors→400, otherwise 500 | Last `app.use(...)` in `server.js` |
| `notFound.js` | Returns `{ message: 'Route not found' }` with `404` | Registered after all routers, before `errorHandler` |

Global built-in middleware in `server/server.js`: `cors({ origin: CLIENT_ORIGIN })`, `morgan('dev')`, and — except for the payment webhook — `express.json()`.

---

## Part 5 — Business logic

Full implementations live in `server/controllers/*.controller.js` and `server/utils/*.js`. The snippets below explain the rules without repeating entire files.

### 5.1 Availability (overlap query)

A room is unavailable when a **non-cancelled** booking overlaps the requested half-open interval `[checkIn, checkOut)`. Two intervals overlap when `existing.checkIn < requested.checkOut` **and** `existing.checkOut > requested.checkIn`. Back-to-back stays (check-out equals next check-in) are therefore allowed.

Representative query used in `server/controllers/booking.controller.js`:

```js
const activeCount = await Booking.countDocuments({
  room: room._id,
  status: { $ne: 'cancelled' },
  checkIn: { $lt: end },
  checkOut: { $gt: start }
});
if (activeCount >= room.totalRooms) {
  return res.status(409).json({ message: 'Room is unavailable for the selected dates' });
}
```

The date helpers in `server/utils/dateHelper.js` normalize `YYYY-MM-DD` to UTC midnight and express the same rule:

```js
function isOverlapping(aIn, aOut, bIn, bOut) {
  return parseDate(aIn) < parseDate(bOut) && parseDate(aOut) > parseDate(bIn);
}
```

`GET /api/rooms` applies the same `$lt`/`$gt` filter to exclude unavailable rooms when `checkIn` and `checkOut` are supplied. The compound index `{ room: 1, checkIn: 1, checkOut: 1 }` in `server/models/Booking.js` supports it.

### 5.2 Price calculation

Implemented in `server/utils/priceCalculator.js`. Nights are exact whole days because inputs are UTC midnights; tax is a flat 10%.

```js
function calculatePrice(checkIn, checkOut, pricePerNight) {
  const start = parseDate(checkIn);
  const end = parseDate(checkOut);
  const price = Number(pricePerNight);

  if (end <= start) throw new Error('checkOut must be after checkIn');
  if (!Number.isFinite(price) || price < 0) throw new Error('Invalid pricePerNight');

  const nights = Math.round((end.getTime() - start.getTime()) / 86400000);
  const subtotal = Math.round(price * nights * 100) / 100;
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const totalPrice = Math.round((subtotal + tax) * 100) / 100;

  return { nights, subtotal, tax, totalPrice };
}
```

Example: 3 nights × 75,000 = 225,000 subtotal; tax 22,500; **total 247,500**. `server/controllers/booking.controller.js` stores these values as a snapshot on the booking; later room price changes never alter old bookings.

### 5.3 Status flow

Booking `status` values are defined in `server/models/Booking.js`; the mobile colour mapping is in `mobile/src/utils/constants.js`.

```text
POST /api/bookings
        │
        ▼
    pending ────────────────► cancelled
        │                         ▲
        │ STRIPE / CASH            │ 30-min cron or PUT .../cancel
        ▼                         │
    confirmed ──────────────► cancelled
        │
        │ PUT /api/bookings/:id/status
        ▼
    checked_in
        │
        ▼
    checked_out ─────────────► review allowed (POST /api/reviews)
```

| Transition | Who/What | Endpoint / mechanism |
| --- | --- | --- |
| none → `pending` | Guest | `POST /api/bookings` |
| `pending` → `confirmed` | Payment success or staff | `POST /api/payments/cash`, Stripe webhook, or `PUT /api/bookings/:id/status` |
| `pending`/`confirmed` → `cancelled` | Guest/admin or cron | `PUT /api/bookings/:id/cancel`, `PUT /api/bookings/:id/status`, auto-cancel job |
| `confirmed` → `checked_in` | Staff/admin | `PUT /api/bookings/:id/status` |
| `checked_in` → `checked_out` | Staff/admin | `PUT /api/bookings/:id/status` |

`server/controllers/booking.controller.js` defines `ALLOWED_TRANSITIONS` and rejects anything else with `400 Invalid status transition: <from> -> <to>`. `checked_out` and `cancelled` are terminal.
| `checked_out` → review | Guest (owner) | `POST /api/reviews` |

`paymentStatus` is separate: `unpaid` → `paid` on cash/Stripe success; `refunded` is available for manual refund handling. A booking can be `confirmed` with `paymentStatus: 'unpaid'` if staff confirms a walk-in reservation.

### 5.4 Auto-cancel job (node-cron)

`server/utils/autoCancel.js` starts a job from `server.js` when the API boots. Every minute it looks for `pending` + `unpaid` bookings older than 30 minutes, marks them `cancelled` with an explanatory `cancellationReason`, and sends a fire-and-forget cancellation email via `server/utils/email.js`. A `started` guard prevents duplicate schedules during in-process restarts.

```js
const task = cron.schedule('* * * * *', async () => {
  const cutoff = new Date(Date.now() - 30 * 60 * 1000);
  const stale = await Booking.find({
    status: 'pending',
    paymentStatus: 'unpaid',
    createdAt: { $lt: cutoff }
  }).populate('user', 'name email').populate('hotel', 'name').populate('room', 'roomNumber');

  await Booking.updateMany(
    { _id: { $in: stale.map((booking) => booking._id) } },
    { $set: { status: 'cancelled', cancellationReason: CANCEL_REASON } }
  );

  stale.forEach((booking) => sendCancellationEmail(booking).catch(() => {}));
});
```

Because the query targets only `pending`+`unpaid`, a confirmed or paid booking is never auto-cancelled. Errors are logged, not thrown, so a single failed tick cannot crash the API.

### 5.5 Email behaviour

`server/utils/email.js` uses Nodemailer with SMTP when `SMTP_HOST`/`PORT`/`USER`/`PASS` are set. Without them it falls back to `jsonTransport` and logs the message preview to the console — local development works with no mail server. Email helpers deliberately swallow errors so mail problems never fail a booking request. `server/config/email.js` simply re-exports the utility for tidy imports.

### 5.6 Image uploads

`server/middleware/upload.js` buffers images in memory. `uploadRoomImages(files)` in `server/config/cloudinary.js` converts each buffer to a data URI and uploads it to the `hotel-booking/rooms` folder, returning `secure_url` values. A failed upload is logged and skipped; the room is still created with the remaining images. **No secrets are committed** — Cloudinary credentials come from `.env`.

---

## Part 6 — Configuration and scripts

### 6.1 Environment variables

Copy `server/.env.example` to `server/.env` and edit it. Defaults in brackets are applied in code when the variable is absent.

| Variable | Default | Used by | Purpose |
| --- | --- | --- | --- |
| `PORT` | `5000` | `server.js` | HTTP listen port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/hotel_booking` | `config/db.js` | MongoDB connection string |
| `JWT_SECRET` | development fallback string | `utils/generateToken.js`, `middleware/auth.js` | Signs and verifies tokens — **set a long random value in production** |
| `JWT_EXPIRES_IN` | `7d` | `utils/generateToken.js` | Token lifetime |
| `CLIENT_ORIGIN` | `http://localhost:3000,http://localhost:5173` | `server.js` (CORS) | Comma-separated allowed browser origins, or `*` |
| `CLOUDINARY_CLOUD_NAME` | — | `config/cloudinary.js` | Cloud upload target |
| `CLOUDINARY_API_KEY` | — | `config/cloudinary.js` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | — | `config/cloudinary.js` | Cloudinary API secret |
| `STRIPE_SECRET_KEY` | `sk_test_replace_me...` | `config/stripe.js` | Stripe **test** secret key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_replace_me` | `payment.controller.js` | Verifies webhook signatures |
| `SMTP_HOST` | — | `utils/email.js` | Mail server host; blank logs emails instead |
| `SMTP_PORT` | `587` | `utils/email.js` | Mail server port |
| `SMTP_USER` | — | `utils/email.js` | Mail auth user |
| `SMTP_PASS` | — | `utils/email.js` | Mail auth password |
| `EMAIL_FROM` | `Hotel Booking <no-reply@hotelbooking.local>` | `utils/email.js` | From address |
| `VITE_API_URL` (admin) | `http://localhost:5000/api` | `admin/src/api/axios.js` | Admin panel API base URL (`admin/.env.example`) |
| `EXPO_PUBLIC_API_URL` (mobile) | `http://10.0.2.2:5000/api` | `mobile/src/utils/constants.js` | Mobile API base URL |

> `.env` files are examples/templates only. Never commit real secrets or live Stripe keys.

### 6.2 Scripts

| Location | Script | Command | Purpose |
| --- | --- | --- | --- |
| root `package.json` | `install:all` | `npm install --prefix server && npm install --prefix mobile && npm install --prefix admin` | Install all three apps |
| root | `dev:server` | `npm run dev --prefix server` | API with nodemon |
| root | `start:server` | `npm start --prefix server` | API in production mode |
| root | `seed` | `npm run seed --prefix server` | Load demo data |
| root | `dev:admin` | `npm run dev --prefix admin` | Vite dev server |
| root | `build:admin` | `npm run build --prefix admin` | Production admin build |
| root | `start:mobile` | `npm run start --prefix mobile` | Expo dev server |
| `server/package.json` | `dev` | `nodemon server.js` | Auto-restart API |
| `server` | `start` | `node server.js` | Plain start |
| `server` | `seed` | `node seed/seedData.js` | Seed script |
| `mobile/package.json` | `start` | `expo start` | Expo bundler + QR |
| `mobile` | `android` / `ios` / `web` | `expo start --android` / `--ios` / `--web` | Platform launchers |
| `admin/package.json` | `dev` | `vite` | Dev server at `:5173` |
| `admin` | `build` / `preview` | `vite build` / `vite preview` | Build / preview production bundle |

### 6.3 `server/server.js` responsibilities

1. Loads environment variables with `dotenv`.
2. Connects to MongoDB via `config/db.js`.
3. Creates the Express app and applies global middleware: CORS (`CLIENT_ORIGIN`), morgan, `express.json()`.
4. Mounts the Stripe webhook **before** the JSON parser so the raw body survives signature verification (`express.raw({ type: 'application/json' })`).
5. Mounts routers from `server/routes/index.js` under `/api` (`auth`, `hotels`, `rooms`, `bookings`, `payments`, `reviews`, `admin`).
6. Registers `notFound` and then `errorHandler`.
7. Starts the auto-cancel cron job from `server/utils/autoCancel.js`.
8. Listens on `PORT` (default `5000`) and logs the URL.

---

## Part 10 — Mobile API services

Files in `mobile/src/api/`. `axios.js` is the shared instance; it reads the JWT from AsyncStorage on every request, adds `Authorization`, and clears the local session plus Redux auth state on `401`.

| File | Exports / responsibilities |
| --- | --- |
| `mobile/src/api/axios.js` | Axios instance (`baseURL` from `utils/constants.js`, 20 s timeout), request/response interceptors |
| `mobile/src/api/authApi.js` | `register`, `login`, `getMe`, `updateProfile` |
| `mobile/src/api/hotelApi.js` | `getHotels` (pagination/search/city), `getHotelById` |
| `mobile/src/api/roomApi.js` | `getRooms` (filters + dates), `getRoomById` |
| `mobile/src/api/bookingApi.js` | `createBooking`, `getMyBookings`, `getBookingById`, `cancelBooking` |
| `mobile/src/api/paymentApi.js` | `createPaymentIntent`, `payCash` — used by the payment screen with Stripe test cards |

Admin-specific calls from the mobile app reuse these services or target the admin routes directly with the stored role.

---

## Part 11 — Mobile components

Reusable presentational components in `mobile/src/components/`. Screens compose these rather than repeating styles.

| File | Responsibility |
| --- | --- |
| `mobile/src/components/Button.js` | Themed primary/secondary/ghost button with loading state |
| `mobile/src/components/InputField.js` | Labelled text input with error text |
| `mobile/src/components/Header.js` | Screen title, back navigation, optional action |
| `mobile/src/components/HotelCard.js` | Hotel list row (image, name, city, rating) |
| `mobile/src/components/RoomCard.js` | Room list row (type, price, capacity, images) |
| `mobile/src/components/BookingCard.js` | Booking summary with status pill and cancel action |
| `mobile/src/components/DateRangePicker.js` | Check-in/check-out selection via `react-native-calendars` |
| `mobile/src/components/StarRating.js` | Rating display used on hotels and reviews |
| `mobile/src/components/Loader.js` | Centered activity indicator |
| `mobile/src/components/EmptyState.js` | Friendly empty-list / error message |

---

## Part 12 — Mobile utilities and state

| File | Responsibility |
| --- | --- |
| `mobile/src/utils/constants.js` | `API_URL`, design `COLORS`, `STATUS_COLORS`, `ROOM_TYPES`, `BOOKING_STATUSES` |
| `mobile/src/utils/formatters.js` | Currency/date/night formatting for display |
| `mobile/src/utils/validators.js` | Client-side email, password, and booking-form validation |
| `mobile/src/redux/store.js` | Redux Toolkit store combining the slices |
| `mobile/src/redux/authSlice.js` | Token, user, role, login/logout thunks |
| `mobile/src/redux/bookingSlice.js` | Booking list, current booking, create/cancel thunks |
| `mobile/src/redux/roomSlice.js` | Room filters, search results, selected room |
| `mobile/src/navigation/AppNavigator.js` | Root navigator; switches between auth/main/admin based on token and role |
| `mobile/src/navigation/AuthStack.js` | Splash → Login → Register |
| `mobile/src/navigation/BookingStack.js` | Booking form, dates, details and payment flow |
| `mobile/src/navigation/MainTabs.js` | Home, Bookings, Profile tabs |
| `mobile/src/screens/auth/*` | `SplashScreen.js`, `LoginScreen.js`, `RegisterScreen.js` |
| `mobile/src/screens/home/*` | `HomeScreen.js`, `HotelListScreen.js`, `HotelDetailScreen.js`, `RoomDetailScreen.js` |
| `mobile/src/screens/booking/*` | `BookingScreen.js`, `BookingDetailScreen.js`, `MyBookingsScreen.js`, `PaymentScreen.js` |
| `mobile/src/screens/profile/*` | `ProfileScreen.js`, `EditProfileScreen.js` |
| `mobile/src/screens/admin/*` | `AdminDashboardScreen.js`, `ManageBookingsScreen.js`, `ManageRoomsScreen.js` for staff/admin roles |
| `mobile/App.js` | App root: Redux `Provider`, navigation container, status bar |
| `mobile/app.json` | Expo metadata, orientation, splash colours |
| `mobile/babel.config.js` | Babel preset for Expo |
| `mobile/.npmrc` | npm configuration for the Expo dependency tree |

---

## Part 13 — Seed data

The seed script is `server/seed/seedData.js`. It connects to the same MongoDB as the API and clears/recreates the demo collections, so **run it on a disposable database**.

```bash
cd server
npm run seed
# Or from the repository root: npm run seed
```

Expected output includes the inserted account emails and collection counts. What gets created:

| Entity | Count / accounts | Notes |
| --- | --- | --- |
| Users | 3 | `admin@test.com`, `staff@test.com`, `guest@test.com` — all with password `123456` (bcrypt-hashed) |
| Hotels | 3 | Different cities with descriptions, images and ratings |
| Rooms | 30 | 10 per hotel, mix of types/prices, with capacity and inventory |
| Amenities | 8 | e.g. WiFi, Pool, Breakfast, Parking, Air Conditioning, Gym, Spa, Pet Friendly |
| Bookings | 3 | `confirmed`/paid, `checked_in`/paid and `pending`/unpaid (plus 2 matching Payment documents) |

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@test.com` | `123456` |
| Staff | `staff@test.com` | `123456` |
| Guest | `guest@test.com` | `123456` |

After seeding, start the API (`npm run dev` in `server/`) and log in with any of the accounts above. The admin panel needs the **admin** account; the mobile app shows admin screens only for `admin`/`staff` roles.

---

## Part 14 — Setup and troubleshooting

### 14.1 Backend setup

```bash
cd server
npm install
copy .env.example .env        # PowerShell / Windows CMD
# or: cp .env.example .env    # macOS / Linux
# Edit .env: MONGODB_URI, JWT_SECRET; optional Cloudinary/Stripe/SMTP
npm run dev                   # http://localhost:5000/api
npm run seed                  # demo data (separate terminal)
```

Requirements: Node.js 18+, MongoDB running locally or a MongoDB Atlas URI. Verify with `GET http://localhost:5000/api/hotels` — an empty `items` array is fine before seeding.

### 14.2 Mobile setup

**Use the included folder (recommended):**

```bash
cd mobile
npm install
npx expo start
```

Press `a` (Android emulator), `i` (iOS simulator), `w` (browser), or scan the QR code with **Expo Go**. If your API is not at the default emulator address, set `EXPO_PUBLIC_API_URL` before starting Expo:

```bash
$env:EXPO_PUBLIC_API_URL="http://192.168.1.20:5000/api"   # PowerShell
npx expo start
```

**Alternative — create a fresh Expo app and copy the source:**

```bash
npx create-expo-app hotel-booking-mobile
cd hotel-booking-mobile
npm install axios @reduxjs/toolkit react-redux \
  @react-navigation/native @react-navigation/native-stack \
  @react-navigation/bottom-tabs @react-native-async-storage/async-storage \
  react-native-calendars expo-status-bar @expo/vector-icons
# Copy this project's mobile/App.js, app.json, babel.config.js and src/ into the new folder,
# then merge any dependency versions from mobile/package.json.
npm start
```

### 14.3 Stripe test setup

1. Create a **Stripe test-mode** account and copy the **publishable** key for Expo/Stripe.js and the **secret** key (`sk_test_...`) into `server/.env` as `STRIPE_SECRET_KEY`.
2. Install the Stripe CLI and log in: `stripe login`.
3. Forward webhook events to the local API:

   ```bash
   stripe listen --forward-to localhost:5000/api/payments/webhook
   ```

4. The CLI prints a signing secret like `whsec_...`; copy it into `server/.env` as `STRIPE_WEBHOOK_SECRET`, then restart the API.
5. In a second terminal trigger a test event: `stripe trigger payment_intent.succeeded` (or pay with a test card in the app).

**Test credentials (test mode only):**

| Item | Value |
| --- | --- |
| Card number | `4242 4242 4242 4242` (successful charge) |
| Declined card | `4000 0000 0000 0002` |
| Expiry | Any future date, e.g. `12/34` |
| CVC | Any 3 digits, e.g. `123` |
| ZIP | Any value, e.g. `12345` |
| Secret key prefix | `sk_test_...` — never use `sk_live_...` |
| Webhook secret prefix | `whsec_...` from `stripe listen` |

Stripe amounts are in the smallest currency unit; the API sends the booking total as `amount` with `currency: 'usd'` in the example responses.

### 14.4 Common errors and fixes

| Symptom | Cause | Fix |
| --- | --- | --- |
| `MongoDB connection failed: ECONNREFUSED 127.0.0.1:27017` | MongoDB is not running or URI is wrong | Start MongoDB / Docker, or set `MONGODB_URI` to a reachable Atlas URI; check network access rules |
| `MongoServerError: Authentication failed` | Bad Atlas credentials or wrong database in URI | Correct username/password and `authSource` in `MONGODB_URI` |
| Browser `CORS policy: No 'Access-Control-Allow-Origin' header` | Admin origin not allowed | Add the dev URL to `CLIENT_ORIGIN` (e.g. `http://localhost:5173`) and restart the API |
| `Cloudinary upload failed: Must supply api_key` | Cloudinary env vars missing | Fill `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`; rooms still save with no images until configured |
| Stripe `No signatures found matching the expected signature` | Webhook secret mismatch or body parsed by `express.json()` | Use the `whsec_...` printed by `stripe listen`; keep the webhook route before `express.json()` and send raw JSON |
| `400 Invalid webhook signature` from Stripe CLI | Wrong port or stale CLI session | Restart `stripe listen --forward-to localhost:5000/api/payments/webhook` with `PORT` matching the API |
| Mobile `Network request failed` | Emulator/device cannot reach `localhost` | Use `http://10.0.2.2:5000/api` on Android emulator, `http://localhost:5000/api` on iOS simulator, or your LAN IP on a real device; set `EXPO_PUBLIC_API_URL` |
| `401 No token provided` / `Token has expired` | Missing or stale JWT | Log in again; check the `Authorization: Bearer ...` header; confirm `JWT_SECRET` matches between token creation and verification |
| `403 Forbidden: insufficient permissions` | Wrong role for the endpoint | Log in with `admin@test.com` for admin-only actions or `staff@test.com` for admin/staff actions; promote via `PUT /api/admin/users/:id/role` |
| `EADDRINUSE: address already in use :::5000` | Another process owns the port | Stop the other process or set a different `PORT` in `server/.env` (and update `VITE_API_URL` / `EXPO_PUBLIC_API_URL`) |
| Vite `Failed to resolve import` or blank admin page | Dependencies missing / stale cache | `rm -rf node_modules` (Windows: `rmdir /s /q node_modules`), `npm install`, restart `npm run dev` |
| `404 Route not found` for `/api/...` | Wrong base path or router not mounted | Use `/api` prefix exactly; check `server/routes/index.js` and restart after route changes |
| Booking returns `409` unexpectedly | Overlapping active booking for the room | Pick different dates, another room, or cancel the existing booking; cancelled bookings are excluded from the overlap query |
| Emails not arriving | SMTP not configured | Expected in development: `server/utils/email.js` logs a preview instead; configure SMTP to actually send |

---

## Part 15 — Admin web panel

### 15.1 Overview

The admin panel is a React 18 + Vite 5 single-page app with Tailwind CSS 3 and React Router 6. It talks to the same REST API via `admin/src/api/axios.js`, which attaches the JWT from `localStorage` and redirects to `/login` on `401`.

### 15.2 Setup

```bash
cd admin
npm install
copy .env.example .env     # optional: override VITE_API_URL
npm run dev               # http://localhost:5173
```

Production build: `npm run build` (output in `admin/dist`), preview with `npm run preview`.

### 15.3 Pages

| Route | File | What it does |
| --- | --- | --- |
| `/login` | `admin/src/pages/LoginPage.jsx` | Email/password login, stores JWT + user in `localStorage` |
| `/` | `admin/src/pages/DashboardPage.jsx` | Metrics from `GET /api/admin/dashboard`: bookings, revenue, occupancy, users, hotels, rooms, recent bookings |
| `/hotels` | `admin/src/pages/HotelsPage.jsx` | List/create/edit/delete hotels |
| `/rooms` | `admin/src/pages/RoomsPage.jsx` | List/create/edit/delete rooms, including image upload |
| `/bookings` | `admin/src/pages/BookingsPage.jsx` | Filter bookings and change their status |
| `/users` | `admin/src/pages/UsersPage.jsx` | List users and change roles (`guest`/`staff`/`admin`) |

Supporting files: `admin/src/components/Layout.jsx` (sidebar + content shell), `ProtectedRoute.jsx` (admin guard), `Table.jsx`, `Modal.jsx`, `StatCard.jsx`; API wrappers `admin/src/api/{authApi,hotelApi,roomApi,bookingApi,userApi}.js`; `admin/src/index.css` (Tailwind directives); `admin/tailwind.config.js`, `admin/postcss.config.js`, `admin/vite.config.js`, `admin/index.html`.

### 15.4 Tailwind note

Tailwind is configured through `admin/tailwind.config.js` and `admin/postcss.config.js`; global directives (`@tailwind base`, `@tailwind components`, `@tailwind utilities`) live in `admin/src/index.css`. Add new utility classes in JSX using Tailwind class names rather than writing custom CSS; shared component styles belong in `Layout.jsx` or the specific component file. A production build requires `npm run build` so PostCSS can purge unused classes.

### 15.5 Default login

| Email | Password | Role |
| --- | --- | --- |
| `admin@test.com` | `123456` | admin |

`staff@test.com` / `123456` also works for dashboard and booking management, but the `/users` page and role changes require an **admin**. Create these accounts with `npm run seed` in `server/` first.
