const API = "http://localhost:3001/api";

// ── State ─────────────────────────────────────────────────────────────────────
let foods = [];
let approvals = [];

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  await refresh();
  setInterval(refresh, 5000); // auto-refresh every 5s to show TTL expiry
}

async function refresh() {
  [foods, approvals] = await Promise.all([
    fetch(`${API}/foods`).then((r) => r.json()),
    fetch(`${API}/approvals`).then((r) => r.json()),
  ]);
  renderFoods();
  renderApprovals();
}

// ── Log ───────────────────────────────────────────────────────────────────────
function log(msg, type = "ok") {
  const el = document.getElementById("activity-log");
  const now = new Date().toLocaleTimeString();
  const div = document.createElement("div");
  div.className = `log-entry log-${type}`;
  div.innerHTML = `<span class="log-time">${now}</span>${msg}`;
  el.prepend(div);
}

// ── Render Foods ──────────────────────────────────────────────────────────────
function renderFoods() {
  const el = document.getElementById("food-list");
  if (!foods.length) { el.innerHTML = `<div class="empty-state">No food items yet.</div>`; return; }

  el.innerHTML = foods.map((f) => {
    const barClass = f.quantity > 60 ? "high" : f.quantity > 25 ? "mid" : "low";
    const cardClass = f.status !== "available" ? f.status : "";
    const badgeClass = `badge-${f.status}`;

    const actions = f.status === "available" ? `
      <button class="btn-blue" onclick="openRequestModal('${f.id}')">Request Portion</button>
      <button class="btn-red" onclick="discard('${f.id}')">Discard</button>
      <button class="btn-ghost" onclick="openCorrectModal('${f.id}')">Correct Qty</button>
    ` : `<span class="empty-state">${f.status}</span>`;

    return `
      <div class="food-card ${cardClass}">
        <div class="food-top">
          <span class="food-name">${f.name}</span>
          <span class="food-id-badge">#${f.id}</span>
        </div>
        <div class="food-owner">Owner: ${f.owner}</div>
        <div class="qty-wrap"><div class="qty-bar ${barClass}" style="width:${f.quantity}%"></div></div>
        <div class="qty-text">${f.quantity}% remaining</div>
        <span class="status-badge ${badgeClass}">${f.status}</span>
        <div class="food-actions">${actions}</div>
      </div>`;
  }).join("");
}

// ── Render Approvals ──────────────────────────────────────────────────────────
function renderApprovals() {
  const el = document.getElementById("approval-list");
  if (!approvals.length) { el.innerHTML = `<div class="empty-state">No approvals yet.</div>`; return; }

  const sorted = [...approvals].reverse();
  el.innerHTML = sorted.map((a) => {
    const ttlMs = a.expiresAt - Date.now();
    const ttl = a.status === "approved" && ttlMs > 0
      ? `⏱ expires in ${Math.ceil(ttlMs / 1000)}s`
      : "";
    const consumeBtn = a.status === "approved"
      ? `<button class="btn-green" onclick="consume('${a.id}')">Mark Consumed</button>`
      : "";

    return `
      <div class="approval-row ${a.status}">
        <div class="approval-info">
          <div class="approval-main">${a.requestedBy} → ${a.foodName} (#${a.foodId}) — ${a.portion}%</div>
          <div class="approval-meta">Approved by ${a.foodOwner} · ${new Date(a.approvedAt).toLocaleTimeString()}</div>
          ${ttl ? `<div class="approval-ttl">${ttl}</div>` : ""}
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          ${consumeBtn}
          <span class="approval-status astatus-${a.status}">${a.status}</span>
        </div>
      </div>`;
  }).join("");
}

// ── Add Food ──────────────────────────────────────────────────────────────────
document.getElementById("btn-add").addEventListener("click", async () => {
  const name  = document.getElementById("f-name").value.trim();
  const owner = document.getElementById("f-owner").value.trim();
  const qty   = document.getElementById("f-qty").value;
  if (!name || !owner || !qty) return alert("Fill all fields");

  const res = await fetch(`${API}/foods`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, owner, quantity: Number(qty) }),
  });
  const data = await res.json();
  if (!res.ok) { log(`Error: ${data.error}`, "err"); return; }
  log(`✅ ${owner} added "${name}" (${qty}%)`, "ok");
  document.getElementById("f-name").value = "";
  document.getElementById("f-owner").value = "";
  document.getElementById("f-qty").value = "100";
  await refresh();
});

