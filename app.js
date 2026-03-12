const seedListings = [
  {
    title: "2BHK Near HSR Layout",
    city: "Bengaluru",
    locality: "HSR",
    type: "Apartment",
    price: 32000,
    contact: "9876543210",
    description: "Semi-furnished, parking, close to metro.",
  },
  {
    title: "1RK for Students",
    city: "Pune",
    locality: "Viman Nagar",
    type: "PG",
    price: 9000,
    contact: "9898989898",
    description: "Wi-Fi, food included, gated building.",
  },
  {
    title: "Independent House for Family",
    city: "Hyderabad",
    locality: "Miyapur",
    type: "Independent House",
    price: 25000,
    contact: "9000012345",
    description: "2 floors, calm neighborhood.",
  },
];

const state = {
  otp: null,
  otpExpiresAt: null,
  verifiedUser: null,
  listings: [...seedListings],
};

const listingGrid = document.getElementById("listingGrid");
const authStatus = document.getElementById("authStatus");
const toast = document.getElementById("toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function updateAuthStatus() {
  if (!state.verifiedUser) {
    authStatus.textContent = "Not verified";
    authStatus.classList.remove("verified");
    return;
  }

  authStatus.textContent = `Verified as ${state.verifiedUser.name} via ${state.verifiedUser.provider}`;
  authStatus.classList.add("verified");
}

function renderListings(query = "") {
  const q = query.trim().toLowerCase();
  const filtered = state.listings.filter((item) => {
    return (
      item.title.toLowerCase().includes(q) ||
      item.city.toLowerCase().includes(q) ||
      item.locality.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
    );
  });

  listingGrid.innerHTML = filtered
    .map(
      (item) => `
        <article class="listing-card">
          <h4>${item.title}</h4>
          <p>${item.locality}, ${item.city}</p>
          <p><strong>Type:</strong> ${item.type}</p>
          <p class="price">₹${Number(item.price).toLocaleString("en-IN")}</p>
          <p>${item.description || "No description provided."}</p>
          <small><strong>Contact:</strong> ${item.contact}</small>
        </article>
      `
    )
    .join("");
}

function sendOtp() {
  const phone = document.getElementById("phone").value.trim();
  if (!/^\d{10}$/.test(phone)) {
    showToast("Enter a valid 10-digit phone number");
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  state.otp = otp;
  state.otpExpiresAt = Date.now() + 2 * 60 * 1000;
  document.getElementById("otpHint").textContent = `Demo OTP: ${otp} (expires in 2 min)`;
  showToast("OTP sent (demo mode)");
}

function verifyOtp() {
  const entered = document.getElementById("otp").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!state.otp || Date.now() > state.otpExpiresAt) {
    showToast("OTP expired. Please request a new OTP");
    return;
  }

  if (entered !== state.otp) {
    showToast("Invalid OTP");
    return;
  }

  state.verifiedUser = {
    name: `+91-${phone}`,
    provider: "Phone OTP",
  };
  updateAuthStatus();
  showToast("Phone verified successfully");
}

function socialLogin(provider) {
  const name = window.prompt(`Enter your ${provider} display name`, "Verified User");
  if (!name) return;

  state.verifiedUser = {
    name,
    provider,
  };
  updateAuthStatus();
  showToast(`${provider} login successful`);
}

function postListing(event) {
  event.preventDefault();

  if (!state.verifiedUser) {
    showToast("Please verify before posting");
    return;
  }

  const newItem = {
    title: document.getElementById("title").value.trim(),
    city: document.getElementById("city").value.trim(),
    locality: document.getElementById("locality").value.trim(),
    type: document.getElementById("type").value,
    price: document.getElementById("price").value,
    contact: document.getElementById("contact").value.trim(),
    description: document.getElementById("description").value.trim(),
  };

  if (!newItem.title || !newItem.city || !newItem.locality || !newItem.type || !newItem.price || !/^\d{10}$/.test(newItem.contact)) {
    showToast("Please fill all required fields with valid contact");
    return;
  }

  state.listings.unshift(newItem);
  renderListings(document.getElementById("search").value);
  document.getElementById("postForm").reset();
  showToast("Listing published successfully");
}

document.getElementById("sendOtpBtn").addEventListener("click", sendOtp);
document.getElementById("verifyOtpBtn").addEventListener("click", verifyOtp);
document.getElementById("googleBtn").addEventListener("click", () => socialLogin("Google"));
document.getElementById("facebookBtn").addEventListener("click", () => socialLogin("Facebook"));
document.getElementById("search").addEventListener("input", (e) => renderListings(e.target.value));
document.getElementById("postForm").addEventListener("submit", postListing);
document.getElementById("postFreeBtn").addEventListener("click", () => {
  document.getElementById("post").scrollIntoView({ behavior: "smooth" });
});

updateAuthStatus();
renderListings();
