function toggleShop() {
    var checkBox = document.getElementById("has_shop");
    var shopDiv = document.getElementById("shop_details");
    shopDiv.style.display = checkBox.checked ? "block" : "none";
}
async function loaduser() {
    const { data: { user }, error: userError } = await db.auth.getUser();

    if (userError || !user) {
        console.error("User not authenticated", userError);
        return;
    }

    const email_add = document.getElementById("info-notice");
    
    if (email_add) {
        email_add.innerHTML = `Applying as: <strong>${user.email}</strong>`;
    }
}
 window.onload = loaduser;
async function handleTechnicianSignup(formData) {
  const { data: { user }, error: userError } = await db.auth.getUser();

  if (userError || !user) {
    console.error("User not authenticated", userError);
    return;
  }
  const technicianData = {
    id: user.id, 
    technical_number: formData.tech_number,
    experience_years: formData.experience,
    category: formData.category,
    has_tools: formData.tools === 'yes',
    has_shop: formData.has_shop,
    shop_name: formData.has_shop ? formData.shop_name : null,
    shop_number: formData.has_shop ? formData.shop_number : null,
  };

  const { data, error } = await db
    .from('technicians')
    .insert([technicianData]);

  if (error) {
    alert("Error submitting application: " + error.message);
  } else {
    alert("Application submitted successfully!");
  }
   window.location.href = 'index.html';
}
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('techApplyForm');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // 1. Stops the page from refreshing
            
            // 2. Gather data from the form fields
            const formData = {
                tech_number: document.getElementById('tech_number').value,
                experience: document.getElementById('experience').value,
                category: document.getElementById('category').value,
                has_shop: document.getElementById('has_shop').checked,
                shop_name: document.getElementById('shop_name')?.value || null,
                shop_number: document.getElementById('shop_number')?.value || null,
                tools: document.querySelector('input[name="tools"]:checked')?.value
            };

            // 3. Call your Supabase function
            await handleTechnicianSignup(formData);
        });
    }
});