// ── Request Modal (Scenario 1) ────────────────────────────────────────────────
function openRequestModal(foodId) {
  const food = foods.find((f) => f.id === foodId);
  document.getElementById("modal-body").innerHTML = `
    <h3>Request Portion — ${food.name} (#${food.id})</h3>
    <p style="font-size:11px;color:var(--muted);margin-bottom:14px">
      Available: <strong style="color:var(--yellow)">${food.quantity}%</strong> · Owner: ${food.owner}
    </p>
    <div class="form-row">
      <input id="m-who" placeholder="Your name" />
      <input id="m-portion" type="number" placeholder="% to request" min="1" max="${food.quantity}" />
      <button class="btn-yellow" onclick="submitRequest('${foodId}')">Request</button>
    </div>`;
  document.getElementById("overlay").classList.remove("hidden");
}

async function submitRequest(foodId) {
  const requestedBy = document.getElementById("m-who").value.trim();
  const portion     = Number(document.getElementById("m-portion").value);
  if (!requestedBy || !portion) return alert("Fill all fields");

  closeModal();
  const res = await fetch(`${API}/foods/${foodId}/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestedBy, portion }),
  });
  const data = await res.json();
  if (!res.ok) {
    log(`❌ Scenario 1 — Request blocked: ${data.error}`, "err");
  } else {
    log(`✅ ${requestedBy} approved for ${portion}% of ${data.food.name} (#${foodId}) — expires in 60s`, "ok");
    log(`⚠️ Scenario 2 — Approval will expire in 60s if not consumed`, "warn");
  }
  await refresh();
}

// ── Correct Modal (Scenario 4) ────────────────────────────────────────────────
function openCorrectModal(foodId) {
  const food = foods.find((f) => f.id === foodId);
  document.getElementById("modal-body").innerHTML = `
    <h3>Correct Inventory — ${food.name} (#${food.id})</h3>
    <p style="font-size:11px;color:var(--muted);margin-bottom:14px">
      App says: <strong style="color:var(--yellow)">${food.quantity}%</strong>. What does the real fridge say?
    </p>
    <div class="form-row">
      <input id="c-who" placeholder="Your name" />
      <input id="c-qty" type="number" placeholder="Actual % in fridge" min="0" max="100" />
      <button class="btn-green" onclick="submitCorrection('${foodId}')">Correct</button>
    </div>`;
  document.getElementById("overlay").classList.remove("hidden");
}

async function submitCorrection(foodId) {
  const correctedBy    = document.getElementById("c-who").value.trim();
  const actualQuantity = Number(document.getElementById("c-qty").value);
  if (!correctedBy) return alert("Enter your name");

  closeModal();
  const res = await fetch(`${API}/foods/${foodId}/correct`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actualQuantity, correctedBy }),
  });
  const data = await res.json();
  if (!res.ok) {
    log(`❌ Correction failed: ${data.error}`, "err");
  } else {
    log(`🔧 Scenario 4 — ${data.message}`, "warn");
  }
  await refresh();
}

// ── Discard (Scenario 2) ──────────────────────────────────────────────────────
async function discard(foodId) {
  const food = foods.find((f) => f.id === foodId);
  if (!confirm(`Discard "${food.name}" (#${food.id})? This will cancel all active approvals.`)) return;

  const res = await fetch(`${API}/foods/${foodId}/discard`, { method: "POST" });
  const data = await res.json();
  if (!res.ok) {
    log(`❌ Discard failed: ${data.error}`, "err");
  } else {
    log(`🗑️ Scenario 2 — "${food.name}" discarded. Active approvals cancelled.`, "warn");
  }
  await refresh();
}

// ── Consume Approval ──────────────────────────────────────────────────────────
async function consume(approvalId) {
  const res = await fetch(`${API}/approvals/${approvalId}/consume`, { method: "POST" });
  const data = await res.json();
  if (!res.ok) {
    log(`❌ Consume failed: ${data.error}`, "err");
  } else {
    log(`✅ Approval #${approvalId} marked consumed by ${data.requestedBy}`, "ok");
  }
  await refresh();
}

// ── Modal close ───────────────────────────────────────────────────────────────
function closeModal() { document.getElementById("overlay").classList.add("hidden"); }
document.getElementById("modal-close").addEventListener("click", closeModal);
document.getElementById("overlay").addEventListener("click", (e) => {
  if (e.target === document.getElementById("overlay")) closeModal();
});

// ── Start ─────────────────────────────────────────────────────────────────────
init();