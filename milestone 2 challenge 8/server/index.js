const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

let nextId = 1;
const uid = () => String(nextId++);

const APPROVAL_TTL_MS = 60 * 1000; // 60 seconds for demo

let foods = [
  { id: uid(), name: "Pizza", owner: "Alice", quantity: 25, addedAt: Date.now(), status: "available" },
  { id: uid(), name: "Ketchup", owner: "Alice", quantity: 100, addedAt: Date.now(), status: "available" },
  { id: uid(), name: "Ketchup", owner: "Bob", quantity: 80, addedAt: Date.now(), status: "available" },
  { id: uid(), name: "Milk", owner: "Charlie", quantity: 60, addedAt: Date.now(), status: "available" },
];

let approvals = [];

function expireApprovals() {
  const now = Date.now();
  approvals.forEach((a) => {
    if (a.status === "approved" && now > a.expiresAt) {
      a.status = "expired";
      const food = foods.find((f) => f.id === a.foodId);
      if (food && food.status !== "discarded") {
        food.quantity = Math.min(100, food.quantity + a.portion);
        if (food.status === "depleted") food.status = "available";
      }
    }
  });
}

// GET all foods
app.get("/api/foods", (req, res) => {
  expireApprovals();
  res.json(foods);
});

// GET all approvals
app.get("/api/approvals", (req, res) => {
  expireApprovals();
  res.json(approvals);
});

// POST add food
app.post("/api/foods", (req, res) => {
  const { name, owner, quantity } = req.body;
  if (!name || !owner || quantity == null)
    return res.status(400).json({ error: "name, owner, quantity required" });

  const item = {
    id: uid(),
    name: name.trim(),
    owner: owner.trim(),
    quantity: Number(quantity),
    addedAt: Date.now(),
    status: "available",
  };
  foods.push(item);
  res.status(201).json(item);
});

// POST request a portion — Scenario 1: race condition guard
app.post("/api/foods/:id/request", (req, res) => {
  expireApprovals();
  const food = foods.find((f) => f.id === req.params.id);
  if (!food) return res.status(404).json({ error: "Food not found" });
  if (food.status !== "available")
    return res.status(409).json({ error: `Food is ${food.status}` });

  const { requestedBy, portion } = req.body;
  if (!requestedBy || !portion)
    return res.status(400).json({ error: "requestedBy and portion required" });

  const p = Number(portion);

  // Scenario 1: atomic check — deduct immediately so no second request can grab the same amount
  if (p > food.quantity)
    return res.status(409).json({
      error: `Only ${food.quantity}% left. Cannot grant ${p}%.`,
    });

  food.quantity -= p;
  if (food.quantity <= 0) {
    food.quantity = 0;
    food.status = "depleted";
  }

  const approval = {
    id: uid(),
    foodId: food.id,
    foodName: food.name,
    foodOwner: food.owner,
    requestedBy: requestedBy.trim(),
    portion: p,
    approvedAt: Date.now(),
    expiresAt: Date.now() + APPROVAL_TTL_MS, // Scenario 2: TTL
    status: "approved",
  };
  approvals.push(approval);
  res.status(201).json({ approval, food });
});

// POST consume an approval
app.post("/api/approvals/:id/consume", (req, res) => {
  expireApprovals();
  const approval = approvals.find((a) => a.id === req.params.id);
  if (!approval) return res.status(404).json({ error: "Approval not found" });
  if (approval.status !== "approved")
    return res.status(409).json({ error: `Approval is already ${approval.status}` });

  approval.status = "consumed";
  res.json(approval);
});

// POST discard food — Scenario 2: food spoils, kills active approvals
app.post("/api/foods/:id/discard", (req, res) => {
  const food = foods.find((f) => f.id === req.params.id);
  if (!food) return res.status(404).json({ error: "Food not found" });

  food.status = "discarded";
  food.quantity = 0;

  approvals.forEach((a) => {
    if (a.foodId === food.id && a.status === "approved") {
      a.status = "expired";
    }
  });

  res.json({ food, message: "Food discarded and all pending approvals cancelled" });
});

// POST correct inventory — Scenario 4
app.post("/api/foods/:id/correct", (req, res) => {
  const food = foods.find((f) => f.id === req.params.id);
  if (!food) return res.status(404).json({ error: "Food not found" });

  const { actualQuantity, correctedBy } = req.body;
  if (actualQuantity == null)
    return res.status(400).json({ error: "actualQuantity required" });

  const prev = food.quantity;
  food.quantity = Math.max(0, Number(actualQuantity));
  food.status = food.quantity > 0 ? "available" : "depleted";

  // Cancel stale approvals that no longer make sense
  approvals.forEach((a) => {
    if (a.foodId === food.id && a.status === "approved") {
      a.status = "expired";
    }
  });

  res.json({
    food,
    message: `Corrected from ${prev}% → ${food.quantity}% by ${correctedBy || "unknown"}`,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`FridgePolice running on :${PORT}`));