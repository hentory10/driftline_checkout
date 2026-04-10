# 🏄 DRIFTLINE CHECKOUT — SESSION RESUME FILE

> Last updated: 2026-04-10 ~19:43 (Casablanca time)
> Read this file when resuming — it contains the full current state of work.

---

## ✅ SESSION 2026-04-10 — WHAT WAS DONE

### 20. Calendar — Reopened June, July & August 2026 (DONE)

**File:** `app/checkout/2-dates/page.tsx`

**Change:** Narrowed the closed season from April–August → **April–May only**.

**Details:**
- Was: `day.getMonth() >= 3 && day.getMonth() <= 7` (blocked Apr, May, Jun, Jul, Aug)
- Now: `day.getMonth() >= 3 && day.getMonth() <= 4` (blocks Apr, May only)
- **June (6), July (7), August (8) 2026 Fridays are now selectable**

---

## ✅ SESSION 2026-04-06 — WHAT WAS DONE

### 16. Calendar — Switched from Saturday-Only to Friday-to-Friday Booking (DONE)

**Files:** `app/checkout/2-dates/page.tsx`, `app/checkout/6-payment/page.tsx`

**Change:** Check-in and checkout are now both **Fridays** (7 nights, Fri → Fri).

**Details:**
- `firstAvailableSaturday` → `firstAvailableFriday` (uses `day === 5`, skips today if today is Friday)
- `handleSelect` guard: only allows `day.getDay() === 5` (Friday)
- Stale-date cleanup: clears stored date if it is not a Friday (`!== 5`)
- Calendar cell logic: `isSaturday → isFriday`, `isAvailableSaturday → isAvailableFriday`
- Checkout date: changed from `arrival + (days - 1)` → `arrival + days`
  - e.g. Check-in Fri Sep 11 + 7 = Checkout Fri Sep 18 ✅
- Same change applied to `6-payment/page.tsx` so the DB stores the correct checkout date
- Same change applied to `components/BookingSummary.tsx` so the Récapitulatif sidebar shows the correct checkout date
- Closed season (April–August 2026) and booked-date blocking remain unchanged

### 17. Récapitulatif — Checkout Date Display Fixed (DONE)

**File:** `components/BookingSummary.tsx`
- Was using `checkInDay + (days - 1)` → showed Sep 10 instead of Sep 11
- Fixed to `checkInDay + days` → now correctly shows Fri Sep 11 when check-in is Fri Sep 4

### 18. Dates Page — Button Renamed (DONE)

**File:** `app/checkout/2-dates/page.tsx`
- Button label changed: `"INFORMATIONS →"` → `"TRANSFERT →"`

### 19. Package Page — Nights Updated (DONE)

**File:** `store/booking.ts`
- Package included items: `"6 nuits d'hébergement"` → `"7 nuits d'hébergement"` (matches Fri→Fri model)

---

## ✅ SESSION 2026-04-01 — WHAT WAS DONE


### 11. Page 4 — Add-Ons Step Now Visible & Fully Reworked (DONE)

**Files:** `app/checkout/4-add-ons/page.tsx`, `store/booking.ts`, `components/ProgressBar.tsx`, `app/checkout/2-dates/page.tsx`

- Step 4 is no longer hidden — it is now a fully active step in the checkout flow
- Route: `2-dates` → `4-add-ons` → `5-informations`
- ProgressBar updated to show step 4

**Add-on content (3 items):**
| ID | Name | Price | Image |
|----|------|-------|-------|
| 1 | Transfer Marrakech Airport → Agadir (Aller) | 225 EUR / véhicule | `/images/transfer.webp` |
| 2 | Transfer Agadir → Marrakech Airport (Retour) | 225 EUR / véhicule | `/images/transfer.webp` |
| 3 | Transfer Agadir Airport ↔ Driftline (Aller-Retour) | 0 EUR — Gratuit | `/images/transfer.webp` |

**Price display:** `225 EUR / véhicule` with `(25 EUR / pers.)` shown in gray beside it

**Button behavior:**
- Unselected → gray border for ALL buttons (including the free one)
- Selected → green (`border-green-500 text-green-700 bg-green-50`) with `✓ Ajouté`
- "INFORMATIONS →" button is **disabled** until at least one add-on is selected

**UI cleanup:**
- Removed "Number of people" header from the add-ons page
- Image changed from `IM.jpg` → `transfer.webp`

---

### 12. BookingSummary — "Options choisies" Now Visible (DONE)

**File:** `components/BookingSummary.tsx`

- `{false && (...)}` wrapper removed — section now renders
- Shows selected add-on names in the recap
- If nothing selected: displays `"Aucune option sélectionnée"` in gray

---

### 13. Database — `transfer_options` Column Added to Booking Table (DONE)

**Supabase migration applied** — new column added to `public.Booking`:

| Column | Type | Description |
|--------|------|-------------|
| `transfer_options` | `text` | Comma-separated slugs of selected transfers, or `null` |

