const seedUsers = [
  {
    id: crypto.randomUUID(),
    username: "admin",
    password: "broker123",
    displayName: "Super Admin",
    role: "super_admin",
    rights: { inventory: true, leads: true, marketing: true, users: true },
  },
];

const seedProperties = [
  {
    id: crypto.randomUUID(),
    buildingName: "Palm Residency",
    location: "Bandra West, Mumbai",
    floor: "12",
    unitNo: "1202",
    configuration: "3BHK",
    carpetArea: 1250,
    saleableArea: 1590,
    parking: 2,
    dealType: "Both",
    askingPrice: 54000000,
    rentAmount: 280000,
    lockIn: "12",
    deposit: 1500000,
    escalation: "5",
    tenure: "5",
    noticePeriod: "3",
    workstations: 32,
    cabins: 5,
    conferenceRooms: 2,
    pantry: 1,
    washroom: 2,
    reception: 1,
    status: "Available",
    ownerName: "Rohan Shah",
    ownerPhone: "9810011122",
    ownerEmail: "rohan.shah@example.com",
    inventoryFollowUpDate: "2026-03-25",
    images: ["https://images.unsplash.com/photo-1560185007-c5ca9d2c014d"],
    videos: ["https://samplelib.com/lib/preview/mp4/sample-5s.mp4"],
    notes: "Sea view, freshly renovated.",
    listedOnWebsite: true,
    listedOnSocial: true,
  },
];

const seedLeads = [
  {
    id: crypto.randomUUID(),
    name: "Aman Verma",
    phone: "9810012345",
    email: "aman.verma@example.com",
    source: "Website",
    requirement: "3BHK in Bandra",
    budget: 60000000,
    nextFollowUp: "2026-03-20",
    stage: "Site Visit",
    assignedProperty: "1202",
    remarks: "Site visit planned with spouse.",
  },
];

const state = {
  sessionUser: null,
  users: JSON.parse(localStorage.getItem("crm_users") || "null") || seedUsers,
  properties: JSON.parse(localStorage.getItem("crm_properties") || "null") || seedProperties,
  leads: JSON.parse(localStorage.getItem("crm_leads") || "null") || seedLeads,
};

const toast = document.getElementById("toast");
const publicView = document.getElementById("publicView");
const backendView = document.getElementById("backendView");
const loginPanel = document.getElementById("loginPanel");
const crmPanel = document.getElementById("crmPanel");
const authStatus = document.getElementById("authStatus");
const tabs = [...document.querySelectorAll(".tab-btn")];
const pages = [...document.querySelectorAll(".tab-page")];

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function persist() {
  localStorage.setItem("crm_users", JSON.stringify(state.users));
  localStorage.setItem("crm_properties", JSON.stringify(state.properties));
  localStorage.setItem("crm_leads", JSON.stringify(state.leads));
}

function switchView(target) {
  publicView.classList.toggle("active", target === "public");
  backendView.classList.toggle("active", target === "backend");
}

function hasAccess(key) {
  return Boolean(state.sessionUser?.rights?.[key]);
}

function switchTab(tabId) {
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === tabId));
  pages.forEach((page) => page.classList.toggle("active", page.id === tabId));
}

function followupBadge(dateValue) {
  if (!dateValue) return `<span class="badge neutral">No Date</span>`;
  const date = new Date(dateValue);
  const today = new Date();
  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (date.getTime() < today.getTime()) return `<span class="badge overdue">Overdue</span>`;
  if (date.getTime() === today.getTime()) return `<span class="badge today">Due Today</span>`;
  return `<span class="badge upcoming">Upcoming</span>`;
}

