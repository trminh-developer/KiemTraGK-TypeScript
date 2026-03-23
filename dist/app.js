"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_js_1 = require("./models.js");
// Initial Mock Data
let products = [
    { id: '1', name: 'Essence Mascara Lash Princess', price: 9.99, category: 'beauty', image: '' },
    { id: '2', name: 'Eyeshadow Palette with Mirror', price: 19.99, category: 'beauty', image: '' },
    { id: '3', name: 'Powder Canister', price: 14.99, category: 'beauty', image: '' },
    { id: '4', name: 'Red Lipstick', price: 12.99, category: 'beauty', image: '' },
    { id: '5', name: 'Red Nail Polish', price: 8.99, category: 'beauty', image: '' },
    { id: '6', name: 'Calvin Klein CK One', price: 49.99, category: 'fragrances', image: '' },
    { id: '7', name: 'Chanel Coco Noir Eau De', price: 129.99, category: 'fragrances', image: '' },
    { id: '8', name: 'Dior J\'adore', price: 89.99, category: 'fragrances', image: '' }
];
let filteredProducts = [...products];
const ITEMS_PER_PAGE = 4;
let currentPage = 1;
// DOM Elements
const grid = document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const categorySelect = document.getElementById('category-select');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const pageInfo = document.getElementById('page-info');
// Modal Elements
const btnAddNew = document.getElementById('btn-add-new');
const addModal = document.getElementById('add-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancel = document.getElementById('btn-cancel');
const addProductForm = document.getElementById('add-product-form');
// Form Inputs and Error Spans
const pName = document.getElementById('p-name');
const pPrice = document.getElementById('p-price');
const pCategory = document.getElementById('p-category');
const pImage = document.getElementById('p-image');
// Initialize App
function init() {
    populateCategories();
    renderPage();
    setupEventListeners();
}
function populateCategories() {
    models_js_1.CATEGORIES.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}
function renderPage() {
    grid.innerHTML = '';
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
    if (currentPage > totalPages)
        currentPage = totalPages;
    if (currentPage < 1)
        currentPage = 1;
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
        if (e.target === addModal)
            closeModal();
    });
    // Form Submission
    addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateForm()) {
            const newProduct = {
                id: Date.now().toString(),
                name: pName.value.trim(),
                price: parseFloat(pPrice.value),
                category: pCategory.value.trim(),
                image: pImage.value.trim()
            };
            products.unshift(newProduct);
            // Re-populate categories if new one added
            if (!models_js_1.CATEGORIES.includes(newProduct.category)) {
                models_js_1.CATEGORIES.push(newProduct.category);
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
function validateForm() {
    var _a, _b, _c, _d;
    clearErrors();
    let isValid = true;
    if (!pName.value.trim()) {
        (_a = pName.parentElement) === null || _a === void 0 ? void 0 : _a.classList.add('has-error');
        isValid = false;
    }
    const priceVal = parseFloat(pPrice.value);
    if (isNaN(priceVal) || priceVal <= 0) {
        (_b = pPrice.parentElement) === null || _b === void 0 ? void 0 : _b.classList.add('has-error');
        isValid = false;
    }
    if (!pCategory.value.trim()) {
        (_c = pCategory.parentElement) === null || _c === void 0 ? void 0 : _c.classList.add('has-error');
        isValid = false;
    }
    const imgUrl = pImage.value.trim();
    if (!imgUrl || !imgUrl.startsWith('http')) {
        (_d = pImage.parentElement) === null || _d === void 0 ? void 0 : _d.classList.add('has-error');
        isValid = false;
    }
    return isValid;
}
// Start
init();
