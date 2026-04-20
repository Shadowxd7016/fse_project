async function checkUser() {
    const { data: { user } } = await db.auth.getUser();

    const authBtn = document.getElementById("auth-btn");
    console.log(user);
    if (user) {
        let { data: profile } = await db
                .from('profiles')
                .select('avatar_url')
                .eq('id', user.id)
                .single();
        const img = document.createElement("img");
        if (profile.avatar_url) {
            img.src = profile.avatar_url;
        } else {
            img.src = "https://shorturl.at/Cxhyg";
        }

         // placeholder avatar
        // 👉 User logged in → replace button with profile icon
        const img = document.createElement("img");
        if (profile.avatar_url) {
                    img.src = profile.avatar_url;
        } else {
                    img.src = "https://shorturl.at/Cxhyg";
        }

         // placeholder avatar
        img.className = "profile-icon";

        img.onclick = () => {
            window.location.href = "index.html";
        };

        authBtn.replaceWith(img);

    } else {
        // 👉 Not logged in
        authBtn.onclick = () => {
            window.location.href = "registration.html";
        };
    }
}

checkUser();