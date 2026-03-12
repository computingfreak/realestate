const listings = [
  {
    title: "One Horizon Center",
    city: "Gurugram",
    seats: "80 - 220 seats",
    price: "₹110 / sqft",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "BKC Corporate Park",
    city: "Mumbai",
    seats: "120 - 350 seats",
    price: "₹180 / sqft",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "Tech Hub Tower",
    city: "Bangalore",
    seats: "60 - 180 seats",
    price: "₹95 / sqft",
    img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "Financial District Plaza",
    city: "Hyderabad",
    seats: "150 - 500 seats",
    price: "₹88 / sqft",
    img: "https://images.unsplash.com/photo-1462899006636-339e08d1844e?auto=format&fit=crop&w=900&q=80"
  }
];

document.getElementById("listingGrid").innerHTML = listings
  .map(
    (item) => `
      <article class="listing-card">
        <img src="${item.img}" alt="${item.title}" />
        <div class="content">
          <h3>${item.title}</h3>
          <p class="meta">${item.city} • ${item.seats}</p>
          <p class="price">From ${item.price}</p>
        </div>
      </article>
    `
  )
  .join("");

const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");

menuToggle.addEventListener("click", () => {
  siteNav.classList.toggle("open");
});