**Examples of stored values:**
- `"marrakech_to_agadir"`
- `"agadir_to_marrakech"`
- `"marrakech_to_agadir, agadir_airport_to_driftline"`
- `null` (no transfer selected)

---

### 14. Backend — Transfer Options Saved on Payment (DONE)

**File:** `app/checkout/6-payment/page.tsx`
- Maps selected add-on IDs → slugs:
  - `'1'` → `marrakech_to_agadir`
  - `'2'` → `agadir_to_marrakech`
  - `'3'` → `agadir_airport_to_driftline`
- Joins with `", "` → sends as `transfer_options` in the booking API payload

**File:** `app/api/booking/route.ts`
- Reads `transfer_options` from request body
- Saves it to `Booking.transfer_options` in Supabase
- Includes it in the n8n webhook payload

---

### 15. Confirmation Page — Transfer Options Displayed (DONE)

**File:** `app/confirmation/[id]/page.tsx`
- Reads `booking.transfer_options` from Supabase
- Shows nothing if `null`
- Converts slugs back to human-readable labels joined with ` + `
- Example: `Transferts : Transfer Marrakech Airport → Agadir (Aller) + Transfer Agadir Airport ↔ Driftline (Gratuit)`

---

---

## ✅ WHAT WAS COMPLETED THIS SESSION

### 1. Option B — Saturday-Only Booking Logic (DONE)

**File:** `app/checkout/2-dates/page.tsx`
- Added `firstAvailableSaturday` calculation (if today is Saturday, skip to next week)
- All days before `firstAvailableSaturday` are gray + strikethrough + unclickable
- Only future available Saturdays show the red border and are clickable

---

### 2. Booked Dates — Block Entire Range from DB (DONE)

**File:** `app/api/booked-dates/route.ts`
- Fetches **ALL bookings** (no status filter — all statuses blocked)
- Returns every day from `checkinDate` through `checkoutDate` **inclusive** (including checkout date) as `YYYY-MM-DD`
- Loop uses `while (current <= checkout)` — checkout date IS grayed out
- `export const dynamic = 'force-dynamic'` — no Next.js caching
- `Cache-Control: no-store` header on response — no browser/CDN caching

**File:** `app/checkout/2-dates/page.tsx`
- Fetches `/api/booked-dates` with `{ cache: 'no-store' }` on mount
- Days matching the DB range are gray + strikethrough + unclickable

---

### 3. Strikethrough on ALL Unavailable Dates (DONE)

**File:** `app/checkout/2-dates/page.tsx`
- All unavailable days (past, booked, or blocked season) get:
  - `text-gray-300 cursor-not-allowed`
  - `line-through`
  - `disabled={true}`

---

### 4. Closed Season: April → August 2026 (DONE)

**File:** `app/checkout/2-dates/page.tsx`
- Added `isBlockedSeason` check: any date in 2026 where `month >= 3 && month <= 7`
  (April = month 3, August = month 7 in JS 0-indexed)
- These months are fully grayed out, strikethrough, and unclickable
- Combined into a single `isUnavailable` flag: `isPastDay || isBooked || isBlockedSeason`
- Only September 2026 onwards will have clickable Saturdays

---

### 5. Payment Columns Added to Booking Table (DONE)

**Supabase migration applied** — 2 new columns added to `public.Booking`:

| Column | Type | Description |
|--------|------|-------------|
| `payment_amount` | `integer` | Amount actually charged (deposit or full) |
| `remaining_amount` | `integer` | Balance left to pay on arrival |

**File:** `app/api/booking/route.ts`
- `deposit` → `payment_amount = total × 20%`, `remaining_amount = total × 80%`
- `full` → `payment_amount = total`, `remaining_amount = 0`
- Both fields persisted to Supabase and sent to n8n webhook

---

### 6. Checkout Date Timezone Bug Fix (DONE)

**Problem:** Booking Sep 12 → Sep 18 was saving Sep 19 in the DB and showing Sep 19 on the thank-you page.

**File:** `app/checkout/6-payment/page.tsx`
- Parse `arrivalDate` using `split('-')` → local date (no UTC shift)
- Use `days - 1` (matching calendar formula)
- Format as `YYYY-MM-DD` string before sending to API

**File:** `app/confirmation/[id]/page.tsx`
- Extract date as `iso.substring(0, 10)` — no timezone conversion
- Format as `DD/MM/YYYY`

---

### 7. Cancellation Policy Updated (DONE)

**File:** `components/ProgressBar.tsx`
- Changed "30 jours" → **"60 jours"**:
  > *Annulation avec remboursement gratuit jusqu'à 60 jours avant votre arrivée.*

---

### 8. Step 5 Checkboxes Hidden (DONE)

**File:** `app/checkout/5-informations/page.tsx`
- Both checkboxes wrapped in `{false && (...)}` — hidden but preserved
  - ~~J'accepte les conditions générales et la politique de confidentialité~~
  - ~~Je souhaite rejoindre la communauté Driftline~~
