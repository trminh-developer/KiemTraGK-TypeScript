import { Product, CATEGORIES } from './models.js';

// Initial Mock Data
let products: Product[] = [
    { id: '1', name: 'Essence Mascara Lash Princess', price: 9.99, category: 'beauty', image: 'https://cdn.dummyjson.com/product-images/1/thumbnail.jpg' },
    { id: '2', name: 'Eyeshadow Palette with Mirror', price: 19.99, category: 'beauty', image: 'https://cdn.dummyjson.com/product-images/2/thumbnail.jpg' },
    { id: '3', name: 'Powder Canister', price: 14.99, category: 'beauty', image: 'https://cdn.dummyjson.com/product-images/3/thumbnail.jpg' },
    { id: '4', name: 'Red Lipstick', price: 12.99, category: 'beauty', image: 'https://cdn.dummyjson.com/product-images/4/thumbnail.jpg' },
    { id: '5', name: 'Red Nail Polish', price: 8.99, category: 'beauty', image: 'https://cdn.dummyjson.com/product-images/5/thumbnail.jpg' },
    { id: '6', name: 'Calvin Klein CK One', price: 49.99, category: 'fragrances', image: 'https://cdn.dummyjson.com/product-images/6/thumbnail.jpg' },
    { id: '7', name: 'Chanel Coco Noir Eau De', price: 129.99, category: 'fragrances', image: 'https://cdn.dummyjson.com/product-images/7/thumbnail.jpg' },
    { id: '8', name: 'Dior J\'adore', price: 89.99, category: 'fragrances', image: 'https://cdn.dummyjson.com/product-images/8/thumbnail.jpg' }
];

let filteredProducts: Product[] = [...products];
const ITEMS_PER_PAGE = 4;
let currentPage = 1;

// DOM Elements
const grid = document.getElementById('product-grid') as HTMLElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const categorySelect = document.getElementById('category-select') as HTMLSelectElement;
const btnPrev = document.getElementById('btn-prev') as HTMLButtonElement;
const btnNext = document.getElementById('btn-next') as HTMLButtonElement;
const pageInfo = document.getElementById('page-info') as HTMLSpanElement;

// Modal Elements
const btnAddNew = document.getElementById('btn-add-new') as HTMLButtonElement;
const addModal = document.getElementById('add-modal') as HTMLElement;
const btnCloseModal = document.getElementById('btn-close-modal') as HTMLButtonElement;
const btnCancel = document.getElementById('btn-cancel') as HTMLButtonElement;
const addProductForm = document.getElementById('add-product-form') as HTMLFormElement;

// Form Inputs and Error Spans
const pName = document.getElementById('p-name') as HTMLInputElement;
const pPrice = document.getElementById('p-price') as HTMLInputElement;
const pCategory = document.getElementById('p-category') as HTMLInputElement;
const pImage = document.getElementById('p-image') as HTMLInputElement;

// Initialize App
function init() {
    populateCategories();
    renderPage();
    setupEventListeners();
}

function populateCategories() {
    CATEGORIES.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

function renderPage() {
    grid.innerHTML = '';
    
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const currentProducts = filteredProducts.slice(start, end);

    currentProducts.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image-container">
                <img src="${p.image}" alt="${p.name}" class="product-image" onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
            </div>
            <h3 class="product-name">${p.name}</h3>
            <span class="product-category-badge">${p.category}</span>
            <div class="product-price">$${p.price.toFixed(2)}</div>
        `;
        grid.appendChild(card);
    });

    // Update Pagination UI
    pageInfo.textContent = `${currentPage} / ${totalPages}`;
    btnPrev.disabled = currentPage === 1;
    btnNext.disabled = currentPage >= totalPages;
}

function filterProducts() {
    const term = searchInput.value.toLowerCase();
    const cat = categorySelect.value;

    filteredProducts = products.filter(p => {
        const matchName = p.name.toLowerCase().includes(term);
        const matchCat = cat === 'all' || p.category === cat;
        return matchName && matchCat;
    });

    currentPage = 1;
    renderPage();
}

function setupEventListeners() {
    searchInput.addEventListener('input', filterProducts);
    categorySelect.addEventListener('change', filterProducts);

    btnPrev.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage();
        }
    });

    btnNext.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
            currentPage++;
            renderPage();
        }
    });

    // Modal Events
    btnAddNew.addEventListener('click', () => {
        addProductForm.reset();
        clearErrors();
        addModal.style.display = 'flex';
    });

    const closeModal = () => {
        addModal.style.display = 'none';
    };

    btnCloseModal.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);
    
    // Close when clicking outside
    addModal.addEventListener('click', (e) => {
        if (e.target === addModal) closeModal();
    });

    // Form Submission
    addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            const newProduct: Product = {
                id: Date.now().toString(),
                name: pName.value.trim(),
                price: parseFloat(pPrice.value),
                category: pCategory.value.trim(),
                image: pImage.value.trim()
            };

            products.unshift(newProduct);
            
            // Re-populate categories if new one added
            if (!CATEGORIES.includes(newProduct.category)) {
                CATEGORIES.push(newProduct.category);
                const option = document.createElement('option');
                option.value = newProduct.category;
                option.textContent = newProduct.category;
                categorySelect.appendChild(option);
            }

            filterProducts(); // Re-render with new data
            closeModal();
        }
    });
}

function clearErrors() {
    document.querySelectorAll('.form-group').forEach(group => group.classList.remove('has-error'));
}

function validateForm(): boolean {
    clearErrors();
    let isValid = true;

    if (!pName.value.trim()) {
        pName.parentElement?.classList.add('has-error');
        isValid = false;
    }

    const priceVal = parseFloat(pPrice.value);
    if (isNaN(priceVal) || priceVal <= 0) {
        pPrice.parentElement?.classList.add('has-error');
        isValid = false;
    }

    if (!pCategory.value.trim()) {
        pCategory.parentElement?.classList.add('has-error');
        isValid = false;
    }

    const imgUrl = pImage.value.trim();
    if (!imgUrl || !imgUrl.startsWith('http')) {
        pImage.parentElement?.classList.add('has-error');
        isValid = false;
    }

    return isValid;
}

// Start
init();
