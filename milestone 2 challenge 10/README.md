# Dorm Marketplace

A lightweight campus marketplace where students list used items and other students claim them for in-person handoff.

## Stack
- **Frontend:** Vanilla JavaScript, HTML, CSS (no framework)
- **Backend:** Node.js + Express.js
- **Storage:** In-memory (no database required)

## Getting Started

### Install dependencies
```bash
cd server
npm install
```

### Run the server
```bash
node index.js
```

### Open the app
Open `client/index.html` directly in your browser, or serve it via any static file server.

The server runs on `http://localhost:3001`

## Features
- List items for sale
- Browse available listings
- Claim an item (with 2-minute pickup timer)
- Auto-expiry if buyer never confirms handoff
- Seller can force-remove a listing (Hallway Sale scenario)

## The 3 Real-World Scenarios Handled

### Scenario 1 — Concurrency Collision
All claim requests go through the Express server which processes them synchronously in-memory. The first request to arrive locks the item; subsequent requests for the same item get a 409 Conflict response and see "Item already claimed."

### Scenario 2 — Ghost Buyer
When a buyer claims an item, a 2-minute server-side timer starts. If `confirmHandoff` is not called before expiry, the server automatically resets the item to `available` and clears the claim.

### Scenario 3 — Hallway Sale
The seller sees a "Mark as Sold / Remove" button on their own listing. Clicking it immediately removes the item from the marketplace regardless of its current state.