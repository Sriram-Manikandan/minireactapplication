# FridgePolice — Changes & Engineering Decisions

## What the app does
FridgePolice is a roommate food tracking app. Roommates can add food items to a
shared fridge, request portions, and keep inventory accurate. The backend is an
Express.js server with in-memory state. The frontend is vanilla HTML/CSS/JS.

---

## Scenario 1 — Race Condition (Double Allocation)

**Problem:** Two roommates request the same last 25% simultaneously.

**Solution:** The server atomically deducts the requested portion from
`food.quantity` *before* returning the approval. The check and deduct happen
in a single synchronous block in Node.js. Because Node is single-threaded,
no two requests can interleave at that point. The second request will see
`food.quantity` already reduced and return a 409 with a clear error message.

---

## Scenario 2 — Approval Expiry (Unclaimed Food)

**Problem:** A portion is approved but the roommate never eats it, then the
food spoils.

**Two-part solution:**
1. Every approval gets an `expiresAt` timestamp (60 seconds in demo, would be
   hours/days in production). On every read, `expireApprovals()` runs and
   returns the reserved quantity back to the food item if the TTL has passed.
2. The owner can manually `Discard` the food item. This sets `status =
   "discarded"` and cancels all active approvals instantly.

---

## Scenario 3 — Duplicate Item Names

**Problem:** Two roommates both have a "Ketchup" — the app must tell them apart.

**Solution:** Every food item gets a unique numeric `id` generated server-side.
The UI displays this ID badge on every card (`#2`, `#3`). Requests are always
made against the item's `id`, never its name. The seed data pre-loads two
"Ketchup" entries owned by different people to demonstrate this clearly.

---

## Scenario 4 — Reality vs App Divergence

**Problem:** Someone ate food without logging it; app says 60% but fridge is empty.

**Solution:** Any roommate can click "Correct Qty" on any food item and enter
the actual quantity. The server updates `food.quantity` to the real value and
cancels any stale approvals that no longer make sense given the new reality.
The correction is logged in the activity log with who made it.

---

## Engineering Decisions

- **No database** — all state is in-memory arrays on the server. Restarting the
  server resets state, which is fine for a prototype.
- **No auth** — roommate names are typed as free text. A real app would use
  sessions/JWT.
- **Single-threaded atomicity** — Node.js's event loop guarantees that the
  check-and-deduct in Scenario 1 is atomic without needing locks or
  transactions.
- **Auto-refresh** — the client polls the server every 5 seconds so TTL expiry
  is visible without a page reload.
- **Approval TTL is 60s** — shortened from real-world hours for easy demo
  purposes.