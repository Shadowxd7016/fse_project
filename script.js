const SUPABASE_URL  = 'https://lvfbcbgmosfrpwvmrfhp.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2ZmJjYmdtb3NmcnB3dm1yZmhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0Mjc3MTEsImV4cCI6MjA4OTAwMzcxMX0.CMvOjwLs_1sDunNpphV5niv668Y459TwfzxDLioXx8c';

const db = supabase.createClient(SUPABASE_URL,SUPABASE_ANON);
// fetch data from supabase
async function fetchProducts() {
    const { data, error } = await db
        .from('products')
        .select('*');

    if (error) {
        console.error("Error fetching products:", error);
        return;
    }

    displayProducts(data);
}

function displayProducts(products) {
    const electronicsDiv = document.getElementById("electronics");
    const BooksDiv = document.getElementById("Books");
    const services_Div = document.getElementById("Services");

    electronicsDiv.innerHTML = "";
    BooksDiv.innerHTML = "";
    services_Div.innerHTML = "";

    products.forEach(product => {
        const div = document.createElement("div");

        const image = product.image_urls?.[0] || "fallback.jpg";

        div.innerHTML = `
            <img src="${image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>${product.description}</p>
            <p>Price: ${product.price}</p>
        `;

        // 👉 CORE LOGIC (you must understand this)
        if (product.category === "Electronics") {
            electronicsDiv.appendChild(div);
        } 
        else if (product.category === "Books") {
            BooksDiv.appendChild(div);
        } 
        else if (product.category == "Services")
        {
            services_Div.appendChild(div);
        }
        div.onclick = () => {
            window.location.href = `product.html?id=${product.id}`;
        };
    });
}

function goToCategory(category) {
    window.location.href = `category.html?category=${category}`;
}



function handleSearch(searchTerm) {
  const categoryContainer = document.getElementById('category-sections');
  const allCategories = document.getElementById('all-categories');
  const searchSection = document.getElementById('search-results-section');
  const searchGrid = document.getElementById('search-grid');

  if (searchTerm === "") {
    // If search is empty, show categories again
    categoryContainer.classList.remove('hidden');
    allCategories.classList.remove('hidden');
    searchSection.classList.add('hidden');
    return;
  }

  // Filter products based on title, category, or description
  const filtered = allProductsData.filter(product => 
    product.title.toLowerCase().includes(searchTerm) || 
    product.category.toLowerCase().includes(searchTerm)
  );

  // Switch UI to Search Mode — hide both category containers
  categoryContainer.classList.add('hidden');
  allCategories.classList.add('hidden');
  searchSection.classList.remove('hidden');

  // Display results
  if (filtered.length > 0) {
    searchGrid.innerHTML = filtered.map(product => createProductHTML(product)).join('');
  } else {
    searchGrid.innerHTML = `<p class="text-gray-500">No results found for "${searchTerm}"</p>`;
  }
}

// Helper function to keep code DRY (Don't Repeat Yourself)
function createProductHTML(product) {
  return `
    <div class="group relative">
      <img src="${product.image_urls?.[0] || 'https://via.placeholder.com/400'}" 
           class="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:h-80" />
      <div class="mt-4 flex justify-between">
        <div>
          <h3 class="text-sm text-gray-700">
            <a href="/product-detail.html?id=${product.id}">
              <span aria-hidden="true" class="absolute inset-0"></span>
              ${product.title}
            </a>
          </h3>
          <p class="mt-1 text-sm text-gray-500">${product.category}</p>
        </div>
        <p class="text-sm font-medium text-gray-900">$${product.price}</p>
      </div>
    </div>
  `;
}

// Your existing logic wrapped in a function
function renderCategories(data) {
  const categories = {
    'Mobile Phones': 'grid-mobile',
    'Laptops': 'grid-laptop',
    'Tablets': 'grid-tablet',
    'Cameras': 'grid-camera' 
  };

  Object.entries(categories).forEach(([name, gridId]) => {
    const gridElement = document.getElementById(gridId);
    if (!gridElement) return;
    const filtered = data.filter(p => p.category === name).slice(0, 4);
    gridElement.innerHTML = filtered.map(product => createProductHTML(product)).join('');
  });
}

document.addEventListener('DOMContentLoaded', initApp);
