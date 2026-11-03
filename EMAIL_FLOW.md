# Musikawedu email process flow

## Provider in use

| Setting | Value |
|--------|--------|
| Provider | **Brevo** (Sendinblue) SMTP relay |
| Laravel mailer | `smtp` (`MAIL_MAILER=smtp`) |
| Host | `smtp-relay.brevo.com` |
| Port | `587` (STARTTLS) |
| Username | `99faec001@smtp-brevo.com` |
| Password / SMTP key | `.env` → `MAIL_PASSWORD` (Brevo SMTP key — do not commit) |
| From address | `no-reply@musikawedu.co.zw` |
| From name | `Musikawedu` |

Config sources:

- `config/mail.php` — default mailer + SMTP settings
- `.env` — live credentials
- Queue: `QUEUE_CONNECTION=database` (some mails are queued)

There is **no** `RESEND_KEY` / `POSTMARK_TOKEN` driving production mail. Those exist in `config/services.php` but are unused while `MAIL_MAILER=smtp`.

---

## High-level flow

```
User / API / Admin action
        │
        ▼
Controller or Service builds a Mailable (app/Mail/*)
        │
        ├── Mail::to(...)->send(...)     // sync
        └── Mail::to(...)->queue(...)    // async via DB queue worker
        │
        ▼
Laravel Mail manager (config/mail.php → smtp)
        │
        ▼
SMTP AUTH to smtp-relay.brevo.com:587
  user = MAIL_USERNAME
  pass = MAIL_PASSWORD  ← Brevo SMTP API key
        │
        ▼
Brevo delivers email
From: MAIL_FROM_ADDRESS / MAIL_FROM_NAME
```

Blade HTML lives under `resources/views/emails/*` and `resources/views/vendor/mail/*`.

---

## What triggers email

| Flow | Trigger | Mailable | To |
|------|---------|----------|----|
| Email OTP login | `EmailOTPController` | `EmailOTPCodeMail` (queued) | User email |
| API key issued | `ApiSubscriptionController` | `ApiKeyIssuedMail` | Buyer email |
| Contact unlock paid | `ContactUnlockNotificationService` | `ContactUnlockPaidMail` | Seller / related inbox |
| Promotion confirmed | `PromotionController` | `PromotionOrderConfirmedMail` | Seller |
| Dedicated marketing | `PromotionController` | `DedicatedMarketingRequestMail` | Internal inbox |
| Seller verification | `SellerVerificationNotificationService` | Submitted / payment / decision mails | Seller + internal |
| Soil test request | `SoilTestController` | `SoilTestRequestMail` | Internal |
| Export crop review | `ExportCropReviewController` | `ExportCropReviewSubmittedMail` | Internal |
| Support donation thank-you | `SupportDonationController` | `SupportDonationThankYouMail` | Donor |
| Crop advisory paid | `SupportDonationController` | `CropAdvisoryRequestPaidMail` | Internal |
| Company job reply | Company job controllers | `Mail::raw(...)` | Applicant |

Queued mailables (need `php artisan queue:work` / `musikawedu-queue`):

- `EmailOTPCodeMail`
- `SellerVerificationSubmittedMail`

---

## Credentials to reuse in another app

### Option A — same Brevo SMTP (simplest)

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=99faec001@smtp-brevo.com
MAIL_PASSWORD=<copy from this project's .env MAIL_PASSWORD>
MAIL_FROM_ADDRESS=no-reply@musikawedu.co.zw
MAIL_FROM_NAME="Your App Name"
```

Laravel / Symfony Mailer / Nodemailer / Python smtplib all work with those SMTP settings.

### Option B — Brevo HTTP API (another app style)

1. Log into [Brevo](https://app.brevo.com) → **SMTP & API** → create/copy **API key** (or SMTP key).
2. HTTP API uses an `api-key` header; SMTP uses username + SMTP key as password.
3. Prefer a **separate** API/SMTP key per app so you can revoke one without breaking Musikawedu.

### Local copy command (on your machine only)

```bash
grep '^MAIL_' .env
```

---

## Checklist for the other app

1. Copy SMTP host/port/username/password (or create a new Brevo key).
2. Verify `no-reply@musikawedu.co.zw` (or your domain) is authenticated in Brevo (SPF/DKIM).
3. Set a clear From name so users can tell apps apart.
4. If you queue mail, run a queue worker in the new app too.
5. Do **not** commit `.env` or paste keys into public repos/chats.

---

## Security note

Sharing one Brevo SMTP key across apps works, but if that key leaks, both apps are compromised. Best practice: one Brevo SMTP/API key per application.
