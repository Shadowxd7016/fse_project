

// 👉 Get ID from URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");


async function fetchProduct() {
    const { data, error } = await db
        .from('products')
        .select('*')
        .eq('id', id)
        .single(); // 🔥 only one product

    if (error) {
        console.error(error);
        return;
    }

    displayProduct(data);
}

function displayProduct(product) {
    const container = document.getElementById("product-detail");

    const images = product.image_urls || [];
    console.log(images)
    let currentIndex = 0;

    container.innerHTML = `
        <div class="detail-container">
            
            <div class="image-section">
                <button id="prev-btn">◀</button>

                <img id="slider-image" src="${images[0] || 'fallback.jpg'}" alt="${product.title}">

                <button id="next-btn">▶</button>
            </div>

            <div class="info-section">
                <h1>${product.title}</h1>
                <p class="price">Rs ${product.price}</p>
                <p class="desc">${product.description}</p>

                <button class="contact-btn" onclick="window.location.href= 'conversation.html?id=${id}'">Contact Seller</button>
            </div>
        </div>
    `;

    const img = document.getElementById("slider-image");

    // 👉 Next button
    document.getElementById("next-btn").onclick = () => {
        if (images.length === 0) return;

        currentIndex = (currentIndex + 1) % images.length;
        img.src = images[currentIndex];
    };
    // 👉 Previous button
    document.getElementById("prev-btn").onclick = () => {
        if (images.length === 0) return;

        currentIndex = (currentIndex - 1 + images.length) % images.length;
        img.src = images[currentIndex];
    };

    // 👉 Optional: Auto slideshow (every 3 sec)
    // setInterval(() => {
    //     if (images.length <= 1) return;

    //     currentIndex = (currentIndex + 1) % images.length;
    //     img.src = images[currentIndex];
    // }, 3000);
}

fetchProduct();