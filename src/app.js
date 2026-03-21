"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var models_js_1 = require("./models.js");
// Initial Mock Data
var products = [
    { id: '1', name: 'Essence Mascara Lash Princess', price: 9.99, category: 'beauty', image: 'https://cdn.dummyjson.com/product-images/1/thumbnail.jpg' },
    { id: '2', name: 'Eyeshadow Palette with Mirror', price: 19.99, category: 'beauty', image: 'https://cdn.dummyjson.com/product-images/2/thumbnail.jpg' },
    { id: '3', name: 'Powder Canister', price: 14.99, category: 'beauty', image: 'https://cdn.dummyjson.com/product-images/3/thumbnail.jpg' },
    { id: '4', name: 'Red Lipstick', price: 12.99, category: 'beauty', image: 'https://cdn.dummyjson.com/product-images/4/thumbnail.jpg' },
    { id: '5', name: 'Red Nail Polish', price: 8.99, category: 'beauty', image: 'https://cdn.dummyjson.com/product-images/5/thumbnail.jpg' },
    { id: '6', name: 'Calvin Klein CK One', price: 49.99, category: 'fragrances', image: 'https://cdn.dummyjson.com/product-images/6/thumbnail.jpg' },
    { id: '7', name: 'Chanel Coco Noir Eau De', price: 129.99, category: 'fragrances', image: 'https://cdn.dummyjson.com/product-images/7/thumbnail.jpg' },
    { id: '8', name: 'Dior J\'adore', price: 89.99, category: 'fragrances', image: 'https://cdn.dummyjson.com/product-images/8/thumbnail.jpg' }
];
var filteredProducts = __spreadArray([], products, true);
var ITEMS_PER_PAGE = 4;
var currentPage = 1;
// DOM Elements
var grid = document.getElementById('product-grid');
var searchInput = document.getElementById('search-input');
var categorySelect = document.getElementById('category-select');
var btnPrev = document.getElementById('btn-prev');
var btnNext = document.getElementById('btn-next');
var pageInfo = document.getElementById('page-info');
// Modal Elements
var btnAddNew = document.getElementById('btn-add-new');
var addModal = document.getElementById('add-modal');
var btnCloseModal = document.getElementById('btn-close-modal');
var btnCancel = document.getElementById('btn-cancel');
var addProductForm = document.getElementById('add-product-form');
// Form Inputs and Error Spans
var pName = document.getElementById('p-name');
var pPrice = document.getElementById('p-price');
var pCategory = document.getElementById('p-category');
var pImage = document.getElementById('p-image');
// Initialize App
function init() {
    populateCategories();
    renderPage();
    setupEventListeners();
}
function populateCategories() {
    models_js_1.CATEGORIES.forEach(function (cat) {
        var option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}
function renderPage() {
    grid.innerHTML = '';
    var totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
    if (currentPage > totalPages)
        currentPage = totalPages;
    if (currentPage < 1)
        currentPage = 1;
    var start = (currentPage - 1) * ITEMS_PER_PAGE;
    var end = start + ITEMS_PER_PAGE;
    var currentProducts = filteredProducts.slice(start, end);
    currentProducts.forEach(function (p) {
        var card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = "\n            <div class=\"product-image-container\">\n                <img src=\"".concat(p.image, "\" alt=\"").concat(p.name, "\" class=\"product-image\" onerror=\"this.src='https://via.placeholder.com/200?text=No+Image'\">\n            </div>\n            <h3 class=\"product-name\">").concat(p.name, "</h3>\n            <span class=\"product-category-badge\">").concat(p.category, "</span>\n            <div class=\"product-price\">$").concat(p.price.toFixed(2), "</div>\n        ");
        grid.appendChild(card);
    });
    // Update Pagination UI
    pageInfo.textContent = "".concat(currentPage, " / ").concat(totalPages);
    btnPrev.disabled = currentPage === 1;
    btnNext.disabled = currentPage >= totalPages;
}
function filterProducts() {
    var term = searchInput.value.toLowerCase();
    var cat = categorySelect.value;
    filteredProducts = products.filter(function (p) {
        var matchName = p.name.toLowerCase().includes(term);
        var matchCat = cat === 'all' || p.category === cat;
        return matchName && matchCat;
    });
    currentPage = 1;
    renderPage();
}
function setupEventListeners() {
    searchInput.addEventListener('input', filterProducts);
    categorySelect.addEventListener('change', filterProducts);
    btnPrev.addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--;
            renderPage();
        }
    });
    btnNext.addEventListener('click', function () {
        var totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
            currentPage++;
            renderPage();
        }
    });
    // Modal Events
    btnAddNew.addEventListener('click', function () {
        addProductForm.reset();
        clearErrors();
        addModal.style.display = 'flex';
    });
    var closeModal = function () {
        addModal.style.display = 'none';
    };
    btnCloseModal.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);
    // Close when clicking outside
    addModal.addEventListener('click', function (e) {
        if (e.target === addModal)
            closeModal();
    });
    // Form Submission
    addProductForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (validateForm()) {
            var newProduct = {
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
                var option = document.createElement('option');
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
    document.querySelectorAll('.form-group').forEach(function (group) { return group.classList.remove('has-error'); });
}
function validateForm() {
    var _a, _b, _c, _d;
    clearErrors();
    var isValid = true;
    if (!pName.value.trim()) {
        (_a = pName.parentElement) === null || _a === void 0 ? void 0 : _a.classList.add('has-error');
        isValid = false;
    }
    var priceVal = parseFloat(pPrice.value);
    if (isNaN(priceVal) || priceVal <= 0) {
        (_b = pPrice.parentElement) === null || _b === void 0 ? void 0 : _b.classList.add('has-error');
        isValid = false;
    }
    if (!pCategory.value.trim()) {
        (_c = pCategory.parentElement) === null || _c === void 0 ? void 0 : _c.classList.add('has-error');
        isValid = false;
    }
    var imgUrl = pImage.value.trim();
    if (!imgUrl || !imgUrl.startsWith('http')) {
        (_d = pImage.parentElement) === null || _d === void 0 ? void 0 : _d.classList.add('has-error');
        isValid = false;
    }
    return isValid;
}
// Start
init();
