# PRD — Dorm Marketplace MVP

## 1. Scope Cut

The following features are intentionally excluded from the Day 1 MVP:

| Feature | Reason |
|---|---|
| **Real money payments / Venmo integration** | In-person cash exchange is the campus norm; adding payment rails introduces regulatory complexity and is scope creep for a prototype. |
| **Live in-app chat / messaging** | Students can coordinate pickup via existing channels (iMessage, WhatsApp); building a chat system is a full product in itself and distracts from the core claim flow. |
| **User accounts / email verification / auth** | Requiring sign-up creates friction and a full backend auth system; for a campus MVP a simple display name on listing and claiming is sufficient to validate the core workflow. |

---

## 2. MVP Features

1. **List an Item** — Any student can post a used item (name, category, condition, price, seller name) and it immediately appears in the marketplace feed.
2. **Claim an Item** — A buyer can claim an available item; the item is instantly locked to that buyer and a 2-minute pickup timer starts to prevent ghost claims.
3. **Seller Override (Hallway Sale)** — The seller can mark their own listing as sold or remove it at any time, handling the real-world case where the item is sold outside the app.

---

## 3. Acceptance Criteria — Claim Item Flow

**AC-1 — Successful Claim**
- **Given** an item is listed with status `available`
- **When** a buyer enters their name and clicks "Claim Item"
- **Then** the item status changes to `claimed`, the buyer's name is shown, and a 2-minute countdown timer starts

**AC-2 — Concurrency Collision (Only One Claim Wins)**
- **Given** an item is listed with status `available` and two buyers attempt to claim it simultaneously
- **When** both claim requests are processed
- **Then** only the first request succeeds and changes the item to `claimed`; the second buyer sees an "Item already claimed" message and the item remains locked to the first buyer

**AC-3 — Ghost Buyer Expiration**
- **Given** a buyer has claimed an item and the 2-minute pickup timer expires without a confirmed handoff
- **When** the timer reaches zero
- **Then** the item status automatically reverts to `available`, the claim is cleared, and other buyers can claim it again