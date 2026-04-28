const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ─── In-Memory Store ────────────────────────────────────────────────────────
let items = [
  {
    id: "1",
    name: "Calculus Textbook",
    category: "Textbooks",
    condition: "Good",
    price: 20,
    seller: "Arun",
    status: "available",
    claimedBy: null,
    claimExpiresAt: null,
  },
  {
    id: "2",
    name: "Mini Fridge",
    category: "Appliances",
    condition: "Like New",
    price: 60,
    seller: "Priya",
    status: "available",
    claimedBy: null,
    claimExpiresAt: null,
  },
  {
    id: "3",
    name: "Mountain Bike",
    category: "Bikes",
    condition: "Fair",
    price: 80,
    seller: "Karthik",
    status: "available",
    claimedBy: null,
    claimExpiresAt: null,
  },
];

let nextId = 4;

// Active expiry timers keyed by item id
const expiryTimers = {};

const CLAIM_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

// ─── Helpers ─────────────────────────────────────────────────────────────────
function clearExpiryTimer(itemId) {
  if (expiryTimers[itemId]) {
    clearTimeout(expiryTimers[itemId]);
    delete expiryTimers[itemId];
  }
}

function startExpiryTimer(itemId) {
  clearExpiryTimer(itemId);
  expiryTimers[itemId] = setTimeout(() => {
    const item = items.find((i) => i.id === itemId);
    if (item && item.status === "claimed") {
      console.log(`[EXPIRY] Claim expired for item ${itemId} — resetting to available`);
      item.status = "available";
      item.claimedBy = null;
      item.claimExpiresAt = null;
    }
    delete expiryTimers[itemId];
  }, CLAIM_TIMEOUT_MS);
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET all items
app.get("/items", (req, res) => {
  res.json(items);
});

// POST list a new item
app.post("/items", (req, res) => {
  const { name, category, condition, price, seller } = req.body;

  if (!name || !category || !condition || !seller) {
    return res.status(400).json({ error: "name, category, condition, and seller are required." });
  }
  if (typeof price !== "number" || price < 0) {
    return res.status(400).json({ error: "price must be a non-negative number." });
  }

  const item = {
    id: String(nextId++),
    name: name.trim(),
    category: category.trim(),
    condition: condition.trim(),
    price,
    seller: seller.trim(),
    status: "available",
    claimedBy: null,
    claimExpiresAt: null,
  };

  items.push(item);
  res.status(201).json(item);
});

// POST claim an item — Scenario 1 (concurrency) handled here
app.post("/items/:id/claim", (req, res) => {
  const item = items.find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found." });

  // Concurrency guard: if already claimed, reject immediately
  if (item.status !== "available") {
    return res.status(409).json({ error: "Item is no longer available. Someone else claimed it first." });
  }

  const { buyer } = req.body;
  if (!buyer || !buyer.trim()) {
    return res.status(400).json({ error: "buyer name is required." });
  }

  const claimExpiresAt = Date.now() + CLAIM_TIMEOUT_MS;

  item.status = "claimed";
  item.claimedBy = buyer.trim();
  item.claimExpiresAt = claimExpiresAt;

  // Scenario 2: start expiry timer
  startExpiryTimer(item.id);

  res.json({ ...item });
});

// POST confirm handoff — buyer confirms in-person pickup
app.post("/items/:id/confirm", (req, res) => {
  const item = items.find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found." });
  if (item.status !== "claimed") {
    return res.status(400).json({ error: "Item is not in a claimed state." });
  }

  clearExpiryTimer(item.id);
  item.status = "sold";
  item.claimExpiresAt = null;

  res.json({ ...item });
});

// DELETE remove a listing — Scenario 3 (Hallway Sale)
app.delete("/items/:id", (req, res) => {
  const index = items.findIndex((i) => i.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Item not found." });

  clearExpiryTimer(req.params.id);
  items.splice(index, 1);

  res.json({ message: "Item removed successfully." });
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Dorm Marketplace server running at http://localhost:${PORT}`);
});