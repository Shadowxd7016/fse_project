async function checkUser() {
    const { data: { user } } = await db.auth.getUser();
    const authBtn = document.getElementById("auth-btn");

    if (user) {
        // 1. Use .maybeSingle() instead of .single() to prevent errors if profile is missing
        let { data: profile } = await db
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .maybeSingle();

        const img = document.createElement("img");
        
        // 2. Fallback if profile OR avatar_url is missing
        if (profile && profile.avatar_url) {
            img.src = profile.avatar_url;
        } else {
            img.src = "https://shorturl.at/Cxhyg";
        }

        // 3. Apply styles directly to prevent the "Too Large" image issue
        img.className = "profile-icon cursor-pointer rounded-full object-cover border-2 border-red-500 shadow-sm";
        img.style.width = "45px";   // Matches the size in your screenshot
        img.style.height = "45px";
        img.style.border = "2px solid #ef4444"; // Optional: Red FixKar border

        img.onclick = () => {
            window.location.href = "index.html"; // Or dashboard.html
        };

        // Replace the button with the profile pic
        if (authBtn) authBtn.replaceWith(img);

    } else {
        // Not logged in
        if (authBtn) {
            authBtn.onclick = () => {
                window.location.href = "registration.html";
            };
        }
    }
}

checkUser();