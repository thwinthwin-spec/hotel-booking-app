# Hotel Booking API (backend only)

Express + MongoDB REST API for the hotel booking app. CommonJS, no frontend code here.

## Run locally

```bash
cd server
npm install
cp .env.example .env   # Windows: copy .env.example .env
npm run seed           # optional demo data (requires MongoDB on 27017)
npm run dev            # nodemon
# or: npm start
```

`npm run seed` creates `admin@test.com`, `staff@test.com` and `guest@test.com` (all password `123456`), 8 amenities, 3 hotels, 30 rooms and 3 sample bookings.

Health check: `GET /api/health`.

## Notes

- JWT auth via `Authorization: Bearer <token>`. Roles: `guest`, `staff`, `admin`.
- Room images are uploaded with Multer memory storage and pushed to Cloudinary. JSON bodies work without images.
- Stripe webhook is registered with `express.raw()` before `express.json()` at `POST /api/payments/webhook`. Set `STRIPE_WEBHOOK_SECRET` in production.
- Without SMTP settings, emails are logged to the console instead of sent.
- A cron job cancels pending/unpaid bookings older than 30 minutes.
- `NODE_ENV=development` adds stack traces to error responses.
