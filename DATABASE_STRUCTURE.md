# Database Structure - Booking System

## Current Database Tables

### 1. **Booking Table** (Main booking information)

| Field Name | Type | Nullable | Description |
|------------|------|----------|-------------|
| `id` | Text | NO | Booking ID (sequential, starts from "0001") |
| `packageId` | Text | NO | Reference to Package table |
| `packageName` | Text | YES | Package name (stored for quick access) |
| `roomId` | Text | NO | Reference to Room table |
| `roomName` | Text | YES | Room name (stored for quick access) |
| `arrivalDate` | Timestamp | NO | Check-in date |
| `checkoutDate` | Timestamp | YES | Check-out date |
| `people` | Integer | NO | Number of guests |
| `guestFullName` | Text | YES | Primary guest full name |
| `guestAge` | Integer | YES | Primary guest age |
| `guestCountry` | Text | YES | Primary guest country |
| `guestPhone` | Text | YES | Primary guest phone number |
| `guestEmail` | Text | YES | Primary guest email |
| `surfLevel` | Text | YES | Primary guest surf level |
| `gender` | Text | YES | Primary guest gender |
| `insurance` | Boolean | NO | Insurance included (default: false) |
| `airportTransfer` | Boolean | YES | Airport transfer included (default: false) |
| `paymentType` | Text | NO | Payment type (e.g., "full", "deposit") |
| `total` | Integer | NO | Total amount in cents/EUR |
| `createdAt` | Timestamp | NO | Booking creation date (auto) |

**Current Information Stored:**
- ✅ Booking ID
- ✅ Package name (denormalized for quick access)
- ✅ Room name (denormalized for quick access)
- ✅ Arrival date
- ✅ Checkout date
- ✅ Number of people
- ✅ Primary guest information (name, age, country, phone, email, surf level, gender)
- ✅ Insurance status
- ✅ Airport transfer status
- ✅ Payment type
- ✅ Total amount
- ✅ Creation timestamp

**Missing/Can be improved:**
- ⚠️ All traveller details are in separate `Traveller` table (see below)
- ⚠️ Add-on details are in separate `BookingAddOn` table (see below)

---

### 2. **Traveller Table** (All guests in a booking)

| Field Name | Type | Nullable | Description |
|------------|------|----------|-------------|
| `id` | Text | NO | Traveller ID (UUID) |
| `bookingId` | Text | YES | Reference to Booking table |
| `name` | Text | NO | Full name (combination of firstName + lastName) |
| `firstName` | Text | YES | First name |
| `lastName` | Text | YES | Last name |
| `email` | Text | YES | Email address |
| `year` | Text | YES | Birth year |
| `month` | Text | YES | Birth month |
| `day` | Text | YES | Birth day |
| `country` | Text | YES | Country |
| `phone` | Text | YES | Phone number |
| `surfLevel` | Text | YES | Surf level |
| `gender` | Text | YES | Gender |

**Current Information Stored:**
- ✅ All traveller names
- ✅ Traveller contact information (email, phone)
- ✅ Traveller date of birth (year, month, day)
- ✅ Traveller country
- ✅ Traveller surf level
- ✅ Traveller gender

**Relationship:**
- One Booking can have multiple Travellers (one-to-many)

---

### 3. **Package Table** (Package details)

| Field Name | Type | Nullable | Description |
|------------|------|----------|-------------|
| `id` | Text | NO | Package ID |
| `name` | Text | NO | Package name |
| `description` | Text | NO | Package description |
| `price` | Integer | NO | Package price |
| `destinationId` | Text | NO | Reference to Destination table |

---

### 4. **Room Table** (Room details)

| Field Name | Type | Nullable | Description |
|------------|------|----------|-------------|
| `id` | Text | NO | Room ID |
| `name` | Text | NO | Room name |
| `description` | Text | NO | Room description |
| `price` | Integer | NO | Room price per person |
| `capacity` | Integer | NO | Room capacity |

---

### 5. **BookingAddOn Table** (Add-ons selected for a booking)

| Field Name | Type | Nullable | Description |
|------------|------|----------|-------------|
| `id` | Text | NO | BookingAddOn ID (UUID) |
| `bookingId` | Text | NO | Reference to Booking table |
| `addOnId` | Text | NO | Reference to AddOn table |

**Relationship:**
- One Booking can have multiple AddOns (many-to-many via BookingAddOn)
- To get add-on names, join with `AddOn` table

---

### 6. **AddOn Table** (Available add-ons)

| Field Name | Type | Nullable | Description |
|------------|------|----------|-------------|
| `id` | Text | NO | AddOn ID |
| `name` | Text | NO | Add-on name |
| `price` | Integer | NO | Add-on price |

---

## Current Data Structure Summary

### What You Can See Per Booking:

