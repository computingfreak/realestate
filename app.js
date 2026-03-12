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
    askingPrice: 54000000,
    status: "Available",
    ownerName: "Rohan Shah",
    images: ["https://images.unsplash.com/photo-1560185007-c5ca9d2c014d"],
    videos: ["https://samplelib.com/lib/preview/mp4/sample-5s.mp4"],
    notes: "Sea view, freshly renovated.",
    listedOnWebsite: true,
    listedOnSocial: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    buildingName: "Skyline Heights",
    location: "Whitefield, Bengaluru",
    floor: "7",
    unitNo: "704",
    configuration: "2BHK",
    carpetArea: 980,
    saleableArea: 1220,
    parking: 1,
    askingPrice: 15800000,
    status: "Under Negotiation",
    ownerName: "Meera Nair",
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c"],
    videos: [],
    notes: "Tenant vacating next month.",
    listedOnWebsite: true,
    listedOnSocial: false,
    createdAt: new Date().toISOString(),
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
    updatedAt: new Date().toISOString(),
  },
];

const state = {
  sessionUser: null,
  properties: JSON.parse(localStorage.getItem("crm_properties") || "null") || seedProperties,
  leads: JSON.parse(localStorage.getItem("crm_leads") || "null") || seedLeads,
};

const VALID_USER = { username: "admin", password: "broker123", displayName: "Broker Admin" };

const toast = document.getElementById("toast");
const publicView = document.getElementById("publicView");
const backendView = document.getElementById("backendView");
const loginPanel = document.getElementById("loginPanel");
const crmPanel = document.getElementById("crmPanel");
const authStatus = document.getElementById("authStatus");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function persist() {
  localStorage.setItem("crm_properties", JSON.stringify(state.properties));
  localStorage.setItem("crm_leads", JSON.stringify(state.leads));
}

function switchView(target) {
  publicView.classList.toggle("active", target === "public");
  backendView.classList.toggle("active", target === "backend");
}

function updateAuth() {
  if (!state.sessionUser) {
    authStatus.textContent = "Logged out";
    authStatus.classList.remove("verified");
    crmPanel.classList.add("hidden");
    loginPanel.classList.remove("hidden");
    return;
  }

  authStatus.textContent = `Logged in as ${state.sessionUser.displayName}`;
  authStatus.classList.add("verified");
  loginPanel.classList.add("hidden");
  crmPanel.classList.remove("hidden");
}

