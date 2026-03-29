//  Model
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var Product = /** @class */ (function () {
    function Product(id, name, price, category, image) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.category = category;
        this.image = image;
    }
    Product.prototype.getFormattedPrice = function () {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.price);
    };
    Product.prototype._esc = function (s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    };
    Product.prototype.toCardHTML = function () {
        var n = this._esc(this.name), c = this._esc(this.category), id = this._esc(this.id);
        return "\n        <div class=\"product-card\">\n            <div class=\"product-image-container\">\n                <img src=\"".concat(this._esc(this.image), "\" alt=\"").concat(n, "\" class=\"product-image\"\n                     onerror=\"this.src='https://placehold.co/220x160/f3f4f6/9ca3af?text=No+Image'\"/>\n            </div>\n            <h3 class=\"product-name\">").concat(n, "</h3>\n            <span class=\"product-category-badge\">").concat(c, "</span>\n            <div class=\"product-price\">").concat(this.getFormattedPrice(), "</div>\n            <div class=\"card-actions\">\n                <button class=\"btn-edit\"   data-id=\"").concat(id, "\">\u270F S\u1EEDa</button>\n                <button class=\"btn-delete\" data-id=\"").concat(id, "\">\u2715 X\u00F3a</button>\n            </div>\n        </div>");
    };
    return Product;
}());
// Manager 
var ProductManager = /** @class */ (function () {
    function ProductManager(initial) {
        this.products = __spreadArray([], initial, true);
        this.filteredProducts = __spreadArray([], initial, true);
        this.currentPage = 1;
        this.itemsPerPage = 4;
        this.categories = [];
        this._updateCategories();
    }
    ProductManager.prototype._save = function () {
        try {
            localStorage.setItem('pm_products', JSON.stringify(this.products));
        }
        catch (_) { }
    };
    ProductManager.prototype._updateCategories = function () {
        this.categories = __spreadArray([], new Set(this.products.map(function (p) { return p.category; })), true);
    };
    ProductManager.prototype.addProduct = function (p) {
        this.products.unshift(p);
        this._updateCategories();
        this._save();
    };
    ProductManager.prototype.getById = function (id) {
        return this.products.find(function (p) { return p.id === id; });
    };
    ProductManager.prototype.updateProduct = function (up) {
        var pi = this.products.findIndex(function (p) { return p.id === up.id; });
        if (pi !== -1)
            this.products[pi] = up;
        var fi = this.filteredProducts.findIndex(function (p) { return p.id === up.id; });
        if (fi !== -1)
            this.filteredProducts[fi] = up;
        this._updateCategories();
        this._save();
    };
    ProductManager.prototype.deleteProduct = function (id) {
        this.products = this.products.filter(function (p) { return p.id !== id; });
        this.filteredProducts = this.filteredProducts.filter(function (p) { return p.id !== id; });
        this._updateCategories();
        this._save();
    };
    ProductManager.prototype.filter = function (term, cat, reset) {
        if (reset === void 0) { reset = false; }
        var t = term.trim().toLowerCase();
        this.filteredProducts = this.products.filter(function (p) {
            return p.name.toLowerCase().includes(t) &&
                (cat === 'all' || p.category.toLowerCase() === cat.toLowerCase());
        });
        if (reset) {
            this.currentPage = 1;
        }
        else {
            if (this.currentPage > this.totalPages())
                this.currentPage = this.totalPages();
        }
    };
    ProductManager.prototype.page = function () {
        var s = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredProducts.slice(s, s + this.itemsPerPage);
    };
    ProductManager.prototype.totalPages = function () {
        return Math.ceil(this.filteredProducts.length / this.itemsPerPage) || 1;
    };
    ProductManager.prototype.next = function () {
        if (this.currentPage < this.totalPages())
            this.currentPage++;
    };
    ProductManager.prototype.prev = function () {
        if (this.currentPage > 1)
            this.currentPage--;
    };
    return ProductManager;
}());
//  Helpers 
function normalizeCategory(raw) {
    var t = raw.trim();
    return t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : t;
}
function loadFromStorage() {
    try {
        var data = localStorage.getItem('pm_products');
        if (data) {
            return JSON.parse(data).map(function (p) {
                return new Product(String(p.id), String(p.name), Number(p.price), normalizeCategory(String(p.category)), String(p.image));
            });
        }
    }
    catch (e) {
        console.warn('localStorage bị lỗi, reset.', e);
        localStorage.removeItem('pm_products');
    }
    return [];
}
//  Init 
var manager = new ProductManager(loadFromStorage());
var editingId = null;
var pendingDeleteId = null;
var _suppressCatChange = false;
// DOM refs
var grid = document.getElementById('product-grid');
var search = document.getElementById('search-input');
var catSel = document.getElementById('category-select');
var bPrev = document.getElementById('btn-prev');
var bNext = document.getElementById('btn-next');
var pInfo = document.getElementById('page-info');
var addModal = document.getElementById('add-modal');
var confirmModal = document.getElementById('confirm-modal');
var modalTitle = document.getElementById('modal-title');
var iName = document.getElementById('p-name');
var iPrice = document.getElementById('p-price');
var iCat = document.getElementById('p-category');
var iImg = document.getElementById('p-image');
var errName = document.getElementById('err-name');
var errPrice = document.getElementById('err-price');
var errCat = document.getElementById('err-category');
var errImg = document.getElementById('err-image');
//  Render
function render() {
    var list = manager.page();
    grid.innerHTML = list.length
        ? list.map(function (p) { return p.toCardHTML(); }).join('')
        : '<p class="empty-msg">Không có sản phẩm nào.</p>';
    var cur = manager.currentPage, tot = manager.totalPages();
    pInfo.textContent = "".concat(cur, " / ").concat(tot);
    bPrev.disabled = cur <= 1;
    bNext.disabled = cur >= tot;
}
function populateCat(activeCat) {
    _suppressCatChange = true;
    var setTo = activeCat !== undefined ? activeCat : catSel.value;
    catSel.innerHTML = '<option value="all">Tất cả danh mục</option>';
    manager.categories.forEach(function (c) {
        var o = document.createElement('option');
        o.value = c;
        o.textContent = c;
        catSel.appendChild(o);
    });
    if (setTo === 'all' || manager.categories.includes(setTo)) {
        catSel.value = setTo;
    }
    else {
        catSel.value = 'all';
    }
    _suppressCatChange = false;
}
// Form helpers 
function clearErrors() {
    [errName, errPrice, errCat, errImg].forEach(function (e) { return (e.style.display = 'none'); });
    [iName, iPrice, iCat, iImg].forEach(function (i) { return i.classList.remove('error'); });
}
function clearForm() {
    iName.value = iPrice.value = iCat.value = iImg.value = '';
    clearErrors();
}
function showError(errEl, inputEl) {
    errEl.style.display = 'block';
    inputEl.classList.add('error');
}
function validate() {
    clearErrors();
    var ok = true;
    if (!iName.value.trim()) {
        showError(errName, iName);
        ok = false;
    }
    var price = parseFloat(iPrice.value);
    if (isNaN(price) || !isFinite(price) || price <= 0) {
        showError(errPrice, iPrice);
        ok = false;
    }
    if (!iCat.value.trim()) {
        showError(errCat, iCat);
        ok = false;
    }
    if (!iImg.value.trim()) {
        showError(errImg, iImg);
        ok = false;
    }
    return ok;
}
// Modal helpers 
function openAdd() {
    editingId = null;
    modalTitle.textContent = 'Tạo sản phẩm';
    clearForm();
    addModal.classList.add('active');
}
function openEdit(p) {
    editingId = p.id;
    modalTitle.textContent = 'Cập nhật sản phẩm';
    iName.value = p.name;
    iPrice.value = String(p.price);
    iCat.value = p.category;
    iImg.value = p.image;
    clearErrors();
    addModal.classList.add('active');
}
function closeAdd() {
    addModal.classList.remove('active');
    clearForm();
    editingId = null;
}
//  Save 
function handleSave() {
    if (!validate())
        return;
    var isEdit = !!editingId;
    var category = normalizeCategory(iCat.value);
    // ID cực an toàn, tự sinh dựa trên thời gian thực mà không cần HTTPS
    var safeId = isEdit ? editingId : (Date.now().toString(36) + Math.random().toString(36).substring(2));
    var product = new Product(safeId, iName.value.trim(), parseFloat(iPrice.value), category, iImg.value.trim());
    if (isEdit) {
        manager.updateProduct(product);
        populateCat(catSel.value);
        manager.filter(search.value, catSel.value, true);
    }
    else {
        manager.addProduct(product);
        populateCat('all');
        manager.filter(search.value, catSel.value, true);
    }
    closeAdd();
    render();
}
//  Event listeners 
document.getElementById('btn-add-new').addEventListener('click', openAdd);
document.getElementById('btn-close-modal').addEventListener('click', closeAdd);
document.getElementById('btn-cancel').addEventListener('click', closeAdd);
document.getElementById('btn-save').addEventListener('click', handleSave);
addModal.addEventListener('click', function (e) {
    if (e.target === addModal)
        closeAdd();
});
confirmModal.addEventListener('click', function (e) {
    if (e.target === confirmModal) {
        pendingDeleteId = null;
        confirmModal.classList.remove('active');
    }
});
grid.addEventListener('click', function (e) {
    var _a;
    var t = e.target;
    if (t.classList.contains('btn-delete')) {
        var id = t.getAttribute('data-id');
        if (id) {
            pendingDeleteId = id;
            confirmModal.classList.add('active');
        }
    }
    if (t.classList.contains('btn-edit')) {
        var p = manager.getById((_a = t.getAttribute('data-id')) !== null && _a !== void 0 ? _a : '');
        if (p)
            openEdit(p);
    }
});
document.getElementById('confirm-delete').addEventListener('click', function () {
    if (!pendingDeleteId)
        return;
    manager.deleteProduct(pendingDeleteId);
    populateCat(catSel.value);
    manager.filter(search.value, catSel.value, false);
    confirmModal.classList.remove('active');
    pendingDeleteId = null;
    render();
});
document.getElementById('confirm-cancel').addEventListener('click', function () {
    pendingDeleteId = null;
    confirmModal.classList.remove('active');
});
search.addEventListener('input', function () {
    manager.filter(search.value, catSel.value, true);
    render();
});
catSel.addEventListener('change', function () {
    if (_suppressCatChange)
        return;
    manager.filter(search.value, catSel.value, true);
    render();
});
bPrev.addEventListener('click', function () { manager.prev(); render(); });
bNext.addEventListener('click', function () { manager.next(); render(); });
//  Boot 
manager.filter('', 'all', true);
populateCat('all');
render();