**In Booking Table:**
- Booking ID (e.g., "0001", "0002")
- Package name
- Room name
- Arrival date
- Checkout date
- Number of people
- Primary guest details (name, age, country, phone, email, surf level, gender)
- Insurance (yes/no)
- Airport transfer (yes/no)
- Payment type
- Total amount
- Creation date

**In Traveller Table (related to Booking):**
- All traveller names (firstName + lastName)
- All traveller emails
- All traveller phone numbers
- All traveller dates of birth
- All traveller countries
- All traveller surf levels
- All traveller genders

**In BookingAddOn Table (related to Booking):**
- Add-on IDs (need to join with AddOn table to get names)

---

## Suggested Improvements for Easier Reading

### Option 1: Create a View for Easy Reading
Create a database view that joins all tables together:

```sql
CREATE VIEW booking_details_view AS
SELECT 
    b.id as booking_id,
    b.packageName,
    b.roomName,
    b.arrivalDate,
    b.checkoutDate,
    b.people,
    b.guestFullName as primary_guest_name,
    b.guestEmail as primary_guest_email,
    b.guestPhone as primary_guest_phone,
    b.guestCountry as primary_guest_country,
    b.guestAge as primary_guest_age,
    b.surfLevel as primary_guest_surf_level,
    b.gender as primary_guest_gender,
    b.insurance,
    b.airportTransfer,
    b.paymentType,
    b.total,
    b.createdAt,
    -- Aggregate travellers
    STRING_AGG(t.firstName || ' ' || t.lastName, ', ') as all_traveller_names,
    STRING_AGG(t.email, ', ') as all_traveller_emails,
    STRING_AGG(t.phone, ', ') as all_traveller_phones,
    STRING_AGG(t.country, ', ') as all_traveller_countries,
    -- Aggregate add-ons
    STRING_AGG(a.name, ', ') as add_on_names
FROM "Booking" b
LEFT JOIN "Traveller" t ON t."bookingId" = b.id
LEFT JOIN "BookingAddOn" ba ON ba."bookingId" = b.id
LEFT JOIN "AddOn" a ON a.id = ba."addOnId"
GROUP BY b.id, b.packageName, b.roomName, b.arrivalDate, b.checkoutDate, 
         b.people, b.guestFullName, b.guestEmail, b.guestPhone, b.guestCountry,
         b.guestAge, b.surfLevel, b.gender, b.insurance, b.airportTransfer,
         b.paymentType, b.total, b.createdAt;
```

### Option 2: Add More Denormalized Fields to Booking Table
- Add `allTravellerNames` (comma-separated) - for quick view
- Add `addOnNames` (comma-separated) - for quick view
- Add `duration` (number of nights) - calculated field

### Option 3: Create a Summary Table
Create a separate `BookingSummary` table that stores aggregated data for reporting.

---

## Recommended Query for Reading All Booking Information

```sql
SELECT 
    b.id as "Booking ID",
    b."packageName" as "Package",
    b."roomName" as "Room",
    TO_CHAR(b."arrivalDate", 'DD/MM/YYYY') as "Arrival Date",
    TO_CHAR(b."checkoutDate", 'DD/MM/YYYY') as "Checkout Date",
    b.people as "Number of Guests",
    b."guestFullName" as "Primary Guest",
    b."guestEmail" as "Primary Email",
    b."guestPhone" as "Primary Phone",
    b."guestCountry" as "Primary Country",
    b."guestAge" as "Primary Age",
    b."surfLevel" as "Primary Surf Level",
    b.gender as "Primary Gender",
    b.insurance as "Insurance",
    b."airportTransfer" as "Airport Transfer",
    b."paymentType" as "Payment Type",
    b.total / 100.0 as "Total (EUR)",
    TO_CHAR(b."createdAt", 'DD/MM/YYYY HH24:MI') as "Created At",
    -- All travellers
    (
        SELECT STRING_AGG(t."firstName" || ' ' || t."lastName", ', ')
        FROM "Traveller" t
        WHERE t."bookingId" = b.id
    ) as "All Traveller Names",
    (
        SELECT STRING_AGG(t.email, ', ')
        FROM "Traveller" t
        WHERE t."bookingId" = b.id
    ) as "All Traveller Emails",
    -- Add-ons
    (
        SELECT STRING_AGG(a.name, ', ')
        FROM "BookingAddOn" ba
        JOIN "AddOn" a ON a.id = ba."addOnId"
        WHERE ba."bookingId" = b.id
    ) as "Add-Ons"
FROM "Booking" b
ORDER BY b."createdAt" DESC;
```

---

## Questions for You:

1. **Do you want to keep the current structure** (with separate Traveller and BookingAddOn tables)?
2. **Or would you prefer to add denormalized fields** to the Booking table for easier reading (like `allTravellerNames`, `addOnNames`)?
3. **Do you want me to create a database view** that joins everything together for easy querying?
4. **Any additional fields** you'd like to store that are currently missing?

Let me know your preferences and I'll implement the changes!

