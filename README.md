# Katanda Farewell Fundraiser

GoFundMe-style fundraising site for **Mr Thompson Katanda’s farewell (22 November 2026)** — Next.js frontend, Laravel API backend. Donors give without signing up. Admins log in to view an overview and confirm donations.

## Stack

- `frontend/` — Next.js (App Router) + Tailwind
- `backend/` — Laravel API + Sanctum + SQLite (default)

## Quick start

### 1. Backend

```bash
cd backend
composer install
cp .env.example .env   # if needed; .env already exists after create-project
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

API: [http://localhost:8000](http://localhost:8000)

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Site: [http://localhost:3000](http://localhost:3000)

Ensure `frontend/.env.local` contains:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Admin login

- URL: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Email: `admin@katandafarewell.test`
- Password: `password`

### Admin can

- See general overview (raised total, donors, pending, progress)
- Confirm / reject donations (confirmed amounts update the public progress bar)
- Edit campaign story, goal, event date, payment instructions

## Pesepay payments (USD)

Configured in `backend/.env`:

```
PESEPAY_ENABLED=true
PESEPAY_SANDBOX=true
PESEPAY_INTEGRATION_KEY=…
PESEPAY_ENCRYPTION_KEY=…   # exactly 32 characters
PESEPAY_CURRENCY=USD
PESEPAY_ECOCASH_METHOD_CODE=PZW211
FRONTEND_URL=http://localhost:3000
```

- **EcoCash** — seamless: donor enters phone → PIN prompt → status poll
- **Card & other** — redirect to Pesepay hosted checkout (Visa, Mastercard, Zimswitch, etc.)

If your keys are **live**, set `PESEPAY_SANDBOX=false`.  
`resultUrl` callbacks need a public HTTPS API URL in production (use ngrok/Cloudflare Tunnel locally).

## Public flow

1. Visitors open the campaign page (no account)
2. Choose amount + EcoCash or Card & other
3. Complete payment on phone (EcoCash) or Pesepay page (cards)
4. Successful payments auto-confirm and update the raised total

## Seeded sample data

- Campaign goal: **$5,000**
- Event date: **22 November 2026**
- Several confirmed donations + one pending donation for admin review

Update EcoCash / bank details in **Admin → Campaign**.
