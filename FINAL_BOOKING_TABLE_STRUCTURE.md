# Final Booking Table Structure - All Details Included

## Complete Booking Table Structure

### All Fields in Booking Table:

| Field Name | Type | Nullable | Description |
|------------|------|----------|-------------|
| **Basic Information** | | | |
| `id` | Text | NO | Booking ID (sequential, starts from "0001") |
| `packageId` | Text | NO | Reference to Package table |
| `packageName` | Text | YES | Package name |
| `roomId` | Text | NO | Reference to Room table |
| `roomName` | Text | YES | Room name |
| `arrivalDate` | Timestamp | NO | Check-in date |
| `checkoutDate` | Timestamp | YES | Check-out date |
| `duration` | Integer | YES | Number of nights (calculated from arrival to checkout) |
| `durationLabel` | Text | YES | Duration label (e.g., "7 nights", "1 week", "14 nights") |
| `people` | Integer | NO | Number of guests |
| `travellerCount` | Integer | YES | Number of travellers (same as `people` but explicit) |
| **All Travellers Information (Comma-separated)** | | | |
| `allTravellerNames` | Text | YES | All traveller names (e.g., "John Doe, Jane Doe") |
| `allTravellerFirstNames` | Text | YES | All traveller first names (e.g., "John, Jane") |
| `allTravellerLastNames` | Text | YES | All traveller last names (e.g., "Doe, Doe") |
| `allTravellerEmails` | Text | YES | All traveller emails (e.g., "john@example.com, jane@example.com") |
| `allTravellerPhones` | Text | YES | All traveller phone numbers (e.g., "+1234567890, +1234567891") |
| `allTravellerCountries` | Text | YES | All traveller countries (e.g., "USA, USA") |
| `allTravellerAges` | Text | YES | All traveller ages (e.g., "25, 30") |
| `allTravellerBirthDates` | Text | YES | All traveller birth dates (e.g., "1998-05-15, 1993-08-20") |
| `allTravellerSurfLevels` | Text | YES | All traveller surf levels (e.g., "Beginner, Intermediate") |
| `allTravellerGenders` | Text | YES | All traveller genders (e.g., "Male, Female") |
| **Add-Ons Information** | | | |
| `addOnNames` | Text | YES | All add-on names (e.g., "Airport Transfer, Equipment Rental") |
| `addOnIds` | Text | YES | All add-on IDs (e.g., "1, 2") |
| `addOnCount` | Integer | YES | Number of add-ons selected |
| **Pricing Information** | | | |
| `packagePrice` | Integer | YES | Package price (from Package table, for reference) |
| `roomPrice` | Integer | YES | Room price per person (from Room table, for reference) |
| `subtotal` | Integer | YES | Subtotal before add-ons (package price + room price) |
| `addOnsTotal` | Integer | YES | Total of all add-ons |
| `insuranceAmount` | Integer | YES | Insurance amount (if applicable) |
| `total` | Integer | NO | Total amount in cents/EUR |
| `currency` | Text | YES | Currency (default: "EUR") |
| **Booking Options** | | | |
| `insurance` | Boolean | NO | Insurance included |
| `airportTransfer` | Boolean | YES | Airport transfer included |
| `paymentType` | Text | NO | Payment type (e.g., "full", "deposit") |
| **Status & Metadata** | | | |
| `bookingStatus` | Text | YES | Booking status (e.g., "confirmed", "pending", "cancelled") |
| `notes` | Text | YES | Internal notes about the booking |
| `createdAt` | Timestamp | NO | Booking creation date (auto) |

---

## Example of Complete Booking Record:

```
id: "0001"
packageId: "pkg-1"
packageName: "Surf Camp Package"
roomId: "2"
roomName: "Triple room - Oubaha"
arrivalDate: "2025-12-01 00:00:00"
checkoutDate: "2025-12-08 00:00:00"
duration: 7
durationLabel: "1 week"
people: 2
travellerCount: 2
allTravellerNames: "John Doe, Jane Doe"
allTravellerFirstNames: "John, Jane"
allTravellerLastNames: "Doe, Doe"
allTravellerEmails: "john@example.com, jane@example.com"
allTravellerPhones: "+1234567890, +1234567891"
allTravellerCountries: "USA, USA"
allTravellerAges: "25, 30"
allTravellerBirthDates: "1998-05-15, 1993-08-20"
allTravellerSurfLevels: "Beginner, Intermediate"
allTravellerGenders: "Male, Female"
addOnNames: "Airport Transfer"
addOnIds: "1"
addOnCount: 1
packagePrice: 40000
roomPrice: 0
subtotal: 40000
addOnsTotal: 10000
insuranceAmount: 0
total: 50000
currency: "EUR"
insurance: false
airportTransfer: true
paymentType: "full"
bookingStatus: "confirmed"
notes: null
createdAt: "2025-11-08 10:30:00"
```

---

## Query Example - Read All Booking Information:

```sql
SELECT 
    id as "Booking ID",
    "packageName" as "Package",
    "roomName" as "Room",
    TO_CHAR("arrivalDate", 'DD/MM/YYYY') as "Arrival",
    TO_CHAR("checkoutDate", 'DD/MM/YYYY') as "Checkout",
    duration || ' nights' as "Duration",
    people as "Guests",
    "allTravellerNames" as "All Travellers",
    "allTravellerEmails" as "All Emails",
    "allTravellerPhones" as "All Phones",
    "allTravellerCountries" as "All Countries",
    "allTravellerAges" as "All Ages",
    "allTravellerSurfLevels" as "All Surf Levels",
    "addOnNames" as "Add-Ons",
    "insurance" as "Insurance",
    "airportTransfer" as "Airport Transfer",
    "paymentType" as "Payment",
    total / 100.0 as "Total (EUR)",
    "bookingStatus" as "Status",
    TO_CHAR("createdAt", 'DD/MM/YYYY HH24:MI') as "Created"
FROM "Booking"
ORDER BY "createdAt" DESC;
```

---

## Summary of Changes:

✅ **REMOVED** Primary guest fields (redundant):
- ❌ guestFullName
- ❌ guestEmail
- ❌ guestPhone
- ❌ guestCountry
- ❌ guestAge
- ❌ surfLevel
- ❌ gender

✅ **ADDED** All traveller information (aggregated):
- ✅ allTravellerNames
- ✅ allTravellerFirstNames
- ✅ allTravellerLastNames
- ✅ allTravellerEmails
- ✅ allTravellerPhones
- ✅ allTravellerCountries
- ✅ allTravellerAges
- ✅ allTravellerBirthDates
- ✅ allTravellerSurfLevels
- ✅ allTravellerGenders

✅ **ADDED** Add-ons information:
- ✅ addOnNames
- ✅ addOnIds
- ✅ addOnCount

✅ **ADDED** Calculated/summary fields:
- ✅ duration
- ✅ durationLabel
- ✅ packagePrice
- ✅ roomPrice
- ✅ subtotal
- ✅ addOnsTotal
- ✅ insuranceAmount
- ✅ currency
- ✅ bookingStatus
- ✅ notes
- ✅ travellerCount

---

## Ready to Apply?

This structure will allow you to see ALL booking information in one table without any JOINs!

**Please confirm if this structure is good, and I'll implement it!**

