# Production-Ready UPI Payment Checkout System (PHP 8+ & MySQL)

A dark premium UPI payment gateway checkout system faithfully matching the multi-step verification and manual review flow.

---

## 🎨 UI / UX Flow (4 Pages + Success)

1. **Page 1: UPI Checkout (`/public/checkout.php`)**
   - Dark navy/black background (`#080c15`), lighter cards (`#0f172a`), thin borders (`#223354`).
   - Dynamic price: `Pay ₹149 with UPI`.
   - UPI App list: **PhonePe** (with purple brand glyph), **Paytm** (with Paytm logo styling), **QR Code**.
   - Primary action button: Large green button (`#00c26f`) with up/down arrows: *"Submit Screenshot After Payment"*.

2. **Page 2: QR Payment (`/public/qr.php`)**
   - Clean white QR container with purple *"Scan & Pay"* title and amount.
   - Dynamic countdown timer (starts from `29:29`).
   - High-contrast UPI QR code generated with standard QR specifications.
   - *"Save QR"* button to download the QR code image directly to device.
   - App badges: `Scan & pay with G Pay | PhonePe | Paytm or any UPI app`.
   - Live waiting spinner and subtext.
   - Primary action button: Green *"Submit Screenshot After Payment"* button.

3. **Page 3: Screenshot Upload (`/public/proof.php`)**
   - Header: Orange uppercase `PAYMENT CONFIRMATION` + *Screenshot Upload करें*.
   - Subtitle: *Payment ke baad Screenshot Upload करो.*
   - Custom styled file input with instant image thumbnail preview.
   - Strict server-side validation: Max 5MB, MIME checking (JPEG, PNG, WebP).
   - Primary action button: Bright orange button (`#ff5500`): *Screenshot Upload करें →*.
   - Anti-fraud disclaimer banner.

4. **Page 4: Manual Review Required (`/public/status.php`)**
   - Circular dark avatar with white "V".
   - Orange label `UPI PAYMENT CHECK` + heading *Manual review required*.
   - Animated verification window progress bar.
   - Order details row with copyable Order ID (`VVV-XXXXXXXXXXXX`), Amount, and Status (`Manual Review`).
   - Highlighted queue card with spinning indicator: *"Your payment proof is in the manual queue"*.
   - Automatic background polling every 2.5s against `/api/payments/status.php`.

5. **Page 5: Payment Success (`/public/success.php`)**
   - Green verified checkmark badge.
   - Unlocked access button to download / view the VIP content.

---

## 🛠️ Tech Stack & Architecture

- **Backend**: PHP 8.1+ with strict typing (`declare(strict_types=1);`).
- **Database**: MySQL 8+ / MariaDB with PDO prepared statements, foreign keys, and indexes.
- **Security**:
  - CSRF tokens on forms.
  - Rate limiting on API endpoints (`RateLimiter.php`).
  - Strict MIME validation (`finfo_file`) and randomized storage filenames.
  - `.htaccess` blocking PHP script execution in `/storage/uploads/`.
  - Secure session handling (`HttpOnly`, `SameSite=Lax`).
  - Webhook HMAC SHA-256 signature verification.
  - Full audit logging for payments and admin actions.

---

## 🚀 Quick Start & Installation

### 1. Database Setup
```bash
mysql -u root -p < database/schema.sql
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and fill in your database credentials and merchant UPI ID:
```bash
cp .env.example .env
```

### 3. Local Development Server
Run PHP's built-in development server:
```bash
php -S 0.0.0.0:8000 -t public/
```

### 4. Admin Credentials
- **URL**: `http://localhost:8000/admin/login.php`
- **Username**: `admin`
- **Password**: `Admin@123456`