function updateAuth() {
  if (!state.sessionUser) {
    authStatus.textContent = "Logged out";
    authStatus.classList.remove("verified");
    crmPanel.classList.add("hidden");
    loginPanel.classList.remove("hidden");
    return;
  }

  authStatus.textContent = `Logged in as ${state.sessionUser.displayName} (${state.sessionUser.role})`;
  authStatus.classList.add("verified");
  loginPanel.classList.add("hidden");
  crmPanel.classList.remove("hidden");

  const usersTab = document.getElementById("usersTab");
  usersTab.style.display = hasAccess("users") ? "inline-block" : "none";
  document.querySelector('[data-tab="inventoryPage"]').style.display = hasAccess("inventory") ? "inline-block" : "none";
  document.querySelector('[data-tab="leadPage"]').style.display = hasAccess("leads") ? "inline-block" : "none";
  document.querySelector('[data-tab="marketingPage"]').style.display = hasAccess("marketing") ? "inline-block" : "none";

  document.getElementById("userForm").style.display = hasAccess("users") ? "block" : "none";
  document.getElementById("propertyForm").style.display = hasAccess("inventory") ? "block" : "none";
  document.getElementById("leadForm").style.display = hasAccess("leads") ? "block" : "none";
  document.getElementById("marketingGrid").style.display = hasAccess("marketing") ? "grid" : "none";

  if (!hasAccess("users") && document.getElementById("usersPage").classList.contains("active")) {
    switchTab("dashboardPage");
  }

  if (!hasAccess("inventory") && document.getElementById("inventoryPage").classList.contains("active")) {
    switchTab("dashboardPage");
  }

  if (!hasAccess("leads") && document.getElementById("leadPage").classList.contains("active")) {
    switchTab("dashboardPage");
  }

  if (!hasAccess("marketing") && document.getElementById("marketingPage").classList.contains("active")) {
    switchTab("dashboardPage");
  }
}

function renderPublicProperties(query = "") {
  const q = query.trim().toLowerCase();
  const visible = state.properties.filter(
    (item) =>
      item.listedOnWebsite &&
      `${item.buildingName} ${item.location} ${item.configuration} ${item.dealType}`.toLowerCase().includes(q)
  );

  document.getElementById("publicPropertyGrid").innerHTML =
    visible
      .map(
        (item) => `
      <article class="card-item">
        <img src="${item.images[0] || "https://placehold.co/600x400?text=No+Image"}" alt="${item.buildingName}" />
        <div class="content">
          <h3>${item.buildingName} • Unit ${item.unitNo}</h3>
          <p>${item.location}</p>
          <p><strong>${item.configuration}</strong> • ${item.carpetArea} sqft • ${item.parking} parking</p>
          <p>Type: <strong>${item.dealType}</strong></p>
          <p class="price">${formatCurrency(item.askingPrice || item.rentAmount)}</p>
          <small class="muted">Owner contact hidden. Request callback from brokerage.</small>
        </div>
      </article>
    `
      )
      .join("") || `<p class="muted">No marketed properties found.</p>`;
}

function renderStats() {
  const dueInventory = state.properties.filter((p) => new Date(p.inventoryFollowUpDate) <= new Date()).length;
  const dueLeads = state.leads.filter((l) => new Date(l.nextFollowUp) <= new Date()).length;
  document.getElementById("statsGrid").innerHTML = `
    <article class="stat"><h3>${state.properties.length}</h3><p>Total Inventory</p></article>
    <article class="stat"><h3>${state.leads.length}</h3><p>Total Leads</p></article>
    <article class="stat"><h3>${dueInventory}</h3><p>Inventory Follow-ups Due</p></article>
    <article class="stat"><h3>${dueLeads}</h3><p>Lead Follow-ups Due</p></article>
  `;
}

function renderInventoryFollowups() {
  const due = state.properties.filter((p) => new Date(p.inventoryFollowUpDate) <= new Date());
  document.getElementById("inventoryFollowUpList").innerHTML =
    due
      .map(
        (item) => `<div class="list-item">${item.buildingName} • Unit ${item.unitNo} — ${item.inventoryFollowUpDate}</div>`
      )
      .join("") || `<div class="list-item muted">No due inventory follow-ups.</div>`;
}

