let allProductsData = []; 

async function initApp() {
    // Fetch all products from Supabase
    const { data, error } = await db.from('products').select('*');
    
    if (error) {
        console.error("Supabase Error:", error);
        return;
    }

    allProductsData = data;
    renderCategories(allProductsData); 
    
    // Now defined locally - no more ReferenceError!
    setupSearchListener();
}

// ─── NEW: SEARCH LOGIC ───
function setupSearchListener() {
    const searchInput = document.getElementById('search-input'); // Ensure your HTML has this ID
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (!query) {
            renderCategories(allProductsData);
            return;
        }

        // Filter data based on Title, Category, or Description
        const filtered = allProductsData.filter(product => 
            product.title?.toLowerCase().includes(query) ||
            product.category?.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query)
        );

        renderCategories(filtered);
    });
}

function createProductHTML(product) {
    const firstImage = (product.image_urls && product.image_urls.length > 0) 
        ? product.image_urls[0] 
        : 'https://ui-avatars.com/api/?name=Fix+Kar&background=ef4444&color=fff';

    return `
        <div class="group relative bg-white p-4 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-lg hover:border-red-200">
            <div class="aspect-square w-full overflow-hidden rounded-xl bg-gray-50">
                <img src="${firstImage}" alt="${product.title}" class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300">
            </div>
            
            <div class="mt-4">
                <div class="flex justify-between items-start mb-1">
                    <h3 class="text-sm font-bold text-gray-900 truncate flex-1">
                        <a href="product.html?id=${product.id}">
                            <span aria-hidden="true" class="absolute inset-0"></span>
                            ${product.title}
                        </a>
                    </h3>
                    <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-gray-100 text-gray-600 rounded ml-2">
                        ${product.condition || 'Used'}
                    </span>
                </div>
                
                <p class="text-xs text-gray-500 mb-2">${product.category}</p>
                
                <p class="text-xs text-gray-400 line-clamp-2 mb-3 h-8">
                    ${product.description || 'No description provided.'}
                </p>

                <div class="flex items-center justify-between border-t border-gray-50 pt-3">
                    <p class="text-md font-extrabold text-red-600">Rs. ${Number(product.price).toLocaleString()}</p>
                    <span class="material-symbols-outlined text-gray-300 text-sm">arrow_forward</span>
                </div>
            </div>
        </div>
    `;
}

function renderCategories(data) {
    const categoriesMapping = {
        'Mobile Phones': 'grid-mobile',
        'Laptops': 'grid-laptop',
        'Tablets': 'grid-tablet',
        'Cameras': 'grid-camera' 
    };

    const displayedIds = new Set();

    Object.entries(categoriesMapping).forEach(([name, gridId]) => {
        const gridElement = document.getElementById(gridId);
        if (!gridElement) return;

        const filtered = data.filter(p => p.category === name);
        
        // Hide the section if no results found in this category during search
        const section = gridElement.closest('section'); 
        if (section) {
            section.style.display = filtered.length === 0 ? 'none' : 'block';
        }

        gridElement.innerHTML = filtered.map(product => {
            displayedIds.add(product.id);
            return createProductHTML(product);
        }).join('');
    });

    const otherGrid = document.getElementById('grid-others');
    const othersSection = document.getElementById('others-section');
    if (otherGrid && othersSection) {
        const others = data.filter(p => !displayedIds.has(p.id));
        if (others.length > 0) {
            othersSection.classList.remove('hidden');
            othersSection.style.display = 'block';
            otherGrid.innerHTML = others.map(product => createProductHTML(product)).join('');
        } else {
            othersSection.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', initApp);