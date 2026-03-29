# Proposed New Booking Table Structure

## New Booking Table - All Details Included

The Booking table will contain ALL reservation information in one place for easy reading, while keeping related tables for data integrity.

### Proposed New Fields to Add to Booking Table:

| Field Name | Type | Nullable | Description |
|------------|------|----------|-------------|
| **EXISTING FIELDS** | | | |
| `id` | Text | NO | Booking ID (sequential, starts from "0001") |
| `packageId` | Text | NO | Reference to Package table |
| `packageName` | Text | YES | Package name |
| `roomId` | Text | NO | Reference to Room table |
| `roomName` | Text | YES | Room name |
| `arrivalDate` | Timestamp | NO | Check-in date |
| `checkoutDate` | Timestamp | YES | Check-out date |
| `people` | Integer | NO | Number of guests |
| `insurance` | Boolean | NO | Insurance included |
| `airportTransfer` | Boolean | YES | Airport transfer included |
| `paymentType` | Text | NO | Payment type (e.g., "full", "deposit") |
| `total` | Integer | NO | Total amount in cents/EUR |
| `createdAt` | Timestamp | NO | Booking creation date (auto) |
| **NEW FIELDS - All Travellers Information** | | | |
| `allTravellerNames` | Text | YES | All traveller names (comma-separated: "John Doe, Jane Doe") |
| `allTravellerFirstNames` | Text | YES | All traveller first names (comma-separated) |
| `allTravellerLastNames` | Text | YES | All traveller last names (comma-separated) |
| `allTravellerEmails` | Text | YES | All traveller emails (comma-separated) |
| `allTravellerPhones` | Text | YES | All traveller phone numbers (comma-separated) |
| `allTravellerCountries` | Text | YES | All traveller countries (comma-separated) |
| `allTravellerAges` | Text | YES | All traveller ages (comma-separated: "25, 30") |
| `allTravellerBirthDates` | Text | YES | All traveller birth dates (comma-separated: "1998-05-15, 1993-08-20") |
| `allTravellerSurfLevels` | Text | YES | All traveller surf levels (comma-separated) |
| `allTravellerGenders` | Text | YES | All traveller genders (comma-separated) |
| `travellerCount` | Integer | YES | Number of travellers (same as `people` but explicit) |
| **NEW FIELDS - Add-Ons Information** | | | |
| `addOnNames` | Text | YES | All add-on names (comma-separated: "Airport Transfer, Equipment Rental") |
| `addOnIds` | Text | YES | All add-on IDs (comma-separated) |
| `addOnCount` | Integer | YES | Number of add-ons selected |
| **NEW FIELDS - Calculated/Summary Information** | | | |
| `duration` | Integer | YES | Number of nights (calculated from arrival to checkout) |
| `durationLabel` | Text | YES | Duration label (e.g., "7 nights", "1 week", "14 nights") |
| `packagePrice` | Integer | YES | Package price (from Package table, for reference) |
| `roomPrice` | Integer | YES | Room price per person (from Room table, for reference) |
| `subtotal` | Integer | YES | Subtotal before add-ons (package price + room price) |
| `addOnsTotal` | Integer | YES | Total of all add-ons |
| `insuranceAmount` | Integer | YES | Insurance amount (if applicable) |
| `currency` | Text | YES | Currency (default: "EUR") |
| `bookingStatus` | Text | YES | Booking status (e.g., "confirmed", "pending", "cancelled") |
| `notes` | Text | YES | Internal notes about the booking |

---

## Example of How Data Would Look:

### Current Structure (spread across tables):
```
Booking Table:
- id: "0001"
- packageName: "Surf Camp Package"
- roomName: "Triple room - Oubaha"
- arrivalDate: "2025-12-01"
- checkoutDate: "2025-12-08"
- people: 2
- total: 50000

Traveller Table (2 records):
- Traveller 1: "John Doe", "john@example.com", "USA", "25", "Beginner", "Male"
- Traveller 2: "Jane Doe", "jane@example.com", "USA", "30", "Intermediate", "Female"

BookingAddOn Table (1 record):
- addOnId: "1" (Airport Transfer)
```

### New Structure (all in Booking table):
```
Booking Table:
- id: "0001"
- packageName: "Surf Camp Package"
- roomName: "Triple room - Oubaha"
- arrivalDate: "2025-12-01"
- checkoutDate: "2025-12-08"
- duration: 7
- durationLabel: "1 week"
- people: 2
- travellerCount: 2
- allTravellerNames: "John Doe, Jane Doe"
- allTravellerFirstNames: "John, Jane"
- allTravellerLastNames: "Doe, Doe"
- allTravellerEmails: "john@example.com, jane@example.com"
- allTravellerPhones: "+1234567890, +1234567891"
- allTravellerCountries: "USA, USA"
- allTravellerAges: "25, 30"
- allTravellerBirthDates: "1998-05-15, 1993-08-20"
- allTravellerSurfLevels: "Beginner, Intermediate"
- allTravellerGenders: "Male, Female"
- addOnNames: "Airport Transfer"
- addOnIds: "1"
- addOnCount: 1
- packagePrice: 40000
- roomPrice: 0
- subtotal: 40000
- addOnsTotal: 10000
- insuranceAmount: 0
- insurance: false
- airportTransfer: true
- paymentType: "full"
- total: 50000
- currency: "EUR"
- bookingStatus: "confirmed"
- createdAt: "2025-11-08 10:30:00"
```

---

## Benefits of This Structure:

✅ **All information in one table** - Easy to read and query  
✅ **No joins needed** - All data visible directly in Booking table  
✅ **Easy to export** - Can export to CSV/Excel with all details  
✅ **Better for reporting** - All data in one place for analytics  
✅ **Backward compatible** - Still keeps Traveller and BookingAddOn tables for data integrity  

---

## Migration Strategy:

1. **Add new columns** to Booking table (all nullable initially)
2. **Update booking creation logic** to populate new fields when creating bookings
3. **Backfill existing bookings** with data from Traveller and BookingAddOn tables
4. **Keep existing tables** (Traveller, BookingAddOn) for data integrity and detailed queries

---

## SQL Query Example (After Migration):

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
    "addOnNames" as "Add-Ons",
    "paymentType" as "Payment",
    total / 100.0 as "Total (EUR)",
    TO_CHAR("createdAt", 'DD/MM/YYYY HH24:MI') as "Created"
FROM "Booking"
ORDER BY "createdAt" DESC;
```

---

## Questions:

1. **Do you want ALL these fields, or should I remove some?**
2. **For traveller data, do you prefer comma-separated strings** (easier to read) **or JSON format** (more structured)?
3. **Should I keep the Traveller and BookingAddOn tables** (for data integrity) or remove them?
4. **Any other fields you'd like to add?**

**Please review and confirm if this structure meets your needs!**