function renderPublicProperties(query = "") {
  const q = query.trim().toLowerCase();
  const visible = state.properties.filter(
    (item) => item.listedOnWebsite && `${item.buildingName} ${item.location} ${item.configuration}`.toLowerCase().includes(q)
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
          <p><strong>${item.configuration}</strong> • ${item.carpetArea} sqft carpet • ${item.parking} parking</p>
          <p class="price">${formatCurrency(item.askingPrice)}</p>
          <small class="muted">For details, contact brokerage desk.</small>
        </div>
      </article>
    `
      )
      .join("") || `<p class="muted">No marketed properties found.</p>`;
}

function renderStats() {
  const totalInventory = state.properties.length;
  const available = state.properties.filter((p) => p.status === "Available").length;
  const totalLeads = state.leads.length;
  const dueFollowUps = state.leads.filter((lead) => new Date(lead.nextFollowUp) <= new Date()).length;

  document.getElementById("statsGrid").innerHTML = `
    <article class="stat"><h3>${totalInventory}</h3><p>Total Inventory</p></article>
    <article class="stat"><h3>${available}</h3><p>Available Units</p></article>
    <article class="stat"><h3>${totalLeads}</h3><p>Total Leads</p></article>
    <article class="stat"><h3>${dueFollowUps}</h3><p>Follow-ups Due</p></article>
  `;
}

function renderBackendProperties(query = "") {
  const q = query.trim().toLowerCase();
  const filtered = state.properties.filter((item) =>
    `${item.buildingName} ${item.location} ${item.unitNo}`.toLowerCase().includes(q)
  );

  document.getElementById("backendPropertyGrid").innerHTML =
    filtered
      .map(
        (item) => `
      <article class="card-item compact">
        <div class="content">
          <h3>${item.buildingName} • ${item.configuration}</h3>
          <p>${item.location} | Floor ${item.floor} | Unit ${item.unitNo}</p>
          <p>Carpet/Saleable: ${item.carpetArea}/${item.saleableArea} sqft | Parking: ${item.parking}</p>
          <p>Status: <strong>${item.status}</strong> | Owner: ${item.ownerName}</p>
          <p class="price">${formatCurrency(item.askingPrice)}</p>
          <small>Media: ${item.images.length} images • ${item.videos.length} videos</small>
        </div>
      </article>
    `
      )
      .join("") || `<p class="muted">No property records found.</p>`;
}

function renderLeads(query = "") {
  const q = query.trim().toLowerCase();
  const filtered = state.leads.filter((lead) =>
    `${lead.name} ${lead.phone} ${lead.source}`.toLowerCase().includes(q)
  );

  document.getElementById("leadGrid").innerHTML =
    filtered
      .map(
        (lead) => `
      <article class="card-item compact">
        <div class="content">
          <h3>${lead.name} (${lead.stage})</h3>
          <p>${lead.phone}${lead.email ? ` | ${lead.email}` : ""}</p>
          <p>Source: ${lead.source} | Requirement: ${lead.requirement}</p>
          <p>Budget: ${formatCurrency(lead.budget)} | Next Follow-up: ${lead.nextFollowUp}</p>
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
          <p>${item.location} • ${formatCurrency(item.askingPrice)}</p>
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

function refreshAll(queryState = {}) {
  renderPublicProperties(queryState.publicQuery);
  if (state.sessionUser) {
    renderStats();
    renderBackendProperties(queryState.propertyQuery);
    renderLeads(queryState.leadQuery);
    renderMarketingConsole();
  }
}

function handleLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (username === VALID_USER.username && password === VALID_USER.password) {
    state.sessionUser = VALID_USER;
    updateAuth();
    refreshAll();
    showToast("Login successful");
    return;
  }

  showToast("Invalid credentials");
}

function handlePropertySubmit(event) {
  event.preventDefault();

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
    askingPrice: Number(document.getElementById("askingPrice").value),
    status: document.getElementById("propertyStatus").value,
    ownerName: document.getElementById("ownerName").value.trim(),
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
    createdAt: new Date().toISOString(),
  };

  if (!newProperty.buildingName || !newProperty.location || !newProperty.unitNo) {
    showToast("Please fill all mandatory property fields");
    return;
  }

  state.properties.unshift(newProperty);
  persist();
  document.getElementById("propertyForm").reset();
  refreshAll();
  showToast("Property record added");
}

function handleLeadSubmit(event) {
  event.preventDefault();

  const phone = document.getElementById("leadPhone").value.trim();
  if (!/^\d{10}$/.test(phone)) {
    showToast("Lead phone must be a 10-digit number");
    return;
  }

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
    updatedAt: new Date().toISOString(),
  };

  state.leads.unshift(lead);
  persist();
  document.getElementById("leadForm").reset();
  refreshAll();
  showToast("Lead saved with follow-up");
}

function handleMarketingInteraction(event) {
  const target = event.target;
  const id = target.dataset.id;
  if (!id) return;

  const property = state.properties.find((item) => item.id === id);
  if (!property) return;

  if (target.dataset.action === "copy") {
    const text = `${property.configuration} in ${property.buildingName}, ${property.location} at ${formatCurrency(
      property.askingPrice
    )}. Unit ${property.unitNo}, ${property.carpetArea} sqft carpet. DM for visit.`;
    navigator.clipboard.writeText(text);
    showToast("Promo text copied");
    return;
  }

  if (target.dataset.kind === "website") {
    property.listedOnWebsite = target.checked;
  }

  if (target.dataset.kind === "social") {
    property.listedOnSocial = target.checked;
  }

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
document.getElementById("marketingGrid").addEventListener("click", handleMarketingInteraction);
document.getElementById("marketingGrid").addEventListener("change", handleMarketingInteraction);

persist();
switchView("public");
updateAuth();
refreshAll();