function renderLeadFollowups() {
  const due = state.leads.filter((l) => new Date(l.nextFollowUp) <= new Date());
  document.getElementById("leadFollowUpList").innerHTML =
    due
      .map((lead) => `<div class="list-item">${lead.name} (${lead.stage}) — ${lead.nextFollowUp}</div>`)
      .join("") || `<div class="list-item muted">No due lead follow-ups.</div>`;
}

function renderBackendProperties(query = "") {
  const q = query.trim().toLowerCase();
  const filtered = state.properties.filter((item) =>
    `${item.buildingName} ${item.location} ${item.unitNo} ${item.ownerPhone}`.toLowerCase().includes(q)
  );

  document.getElementById("backendPropertyGrid").innerHTML =
    filtered
      .map(
        (item) => `
      <article class="card-item compact">
        <div class="content">
          <h3>${item.buildingName} • ${item.configuration}</h3>
          <p>${item.location} | Floor ${item.floor} | Unit ${item.unitNo}</p>
          <p>Area: ${item.carpetArea}/${item.saleableArea} sqft | Parking: ${item.parking}</p>
          <p>Type: ${item.dealType} | Status: <strong>${item.status}</strong></p>
          <p>Lease terms: Lock-in ${item.lockIn || "-"}M | Deposit ${formatCurrency(item.deposit)} | Esc. ${item.escalation || "-"}%</p>
          <p>Tenure ${item.tenure || "-"}Y | Notice ${item.noticePeriod || "-"}M</p>
          <p>Layout: WS ${item.workstations || 0}, Cabins ${item.cabins || 0}, Conf ${item.conferenceRooms || 0}</p>
          <p>Pantry ${item.pantry || 0}, Washroom ${item.washroom || 0}, Reception ${item.reception || 0}</p>
          <p>Owner: ${item.ownerName} | ${item.ownerPhone} | ${item.ownerEmail}</p>
          <p>Inventory Follow-up: <strong>${item.inventoryFollowUpDate}</strong> ${followupBadge(item.inventoryFollowUpDate)}</p>
          <p>Media: ${item.images.length} image(s), ${item.videos.length} video(s)</p>
          <p>Publishing: Website ${item.listedOnWebsite ? "✅" : "❌"} | Social ${item.listedOnSocial ? "✅" : "❌"}</p>
        </div>
      </article>
    `
      )
      .join("") || `<p class="muted">No inventory records found.</p>`;
}

function renderLeads(query = "") {
  const q = query.trim().toLowerCase();
  const filtered = state.leads.filter((lead) =>
    `${lead.name} ${lead.phone} ${lead.email} ${lead.source}`.toLowerCase().includes(q)
  );

  document.getElementById("leadGrid").innerHTML =
    filtered
      .map(
        (lead) => `
      <article class="card-item compact">
        <div class="content">
          <h3>${lead.name} (${lead.stage})</h3>
          <p>${lead.phone} | ${lead.email}</p>
          <p>Source: ${lead.source} | Requirement: ${lead.requirement}</p>
          <p>Budget: ${formatCurrency(lead.budget)} | Next Follow-up: ${lead.nextFollowUp} ${followupBadge(lead.nextFollowUp)}</p>
          <p>Mapped Unit: ${lead.assignedProperty || "-"}</p>
          <small>${lead.remarks || "No remarks"}</small>
        </div>
      </article>
    `
      )
      .join("") || `<p class="muted">No leads found.</p>`;
}

function renderMarketingConsole() {
  document.getElementById("marketingGrid").innerHTML =
    state.properties
      .map(
        (item) => `
      <article class="card-item compact">
        <div class="content">
          <h3>${item.buildingName} • Unit ${item.unitNo}</h3>
          <p>${item.location} • ${formatCurrency(item.askingPrice || item.rentAmount)}</p>
          <div class="inline-actions wrap">
            <label><input type="checkbox" data-kind="website" data-id="${item.id}" ${
          item.listedOnWebsite ? "checked" : ""
        } /> Website</label>
            <label><input type="checkbox" data-kind="social" data-id="${item.id}" ${
          item.listedOnSocial ? "checked" : ""
        } /> Social Media</label>
            <button data-action="copy" data-id="${item.id}" class="ghost">Copy Promo Text</button>
          </div>
        </div>
      </article>
    `
      )
      .join("");
}

