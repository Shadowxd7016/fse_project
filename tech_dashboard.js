async function initDashboard() {
    // 1. Get current user
    const { data: { user }, error: authError } = await db.auth.getUser();
    
    if (authError || !user) {
        window.location.href = 'login.html';
        return;
    }

    // Update email in UI
    const emailEl = document.getElementById('user-email');
    if (emailEl) emailEl.textContent = user.email;

    // 2. Fetch profile details (for Avatar and Name)
    const { data: profile } = await db
        .from('profiles')
        .select('avatar_url, first_name, last_name')
        .eq('id', user.id)
        .maybeSingle();

    if (profile) {
        // Handle Navbar Avatar
        const avatarEl = document.getElementById('user-avatar-nav');
        if (avatarEl) {
            avatarEl.src = profile.avatar_url 
                ? profile.avatar_url 
                : `https://ui-avatars.com/api/?name=${profile.first_name || 'User'}&background=black&color=fff`;
        }
    }

    // 3. Check Technician Status (Just checking if record exists)
    const { data: techData } = await db
        .from('technicians')
        .select('id') // Just check if the ID is there
        .eq('id', user.id)
        .maybeSingle();

    const statusText = document.getElementById('tech-status');
    const ctaSection = document.getElementById('tech-cta-section');

    if (techData && profile) {
        // If they are in the table, show their professional identity
        if (statusText) {
            statusText.innerHTML = `
                <span class="text-red-600 font-black">Technician:</span> 
                ${profile.first_name} ${profile.last_name}
            `;
        }

        // Hide the "Become a Technician" section since they are already a tech
        if (ctaSection) ctaSection.style.display = 'none';
    } else {
        if (statusText) statusText.textContent = "Standard Account";
    }

    // 4. Load Products
    loadProducts();
}
async function loadProducts() {
    const productList = document.getElementById('product-list');
    if (!productList) return;

    const { data: products, error } = await db
        .from('products')
        .select('*');

    if (error) {
        productList.innerHTML = `<p class="text-red-500">Error loading products.</p>`;
        return;
    }

    if (!products || products.length === 0) {
        productList.innerHTML = `<p class="text-gray-500 text-center col-span-full">No items in shop yet.</p>`;
        return;
    }

    productList.innerHTML = products.map(item => `
        <div class="product-card fixkar-card p-4">
            <img src="${item.image_url || 'https://via.placeholder.com/300'}" class="w-full h-48 object-cover rounded-xl border-2 border-black mb-4">
            <h3 class="font-bold text-gray-800 text-lg">${item.name}</h3>
            <p class="text-red-600 font-black mt-1">$${item.price}</p>
            <button class="w-full mt-4 bg-black text-white py-2 rounded-xl font-bold hover:bg-gray-800 transition">
                View Details
            </button>
        </div>
    `).join('');
}

// FIXED: Added 'async' so 'await' works
async function logout() {
    await db.auth.signOut();
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', initDashboard);