// ── Config ───────────────────────────────────────────────────────────────────
const API = "http://localhost:3001";

// ── State ─────────────────────────────────────────────────────────────────────
let allItems = [];
let currentFilter = "all";
const countdownIntervals = {}; // itemId → intervalId

// ── Boot ──────────────────────────────────────────────────────────────────────
fetchItems();
setInterval(fetchItems, 10000); // poll every 10s to sync expiry state

// ── API Calls ─────────────────────────────────────────────────────────────────
async function fetchItems() {
  try {
    const res = await fetch(`${API}/items`);
    const data = await res.json();
    allItems = data;
    renderGrid();
  } catch {
    showToast("Cannot reach server. Is it running?", "error");
  }
}

async function listItem() {
  const name      = document.getElementById("f-name").value.trim();
  const seller    = document.getElementById("f-seller").value.trim();
  const priceRaw  = document.getElementById("f-price").value;
  const category  = document.getElementById("f-category").value;
  const condition = document.getElementById("f-condition").value;

  if (!name || !seller) {
    showToast("Item name and your name are required.", "error");
    return;
  }

  const price = parseFloat(priceRaw);
  if (isNaN(price) || price < 0) {
    showToast("Enter a valid price (0 or more).", "error");
    return;
  }

  try {
    const res = await fetch(`${API}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, seller, price, category, condition }),
    });

    if (!res.ok) {
      const err = await res.json();
      showToast(err.error || "Failed to post listing.", "error");
      return;
    }

    const item = await res.json();
    allItems.push(item);
    renderGrid();
    showToast(`"${item.name}" listed successfully!`, "success");

    // Clear form
    document.getElementById("f-name").value    = "";
    document.getElementById("f-seller").value  = "";
    document.getElementById("f-price").value   = "";
  } catch {
    showToast("Server error while listing item.", "error");
  }
}

async function claimItem(itemId) {
  const input = document.getElementById(`buyer-${itemId}`);
  const buyer = input ? input.value.trim() : "";

  if (!buyer) {
    showToast("Please enter your name to claim.", "error");
    return;
  }

  try {
    const res = await fetch(`${API}/items/${itemId}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buyer }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Scenario 1: Concurrency collision
      showToast(data.error || "Could not claim item.", "error");
      await fetchItems(); // refresh to show true state
      return;
    }

    // Update local state immediately
    const idx = allItems.findIndex((i) => i.id === itemId);
    if (idx !== -1) allItems[idx] = data;
    renderGrid();
    showToast(`You claimed "${data.name}"! Confirm handoff within 2 minutes.`, "info");
  } catch {
    showToast("Server error while claiming.", "error");
  }
}

async function confirmHandoff(itemId) {
  try {
    const res = await fetch(`${API}/items/${itemId}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || "Could not confirm handoff.", "error");
      return;
    }

    const idx = allItems.findIndex((i) => i.id === itemId);
    if (idx !== -1) allItems[idx] = data;
    clearInterval(countdownIntervals[itemId]);
    delete countdownIntervals[itemId];
    renderGrid();
    showToast(`Handoff confirmed! Enjoy your item.`, "success");
  } catch {
    showToast("Server error while confirming.", "error");
  }
}

async function removeItem(itemId, itemName) {
  // Scenario 3: Hallway Sale
  try {
    const res = await fetch(`${API}/items/${itemId}`, { method: "DELETE" });

    if (!res.ok) {
      const err = await res.json();
      showToast(err.error || "Could not remove listing.", "error");
      return;
    }

    allItems = allItems.filter((i) => i.id !== itemId);
    clearInterval(countdownIntervals[itemId]);
    delete countdownIntervals[itemId];
    renderGrid();
    showToast(`"${itemName}" removed from marketplace.`, "info");
  } catch {
    showToast("Server error while removing.", "error");
  }
}

// ── Render ─────────────────────────────────────────────────────────────────────
function setFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById("items-grid");
  const countLabel = document.getElementById("count-label");

  const filtered =
    currentFilter === "all"
      ? allItems
      : allItems.filter((i) => i.status === currentFilter);

  countLabel.textContent = `${filtered.length} item${filtered.length !== 1 ? "s" : ""}`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>No listings here</h3>
        <p>Be the first to list something!</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(renderCard).join("");

  // Start/refresh countdowns for claimed items
  filtered.forEach((item) => {
    if (item.status === "claimed" && item.claimExpiresAt) {
      startCountdown(item.id, item.claimExpiresAt);
    }
  });
}

function renderCard(item) {
  const statusLabel = { available: "Available", claimed: "Claimed", sold: "Sold" };
  const statusClass = { available: "status-available", claimed: "status-claimed", sold: "status-sold" };

  let actions = "";

  if (item.status === "available") {
    actions = `
      <div class="claim-section">
        <div class="claim-input-row">
          <input id="buyer-${item.id}" type="text" placeholder="Your name to claim" />
        </div>
        <button class="btn btn-claim" onclick="claimItem('${item.id}')">Claim Item</button>
      </div>`;
  }

  if (item.status === "claimed") {
    actions = `
      <div class="claimed-info">
        🔒 Claimed by <strong>${escHtml(item.claimedBy)}</strong>
      </div>
      <button class="btn btn-confirm" onclick="confirmHandoff('${item.id}')">✓ Confirm Handoff</button>
      <div class="countdown" id="cd-${item.id}">Loading timer…</div>`;
  }

  if (item.status === "sold") {
    actions = `<div style="font-size:0.82rem;color:var(--muted);margin-top:12px;">✓ Sold — no longer available</div>`;
  }

  // Remove button always visible for seller override (Scenario 3)
  const removeBtn =
    item.status !== "sold"
      ? `<button class="btn btn-remove" onclick="removeItem('${item.id}', '${escHtml(item.name)}')">🗑 Seller: Mark as Sold / Remove</button>`
      : "";

  return `
    <div class="item-card ${item.status}" id="card-${item.id}">
      <div class="card-top">
        <span class="item-category">${escHtml(item.category)}</span>
        <span class="status-badge ${statusClass[item.status]}">${statusLabel[item.status]}</span>
      </div>
      <div class="item-name">${escHtml(item.name)}</div>
      <div class="item-meta">
        <span>📦 ${escHtml(item.condition)}</span>
        <span>👤 ${escHtml(item.seller)}</span>
      </div>
      <div class="item-price">₹${item.price} <span>/ in-person</span></div>
      <div class="card-footer">
        ${actions}
        ${removeBtn}
      </div>
    </div>`;
}

// ── Countdown ──────────────────────────────────────────────────────────────────
function startCountdown(itemId, expiresAt) {
  // Clear any existing interval for this item
  if (countdownIntervals[itemId]) {
    clearInterval(countdownIntervals[itemId]);
  }

  const tick = () => {
    const el = document.getElementById(`cd-${itemId}`);
    if (!el) {
      clearInterval(countdownIntervals[itemId]);
      return;
    }
    const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    el.textContent = `⏱ Claim expires in ${mins}:${String(secs).padStart(2, "0")}`;
    el.classList.toggle("urgent", remaining <= 30);

    if (remaining === 0) {
      clearInterval(countdownIntervals[itemId]);
      delete countdownIntervals[itemId];
      // Scenario 2: fetch fresh state after expiry
      fetchItems();
    }
  };

  tick();
  countdownIntervals[itemId] = setInterval(tick, 1000);
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  const icon = { success: "✓", error: "✕", info: "ℹ" }[type] || "ℹ";
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ── Utils ──────────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}