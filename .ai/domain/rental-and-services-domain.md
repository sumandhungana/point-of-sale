# Domain Knowledge: Rental Items, Services & Staff Management

## 1. Rental Management Domain

### Entity: `RentalItemEntity` (`rental_items`)
Designed for businesses renting equipment, furniture, machinery, or party supplies:
- `rentalItemName`: Name / model of rented asset.
- `phoneNumber`: Customer contact number.
- `address`: Delivery or customer address.
- `rentalAmount`: Cost charged for the rental duration (`NUMERIC(19,4)`).
- `rentalPeriod`: Frequency / duration (e.g. `DAILY`, `WEEKLY`, `MONTHLY`).
- `startDate` & `endDate`: Booking timeline.
- `remarks`: Inspection condition, deposit notes.

### Lifecycle:
1. **Creation**: Asset is booked with dates and deposit (`AddRentalUC`).
2. **Active State**: Item is in customer custody; tracked in `RentalItem.tsx`.
3. **Return & Closure**: Inspection on return, damage deduction (if any), final ledger settlement.

---

## 2. Additional Services

- Allows selling non-inventory labor, consulting, delivery, or custom work (`AddService.tsx`).
- Invoiced alongside or separately from standard inventory products without deducting stock.

---

## 3. Staff & HR Management

### Staff Records:
- Profile, contact information, role, joining date, monthly/daily salary base.
### Attendance & Salaries:
- Daily check-in / check-out records.
- Salary slip calculation:
  $$\text{Payable Salary} = \left(\frac{\text{Present Days}}{\text{Working Days}}\right) \times \text{Base Salary} + \text{Bonuses} - \text{Deductions}$$
- Salary payout logs linked into Cashbook / Expenses.