function renderUsers() {
  document.getElementById("userGrid").innerHTML = state.users
    .map(
      (user) => `
    <article class="card-item compact">
      <div class="content">
        <h3>${user.displayName}</h3>
        <p>Login: ${user.username} | Role: ${user.role}</p>
        <p>Rights: ${Object.entries(user.rights)
          .filter(([, val]) => val)
          .map(([key]) => key)
          .join(", ")}</p>
      </div>
    </article>
  `
    )
    .join("");
}

function refreshAll(queryState = {}) {
  renderPublicProperties(queryState.publicQuery);
  if (!state.sessionUser) return;

  renderStats();
  renderInventoryFollowups();
  renderLeadFollowups();
  if (hasAccess("inventory")) renderBackendProperties(queryState.propertyQuery);
  if (hasAccess("leads")) renderLeads(queryState.leadQuery);
  if (hasAccess("marketing")) renderMarketingConsole();
  if (hasAccess("users")) renderUsers();
}

function handleLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const matched = state.users.find((u) => u.username === username && u.password === password);

  if (!matched) {
    showToast("Invalid credentials");
    return;
  }

  state.sessionUser = matched;
  updateAuth();
  refreshAll();
  showToast("Login successful");
}

function handlePropertySubmit(event) {
  event.preventDefault();
  if (!hasAccess("inventory")) return showToast("No inventory access");

  const ownerPhone = document.getElementById("ownerPhone").value.trim();
  if (!/^\d{10}$/.test(ownerPhone)) return showToast("Owner mobile must be 10 digits");

  const newProperty = {
    id: crypto.randomUUID(),
    buildingName: document.getElementById("buildingName").value.trim(),
    location: document.getElementById("location").value.trim(),
    floor: document.getElementById("floor").value.trim(),
    unitNo: document.getElementById("unitNo").value.trim(),
    configuration: document.getElementById("configuration").value.trim(),
    carpetArea: Number(document.getElementById("carpetArea").value),
    saleableArea: Number(document.getElementById("saleableArea").value),
    parking: Number(document.getElementById("parking").value),
    dealType: document.getElementById("dealType").value,
    askingPrice: Number(document.getElementById("askingPrice").value),
    rentAmount: Number(document.getElementById("rentAmount").value),
    lockIn: document.getElementById("lockIn").value.trim(),
    deposit: Number(document.getElementById("deposit").value),
    escalation: document.getElementById("escalation").value.trim(),
    tenure: document.getElementById("tenure").value.trim(),
    noticePeriod: document.getElementById("noticePeriod").value.trim(),
    workstations: Number(document.getElementById("workstations").value),
    cabins: Number(document.getElementById("cabins").value),
    conferenceRooms: Number(document.getElementById("conferenceRooms").value),
    pantry: Number(document.getElementById("pantry").value),
    washroom: Number(document.getElementById("washroom").value),
    reception: Number(document.getElementById("reception").value),
    status: document.getElementById("propertyStatus").value,
    ownerName: document.getElementById("ownerName").value.trim(),
    ownerPhone,
    ownerEmail: document.getElementById("ownerEmail").value.trim(),
    inventoryFollowUpDate: document.getElementById("inventoryFollowUpDate").value,
    images: document
      .getElementById("mediaImages")
      .value.split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    videos: document
      .getElementById("mediaVideos")
      .value.split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    notes: document.getElementById("propertyNotes").value.trim(),
    listedOnWebsite: true,
    listedOnSocial: false,
  };

  state.properties.unshift(newProperty);
  persist();
  document.getElementById("propertyForm").reset();
  refreshAll();
  showToast("Inventory saved");
}

