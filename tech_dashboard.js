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
    const pendingCountLabel = document.querySelector('h3.text-5xl.font-black'); // Target for total jobs
    if (!productList) return;

    const { data: { user } } = await db.auth.getUser();
    if (!user) return;

    // Fetch orders + product details
    const { data: orders, error } = await db
        .from('repair_orders')
        .select(`
            *,
            products (*) 
        `)
        .eq('technician_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        productList.innerHTML = `<p class="text-red-500 text-center">Error loading data.</p>`;
        return;
    }

    // UPDATE TOTAL PENDING JOBS COUNTER
    // Logic: Jobs that are NOT yet delivered are considered pending
    if (pendingCountLabel) {
        const pendingJobs = orders.filter(o => !o.is_delivered).length;
        pendingCountLabel.innerText = pendingJobs;
    }

    if (!orders || orders.length === 0) {
        productList.innerHTML = `<p class="text-gray-400 text-center py-10">No repair jobs assigned.</p>`;
        return;
    }

    productList.innerHTML = orders.map(order => {
        const item = order.products;
        
        // Sequential Logic
        const nextStep = !order.is_received ? 'is_received' 
                       : !order.is_working ? 'is_working' 
                       : !order.is_completed ? 'is_completed' 
                       : !order.is_delivered ? 'is_delivered' : null;

        const buttonLabel = {
            'is_received': 'Confirm Receipt',
            'is_working': 'Start Repair',
            'is_completed': 'Repair Finished',
            'is_delivered': 'Handover to Customer'
        }[nextStep] || 'Completed';

        return `
            <div class="card-modern flex flex-col md:flex-row gap-8 mb-6 hover:border-red-500 transition-all group">
                <div class="w-full md:w-64 h-64 flex-shrink-0">
                    <img src="${item.image_urls ? item.image_urls[0] : 'https://via.placeholder.com/300'}" 
                         class="w-full h-full object-cover rounded-2xl shadow-sm">
                </div>

                <div class="flex-1 flex flex-col">
                    <div class="flex justify-between items-start">
                        <div>
                            <span class="text-[10px] font-extrabold text-red-500 uppercase tracking-widest">${item.category || 'Product'}</span>
                            <h3 class="text-2xl font-extrabold text-slate-900 mt-1">${item.title}</h3>
                        </div>
                        <div class="text-right">
                            <p class="text-xl font-black text-slate-900">Rs. ${item.price}</p>
                            <span class="text-xs font-bold text-gray-400 uppercase">Condition: ${item.condition}</span>
                        </div>
                    </div>

                    <p class="text-gray-500 text-sm mt-4 leading-relaxed line-clamp-3">
                        ${item.description || 'No description provided for this item.'}
                    </p>

                    <div class="mt-auto pt-6">
                        <div class="flex items-center justify-between mb-4 px-2">
                            <div class="flex flex-col items-center gap-2">
                                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${order.is_received ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}">1</div>
                                <span class="text-[9px] font-bold uppercase tracking-tighter">Received</span>
                            </div>
                            <div class="h-[2px] flex-1 bg-gray-100 mx-2 mb-4">
                                <div class="h-full bg-green-500 transition-all duration-500" style="width: ${order.is_working ? '100%' : '0%'}"></div>
                            </div>
                            <div class="flex flex-col items-center gap-2">
                                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${order.is_working ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}">2</div>
                                <span class="text-[9px] font-bold uppercase tracking-tighter">Working</span>
                            </div>
                            <div class="h-[2px] flex-1 bg-gray-100 mx-2 mb-4">
                                <div class="h-full bg-green-500 transition-all duration-500" style="width: ${order.is_completed ? '100%' : '0%'}"></div>
                            </div>
                            <div class="flex flex-col items-center gap-2">
                                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${order.is_completed ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}">3</div>
                                <span class="text-[9px] font-bold uppercase tracking-tighter">Fixed</span>
                            </div>
                            <div class="h-[2px] flex-1 bg-gray-100 mx-2 mb-4">
                                <div class="h-full bg-green-500 transition-all duration-500" style="width: ${order.is_delivered ? '100%' : '0%'}"></div>
                            </div>
                            <div class="flex flex-col items-center gap-2">
                                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${order.is_delivered ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}">4</div>
                                <span class="text-[9px] font-bold uppercase tracking-tighter">Delivered</span>
                            </div>
                        </div>

                        <button 
                            onclick="updateJobStatus('${order.id}', '${nextStep}')"
                            ${!nextStep ? 'disabled' : ''}
                            class="w-full ${!nextStep ? 'bg-gray-100 text-gray-400' : 'bg-slate-900 hover:bg-red-500 text-white'} py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                            ${!nextStep ? '<i class="fa fa-check-circle"></i> Completed' : buttonLabel + ' <i class="fa fa-arrow-right text-xs"></i>'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
async function updateJobStatus(orderId, columnToUpdate) {
    if (!columnToUpdate) return;

    try {
        const updateData = {};
        updateData[columnToUpdate] = true;

        const { error } = await db
            .from('repair_orders')
            .update(updateData)
            .eq('id', orderId);

        if (error) throw error;

        // Refresh the list to show updated status and buttons
        loadProducts();
        
    } catch (err) {
        alert("Update failed: " + err.message);
    }
}
// FIXED: Added 'async' so 'await' works
async function logout() {
    await db.auth.signOut();
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', initDashboard);