const SUPABASE_URL  = 'https://lvfbcbgmosfrpwvmrfhp.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2ZmJjYmdtb3NmcnB3dm1yZmhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0Mjc3MTEsImV4cCI6MjA4OTAwMzcxMX0.CMvOjwLs_1sDunNpphV5niv668Y459TwfzxDLioXx8c';


const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// 👉 Get category from URL
const params = new URLSearchParams(window.location.search);
const category = params.get("category");

// Show title
document.getElementById("category-title").innerText = category;

// Fetch filtered products
async function fetchProducts(filters={}) {
    let query = db.from('products').select('*').eq('category', category);

    // 🔍 Keyword search on title
    if (filters.search && filters.search.trim() !== "") {
        query = query.ilike('title', `%${filters.search.trim()}%`);
    }
    // 💰 Min price
    if (filters.minPrice && filters.minPrice !== "") {
        query = query.gte('price', parseFloat(filters.minPrice));
    }

    // 💰 Max price
    if (filters.maxPrice && filters.maxPrice !== "") {
        query = query.lte('price', parseFloat(filters.maxPrice));
    }

    // 🏷️ Condition (multiple checkboxes — uses Supabase .in())
    if (filters.conditions && filters.conditions.length > 0) {
        query = query.in('condition', filters.conditions);
    }
    const { data, error } = await query 

    if (error) {
        console.error(error);
        return;
    }

    displayProducts(data);
}

function displayProducts(products) {
    const container = document.getElementById("product-container");
    container.innerHTML = "";

    products.forEach(product => {
        const div = document.createElement("div");

        const image = product.image_urls?.[0] || "fallback.jpg";

        div.innerHTML = `
            <img src="${image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>${product.description}</p>
            <p>Price: ${product.price}</p>
        `;

        container.appendChild(div);
        div.onclick = () => {
            window.location.href = `product.html?id=${product.id}`;
        };
    });
}

/* ── COLLECT & APPLY FILTERS ── */
function applyFilters() {

    const search   = document.getElementById("searchInput")?.value || "";
    const minPrice = document.getElementById("minPrice")?.value || "";
    const maxPrice = document.getElementById("maxPrice")?.value || "";
    const conditionBoxes = document.querySelectorAll(".condition-list input[type='checkbox']:checked");
    const conditions = Array.from(conditionBoxes).map(cb => cb.value);
    fetchProducts({ search, category, minPrice, maxPrice, conditions });
    
}

/* ── RESET FILTERS ── */
function resetFilters() {
    document.getElementById("minPrice").value       = "";
    document.getElementById("maxPrice").value       = "";

    document.querySelectorAll(".condition-list input[type='checkbox']")
        .forEach(cb => cb.checked = false);

    fetchProducts();
}

/* ── LIVE SEARCH (fires as user types) ── */
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    
    if (searchInput) {
        searchInput.addEventListener("input", () => applyFilters());
    }
    
});


fetchProducts();