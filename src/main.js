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
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(this.price);
    };
    Product.prototype.toCardHTML = function () {
        return "<div class=\"product-card\">\n      <div class=\"product-image-container\">\n        <img src=\"".concat(this.image, "\" alt=\"").concat(this.name, "\" class=\"product-image\"\n          onerror=\"this.src='https://placehold.co/220x160/f3f4f6/9ca3af?text=No+Image'\"/>\n      </div>\n      <h3 class=\"product-name\">").concat(this.name, "</h3>\n      <span class=\"product-category-badge\">").concat(this.category, "</span>\n      <div class=\"product-price\">").concat(this.getFormattedPrice(), "</div>\n      <div class=\"card-actions\">\n        <button class=\"btn-edit\" data-id=\"").concat(this.id, "\">\u270F S\u1EEDa</button>\n        <button class=\"btn-delete\" data-id=\"").concat(this.id, "\">\u2715 X\u00F3a</button>\n      </div>\n    </div>");
    };
    return Product;
}());
var ProductManager = /** @class */ (function () {
    function ProductManager(initial) {
        this.products = __spreadArray([], initial, true);
        this.filteredProducts = __spreadArray([], initial, true);
        this.currentPage = 1;
        this.itemsPerPage = 4; // ✅ Fix 2: Khôi phục 4 (TS gốc sai là 8)
        this.categories = [];
        this._updateCategories();
    }
    ProductManager.prototype._save = function () {
        try {
            localStorage.setItem('pm_products', JSON.stringify(this.products));
        }
        catch (_a) { }
    };
    ProductManager.prototype._updateCategories = function () {
        this.categories = __spreadArray([], new Set(this.products.map(function (p) { return p.category; })), true);
    };
    ProductManager.prototype.addProduct = function (p) { this.products.unshift(p); this._updateCategories(); this._save(); };
    ProductManager.prototype.getById = function (id) { return this.products.find(function (p) { return p.id === id; }); };
    ProductManager.prototype.updateProduct = function (up) {
        var i = this.products.findIndex(function (p) { return p.id === up.id; });
        if (i !== -1) {
            this.products[i] = up;
            this._updateCategories();
            this._save();
        }
    };
    ProductManager.prototype.deleteProduct = function (id) {
        this.products = this.products.filter(function (p) { return p.id !== id; });
        this._updateCategories();
        this._save();
    };
    ProductManager.prototype.filter = function (term, cat, reset) {
        if (reset === void 0) { reset = false; }
        var t = term.trim().toLowerCase();
        this.filteredProducts = this.products.filter(function (p) {
            return p.name.toLowerCase().includes(t) && (cat === 'all' || p.category === cat);
        });
        if (reset) {
            this.currentPage = 1;
        }
        else {
            var tp = this.totalPages();
            if (this.currentPage > tp)
                this.currentPage = tp || 1;
        }
    };
    ProductManager.prototype.page = function () {
        var s = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredProducts.slice(s, s + this.itemsPerPage);
    };
    ProductManager.prototype.totalPages = function () { return Math.ceil(this.filteredProducts.length / this.itemsPerPage) || 1; };
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
// ─── Storage ────────────────────────────────────────────────
function loadFromStorage() {
    try {
        var d = localStorage.getItem('pm_products');
        if (d)
            return JSON.parse(d).map(function (p) {
                return new Product(p.id, p.name, Number(p.price), p.category, p.image);
            });
    }
    catch (_a) { }
    return [];
}
// ─── Init ───────────────────────────────────────────────────
var DEMO = [];
var stored = loadFromStorage();
var manager = new ProductManager(stored.length ? stored : DEMO);
var editingId = null;
var pendingDeleteId = null;
// ─── DOM refs ───────────────────────────────────────────────
// ✅ Fix 3: Bổ sung đầy đủ DOM refs — TS gốc thiếu modal, form, error elements
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
var eN = document.getElementById('err-name');
var eP = document.getElementById('err-price');
var eC = document.getElementById('err-category');
var eI = document.getElementById('err-image');
// ─── Render ─────────────────────────────────────────────────
function render() {
    var pp = manager.page();
    grid.innerHTML = pp.length
        ? pp.map(function (p) { return p.toCardHTML(); }).join('')
        : '<p class="empty-msg">Không có sản phẩm nào.</p>';
    var cur = manager.currentPage, tot = manager.totalPages();
    pInfo.textContent = "".concat(cur, " / ").concat(tot);
    bPrev.disabled = cur <= 1;
    bNext.disabled = cur >= tot;
}
// ✅ Fix 3: Bổ sung populateCat() bị thiếu hoàn toàn trong TS gốc
function populateCat() {
    var cur = catSel.value;
    catSel.innerHTML = '<option value="all">Tất cả danh mục</option>';
    manager.categories.forEach(function (c) {
        var o = document.createElement('option');
        o.value = c;
        o.textContent = c;
        catSel.appendChild(o);
    });
    catSel.value = manager.categories.includes(cur) ? cur : 'all';
}
// ✅ Fix 3: Bổ sung form helpers bị thiếu
function clearErr() {
    [eN, eP, eC, eI].forEach(function (e) { return e.style.display = 'none'; });
    [iName, iPrice, iCat, iImg].forEach(function (i) { return i.classList.remove('error'); });
}
function clearForm() { iName.value = iPrice.value = iCat.value = iImg.value = ''; clearErr(); }
function showErr(e, i) { e.style.display = 'block'; i.classList.add('error'); }
function validate() {
    clearErr();
    var ok = true;
    if (!iName.value.trim()) {
        showErr(eN, iName);
        ok = false;
    }
    var p = parseFloat(iPrice.value);
    if (isNaN(p) || p <= 0) {
        showErr(eP, iPrice);
        ok = false;
    }
    if (!iCat.value.trim()) {
        showErr(eC, iCat);
        ok = false;
    }
    if (!iImg.value.trim()) {
        showErr(eI, iImg);
        ok = false;
    }
    return ok;
}
// ✅ Fix 3: Bổ sung modal helpers bị thiếu
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
    clearErr();
    addModal.classList.add('active');
}
function closeAdd() { addModal.classList.remove('active'); clearForm(); editingId = null; }
function handleSave() {
    if (!validate())
        return;
    var isEdit = !!editingId;
    var obj = new Product(isEdit ? editingId : Date.now().toString(), iName.value.trim(), parseFloat(iPrice.value), iCat.value.trim(), iImg.value.trim());
    isEdit ? manager.updateProduct(obj) : manager.addProduct(obj);
    manager.filter(search.value, catSel.value, !isEdit);
    populateCat();
    closeAdd();
    render();
}
// ✅ Fix 3: Bổ sung toàn bộ event listeners bị thiếu
document.getElementById('btn-add-new').addEventListener('click', openAdd);
document.getElementById('btn-close-modal').addEventListener('click', closeAdd);
document.getElementById('btn-cancel').addEventListener('click', closeAdd);
document.getElementById('btn-save').addEventListener('click', handleSave);
addModal.addEventListener('click', function (e) {
    if (e.target === addModal)
        closeAdd();
});
grid.addEventListener('click', function (e) {
    var t = e.target;
    if (t.classList.contains('btn-delete')) {
        pendingDeleteId = t.getAttribute('data-id');
        confirmModal.classList.add('active');
    }
    if (t.classList.contains('btn-edit')) {
        var p = manager.getById(t.getAttribute('data-id'));
        if (p)
            openEdit(p);
    }
});
document.getElementById('confirm-cancel').addEventListener('click', function () {
    pendingDeleteId = null;
    confirmModal.classList.remove('active');
});
document.getElementById('confirm-delete').addEventListener('click', function () {
    if (!pendingDeleteId)
        return;
    manager.deleteProduct(pendingDeleteId);
    manager.filter(search.value, catSel.value, false);
    populateCat();
    confirmModal.classList.remove('active');
    pendingDeleteId = null;
    render();
});
confirmModal.addEventListener('click', function (e) {
    if (e.target === confirmModal) {
        pendingDeleteId = null;
        confirmModal.classList.remove('active');
    }
});
search.addEventListener('input', function () { manager.filter(search.value, catSel.value, true); render(); });
catSel.addEventListener('change', function () { manager.filter(search.value, catSel.value, true); render(); });
bPrev.addEventListener('click', function () { manager.prev(); render(); });
bNext.addEventListener('click', function () { manager.next(); render(); });
// ─── Boot ────────────────────────────────────────────────────
manager.filter('', 'all', true);
populateCat();
render();