- Re-enable: change `false` → `true`

---

### 9. n8n Webhook → Production URL (DONE — 2026-03-30 ~21:47)

**File:** `app/api/booking/route.ts`
- Switched from test to **production** webhook:
  - ~~`https://skiki.app.n8n.cloud/webhook-test/eb196efb-...`~~
  - ✅ `https://skiki.app.n8n.cloud/webhook/eb196efb-842e-4532-b2f8-4b8338719e5c`
- Fires automatically after every confirmed payment (non-blocking)
- Make sure the n8n workflow is **activated (toggled ON)** in n8n

---

### 10. Mobile Calendar — Show 1 Month Instead of 2 (DONE)

**File:** `app/checkout/2-dates/page.tsx`
- Added `isMobile` state using `window.innerWidth < 640` (Tailwind's `sm` breakpoint)
- Resize listener updates `isMobile` dynamically if the window is resized
- On mobile: only `leftMonth` (1 month) is rendered in both the header and the grid
- On desktop/tablet (`>= 640px`): both `leftMonth` + `rightMonth` rendered as before
- Replaces the old CSS-only `hidden sm:block` approach with proper JS-controlled rendering
- **Calendar cells bumped up on mobile:** `w-9 h-9` buttons, `text-sm` font, `p-3` container padding, `text-xs` day headers — fills the screen width comfortably

---


**Supabase project:** `driftline_checkout`
**Project ID:** `rzibwjzcuxpnjsgmzjku`
**Region:** `eu-central-1`

**Booking table — current columns:**
| Column | Type | Notes |
|--------|------|-------|
| `id` | text | Sequential 4-digit: 0001, 0002... |
| `packageName` | text | |
| `checkinDate` | timestamptz | |
| `checkoutDate` | timestamptz | nullable |
| `duration` | text | nullable |
| `numberOfPeople` | integer | |
| `yogaCoachId` | text | FK → YogaCoach.id |
| `yogaCoachName` | text | nullable |
| `yogaStudio` | text | nullable |
| `paymentType` | text | default: 'full' |
| `total` | integer | |
| `payment_amount` | integer | ✅ amount charged |
| `remaining_amount` | integer | ✅ balance due on arrival |
| `currency` | text | default: 'EUR' |
| `bookingStatus` | text | default: 'confirmed' |
| `createdAt` | timestamptz | default: now() |

**Current data (2 test rows — both inside closed season):**
| id   | packageName     | checkinDate      | checkoutDate     | bookingStatus |
|------|-----------------|------------------|------------------|---------------|
| 0001 | PACK COACH YOGA | 2026-04-25 (Sat) | 2026-05-02 (Fri) | confirmed     |
| 0002 | PACK COACH YOGA | 2026-05-23 (Sat) | 2026-05-29 (Fri) | confirmed     |

---

## 📁 KEY FILES MODIFIED

| File | What changed |
|------|-------------|
| `app/checkout/2-dates/page.tsx` | Saturday-only logic + booked dates + closed season + strikethrough + **mobile 1-month calendar** |
| `app/api/availability/route.ts` | Saturday generation fix |
| `app/api/booked-dates/route.ts` | Booked range inclusive of checkout (`<=`), force-dynamic, no-store |
| `app/api/booking/route.ts` | payment columns + **production n8n webhook URL** |
| `app/checkout/6-payment/page.tsx` | Local date parse + `days-1` + `YYYY-MM-DD` to API |
| `app/confirmation/[id]/page.tsx` | Date display via `iso.substring(0,10)` |
| `components/ProgressBar.tsx` | "30 jours" → "60 jours" |
| `app/checkout/5-informations/page.tsx` | Both checkboxes hidden |

---

## ⚠️ WHAT STILL NEEDS TO BE DONE

1. **Test a new booking end-to-end** — Sep 12 → verify Sep 18 in DB, thank-you page, and n8n fires
2. **Optional cleanup** — Delete test bookings `0001` / `0002` from Supabase
3. ✅ **Deployed** to Vercel via GitHub push
4. ✅ **Vercel env variables** — All Supabase vars added

---

## 🌐 VERCEL ENVIRONMENT VARIABLES

### ✅ Already Added on Vercel
| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | Set — confirm it's the **Live** Client ID from developer.paypal.com, not Sandbox |
| `DATABASE_URL` | Set — PostgreSQL Supabase direct connection |

### ✅ All Vercel Env Variables Added
| Variable | Status |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Added |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Added |

---

## 🚀 HOW TO RESUME

1. `npm run dev`
2. Open `http://localhost:3000`
3. Complete a test booking on Sep 12
4. Verify: DB shows Sep 18, confirmation page shows Sep 18, n8n workflow triggered

---

## 🔑 ENV VARIABLES (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://rzibwjzcuxpnjsgmzjku.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_TH6k4CH-NiM8hiUdMyEanQ_kG6ySQgC
```