function handleLeadSubmit(event) {
  event.preventDefault();
  if (!hasAccess("leads")) return showToast("No lead access");

  const phone = document.getElementById("leadPhone").value.trim();
  if (!/^\d{10}$/.test(phone)) return showToast("Lead phone must be 10 digits");

  const lead = {
    id: crypto.randomUUID(),
    name: document.getElementById("leadName").value.trim(),
    phone,
    email: document.getElementById("leadEmail").value.trim(),
    source: document.getElementById("leadSource").value,
    requirement: document.getElementById("leadRequirement").value.trim(),
    budget: Number(document.getElementById("leadBudget").value),
    nextFollowUp: document.getElementById("nextFollowUp").value,
    stage: document.getElementById("leadStage").value,
    assignedProperty: document.getElementById("assignedProperty").value.trim(),
    remarks: document.getElementById("leadRemarks").value.trim(),
  };

  state.leads.unshift(lead);
  persist();
  document.getElementById("leadForm").reset();
  refreshAll();
  showToast("Lead saved");
}

function handleUserSubmit(event) {
  event.preventDefault();
  if (!hasAccess("users")) return showToast("Only super admin can create users");

  const username = document.getElementById("newUserName").value.trim();
  if (state.users.some((u) => u.username === username)) return showToast("Login ID already exists");

  const user = {
    id: crypto.randomUUID(),
    username,
    password: document.getElementById("newUserPassword").value,
    displayName: document.getElementById("newUserDisplay").value.trim(),
    role: document.getElementById("newUserRole").value,
    rights: {
      inventory: document.getElementById("accessInventory").checked,
      leads: document.getElementById("accessLeads").checked,
      marketing: document.getElementById("accessMarketing").checked,
      users: false,
    },
  };

  state.users.push(user);
  persist();
  document.getElementById("userForm").reset();
  document.getElementById("accessInventory").checked = true;
  document.getElementById("accessLeads").checked = true;
  document.getElementById("accessMarketing").checked = true;
  renderUsers();
  showToast("User created with access rights");
}

function handleMarketingInteraction(event) {
  if (!hasAccess("marketing")) return;

  const target = event.target;
  const id = target.dataset.id;
  if (!id) return;

  const property = state.properties.find((item) => item.id === id);
  if (!property) return;

  if (target.dataset.action === "copy") {
    const text = `${property.configuration} in ${property.buildingName}, ${property.location} at ${formatCurrency(
      property.askingPrice || property.rentAmount
    )}. Type ${property.dealType}. Contact us for visit.`;
    navigator.clipboard.writeText(text);
    showToast("Promo text copied");
    return;
  }

  if (target.dataset.kind === "website") property.listedOnWebsite = target.checked;
  if (target.dataset.kind === "social") property.listedOnSocial = target.checked;

  persist();
  renderPublicProperties(document.getElementById("publicSearch").value);
}

document.getElementById("goPublicBtn").addEventListener("click", () => switchView("public"));
document.getElementById("goBackendBtn").addEventListener("click", () => switchView("backend"));
document.getElementById("publicSearch").addEventListener("input", (e) => renderPublicProperties(e.target.value));
document.getElementById("backendPropertySearch").addEventListener("input", (e) => renderBackendProperties(e.target.value));
document.getElementById("leadSearch").addEventListener("input", (e) => renderLeads(e.target.value));
document.getElementById("loginBtn").addEventListener("click", handleLogin);
document.getElementById("logoutBtn").addEventListener("click", () => {
  state.sessionUser = null;
  updateAuth();
  showToast("Logged out");
});
document.getElementById("propertyForm").addEventListener("submit", handlePropertySubmit);
document.getElementById("leadForm").addEventListener("submit", handleLeadSubmit);
document.getElementById("userForm").addEventListener("submit", handleUserSubmit);
document.getElementById("marketingGrid").addEventListener("click", handleMarketingInteraction);
document.getElementById("marketingGrid").addEventListener("change", handleMarketingInteraction);
tabs.forEach((tab) => tab.addEventListener("click", () => switchTab(tab.dataset.tab)));

persist();
switchView("public");
switchTab("dashboardPage");
updateAuth();
refreshAll();
