"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Models_js_1 = require("./Models.js");
/* ═══════════════════════════════════════════════
   SEED DATA  (dùng khi localStorage trống)
═══════════════════════════════════════════════ */
var SEED_PRODUCTS = [];
/* ═══════════════════════════════════════════════
   LOAD từ localStorage (fallback về seed)
═══════════════════════════════════════════════ */
function loadProducts() {
    var saved = localStorage.getItem('my_products');
    if (saved) {
        try {
            var parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map(function (p) {
                    return new Models_js_1.Product(p.id, p.name, Number(p.price), p.category, p.image);
                });
            }
        }
        catch (e) {
            console.error('Lỗi đọc dữ liệu:', e);
        }
    }
    return SEED_PRODUCTS;
}
/* ═══════════════════════════════════════════════
   KHỞI TẠO
═══════════════════════════════════════════════ */
var manager = new Models_js_1.ProductManager(loadProducts());
var editingProductId = null;
var deleteTargetId = null;
/* ═══════════════════════════════════════════════
   DOM REFS
═══════════════════════════════════════════════ */
var productGrid = document.getElementById('product-grid');
var searchInput = document.getElementById('search-input');
var categorySelect = document.getElementById('category-select');
var btnPrev = document.getElementById('btn-prev');
var btnNext = document.getElementById('btn-next');
var pageInfo = document.getElementById('page-info');
var addModal = document.getElementById('add-modal');
var modalTitle = document.getElementById('modal-title');
var btnAddNew = document.getElementById('btn-add-new');
var btnCloseModal = document.getElementById('btn-close-modal');
var btnCancel = document.getElementById('btn-cancel');
var btnSave = document.getElementById('btn-save');
var inputName = document.getElementById('p-name');
var inputPrice = document.getElementById('p-price');
var inputCategory = document.getElementById('p-category');
var inputImage = document.getElementById('p-image');
var errName = document.getElementById('err-name');
var errPrice = document.getElementById('err-price');
var errCategory = document.getElementById('err-category');
var errImage = document.getElementById('err-image');
var confirmModal = document.getElementById('confirm-modal');
var confirmCancel = document.getElementById('confirm-cancel');
var confirmDelete = document.getElementById('confirm-delete');
/* ═══════════════════════════════════════════════
   RENDER
═══════════════════════════════════════════════ */
function render() {
    var pageProducts = manager.getCurrentPageProducts();
    productGrid.innerHTML = pageProducts.length === 0
        ? '<p class="empty-msg">Chưa có sản phẩm nào. Bấm "Add New" để thêm nhé!</p>'
        : pageProducts.map(function (p) { return p.toCardHTML(); }).join('');
    var current = manager.getCurrentPage();
    var total = manager.getTotalPages();
    pageInfo.textContent = "".concat(current, " / ").concat(total);
    btnPrev.disabled = current <= 1;
    btnNext.disabled = current >= total;
}
function populateCategorySelect() {
    var current = categorySelect.value;
    categorySelect.innerHTML = '<option value="all">Tất cả danh mục</option>';
    manager.getCategories().forEach(function (cat) {
        var opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        categorySelect.appendChild(opt);
    });
    var exists = manager.getCategories().includes(current);
    categorySelect.value = exists ? current : 'all';
}
/* ═══════════════════════════════════════════════
   FORM VALIDATION
═══════════════════════════════════════════════ */
function clearErrors() {
    [errName, errPrice, errCategory, errImage].forEach(function (el) { return (el.style.display = 'none'); });
    [inputName, inputPrice, inputCategory, inputImage].forEach(function (el) { return el.classList.remove('error'); });
}
function validateForm() {
    clearErrors();
    var valid = true;
    if (!inputName.value.trim()) {
        errName.style.display = 'block';
        inputName.classList.add('error');
        valid = false;
    }
    var price = parseFloat(inputPrice.value);
    if (isNaN(price) || price <= 0) {
        errPrice.style.display = 'block';
        inputPrice.classList.add('error');
        valid = false;
    }
    if (!inputCategory.value.trim()) {
        errCategory.style.display = 'block';
        inputCategory.classList.add('error');
        valid = false;
    }
    if (!inputImage.value.trim()) {
        errImage.style.display = 'block';
        inputImage.classList.add('error');
        valid = false;
    }
    return valid;
}
/* ═══════════════════════════════════════════════
   MODAL
═══════════════════════════════════════════════ */
function openModal(product) {
    var _a, _b, _c, _d;
    if (product === void 0) { product = null; }
    editingProductId = product ? product.id : null;
    modalTitle.textContent = product ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm';
    inputName.value = (_a = product === null || product === void 0 ? void 0 : product.name) !== null && _a !== void 0 ? _a : '';
    inputPrice.value = (_b = product === null || product === void 0 ? void 0 : product.price.toString()) !== null && _b !== void 0 ? _b : '';
    inputCategory.value = (_c = product === null || product === void 0 ? void 0 : product.category) !== null && _c !== void 0 ? _c : '';
    inputImage.value = (_d = product === null || product === void 0 ? void 0 : product.image) !== null && _d !== void 0 ? _d : '';
    clearErrors();
    addModal.classList.add('active');
    inputName.focus();
}
function closeModal() {
    addModal.classList.remove('active');
    editingProductId = null;
}
/* ═══════════════════════════════════════════════
   CRUD
═══════════════════════════════════════════════ */
function saveProduct() {
    if (!validateForm())
        return;
    var isEditing = !!editingProductId;
    if (isEditing) {
        var updated = new Models_js_1.Product(editingProductId, inputName.value.trim(), parseFloat(inputPrice.value), inputCategory.value.trim(), inputImage.value.trim());
        manager.updateProduct(updated);
    }
    else {
        var newProduct = new Models_js_1.Product(Date.now().toString(), inputName.value.trim(), parseFloat(inputPrice.value), inputCategory.value.trim(), inputImage.value.trim());
        manager.addProduct(newProduct);
    }
    populateCategorySelect();
    manager.filterProducts(searchInput.value, categorySelect.value, !isEditing);
    closeModal();
    render();
}
/* ═══════════════════════════════════════════════
   EVENT LISTENERS
═══════════════════════════════════════════════ */
btnAddNew.addEventListener('click', function () { return openModal(); });
btnCloseModal.addEventListener('click', closeModal);
btnCancel.addEventListener('click', closeModal);
btnSave.addEventListener('click', saveProduct);
addModal.addEventListener('click', function (e) {
    if (e.target === addModal)
        closeModal();
});
// Enter key submits form
[inputName, inputPrice, inputCategory, inputImage].forEach(function (el) {
    el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter')
            saveProduct();
    });
});
// Card actions (event delegation)
productGrid.addEventListener('click', function (e) {
    var target = e.target;
    var id = target.getAttribute('data-id');
    if (!id)
        return;
    if (target.classList.contains('btn-edit')) {
        var product = manager.getProductById(id);
        if (product)
            openModal(product);
    }
    if (target.classList.contains('btn-delete')) {
        deleteTargetId = id;
        confirmModal.classList.add('active');
    }
});
// Confirm delete
confirmCancel.addEventListener('click', function () {
    confirmModal.classList.remove('active');
    deleteTargetId = null;
});
confirmDelete.addEventListener('click', function () {
    if (deleteTargetId) {
        manager.deleteProduct(deleteTargetId);
        manager.filterProducts(searchInput.value, categorySelect.value, false);
        populateCategorySelect();
        render();
    }
    confirmModal.classList.remove('active');
    deleteTargetId = null;
});
confirmModal.addEventListener('click', function (e) {
    if (e.target === confirmModal) {
        confirmModal.classList.remove('active');
        deleteTargetId = null;
    }
});
// Search & filter
searchInput.addEventListener('input', function () {
    manager.filterProducts(searchInput.value, categorySelect.value, true);
    render();
});
categorySelect.addEventListener('change', function () {
    manager.filterProducts(searchInput.value, categorySelect.value, true);
    render();
});
// Pagination
btnPrev.addEventListener('click', function () { manager.prevPage(); render(); });
btnNext.addEventListener('click', function () { manager.nextPage(); render(); });
/* INIT */
manager.filterProducts('', 'all', true);
populateCategorySelect();
render();
