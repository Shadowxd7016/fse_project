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
    setupSearchListener();
}

function createProductHTML(product) {
    // Accessing the image_urls array from your schema
    const firstImage = (product.image_urls && product.image_urls.length > 0) 
        ? product.image_urls[0] 
        : 'https://via.placeholder.com/400';

    // Show title, price, category, condition, and description
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

    // Loop through categories and show ALL products (no slicing)
    Object.entries(categoriesMapping).forEach(([name, gridId]) => {
        const gridElement = document.getElementById(gridId);
        if (!gridElement) return;

        // Filter by the exact category string in your DB
        const filtered = data.filter(p => p.category === name);
        
        gridElement.innerHTML = filtered.map(product => {
            displayedIds.add(product.id);
            return createProductHTML(product);
        }).join('');
    });

    // Handle products that don't match the standard 4 categories
    const otherGrid = document.getElementById('grid-others');
    if (otherGrid) {
        const others = data.filter(p => !displayedIds.has(p.id));
        if (others.length > 0) {
            document.getElementById('others-section').classList.remove('hidden');
            otherGrid.innerHTML = others.map(product => createProductHTML(product)).join('');
        }
    }
}

document.addEventListener('DOMContentLoaded', initApp);