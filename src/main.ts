// Model 

class Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;

    constructor(id: string, name: string, price: number, category: string, image: string) {
        this.id = id; this.name = name; this.price = price;
        this.category = category; this.image = image;
    }

    getFormattedPrice(): string {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.price);
    }

    private _esc(s: string): string {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    toCardHTML(): string {
        const n = this._esc(this.name), c = this._esc(this.category), id = this._esc(this.id);
        return `
        <div class="product-card">
            <div class="product-image-container">
                <img src="${this._esc(this.image)}" alt="${n}" class="product-image"
                     onerror="this.src='https://placehold.co/220x160/f3f4f6/9ca3af?text=No+Image'"/>
            </div>
            <h3 class="product-name">${n}</h3>
            <span class="product-category-badge">${c}</span>
            <div class="product-price">${this.getFormattedPrice()}</div>
            <div class="card-actions">
                <button class="btn-edit"   data-id="${id}">✏ Sửa</button>
                <button class="btn-delete" data-id="${id}">✕ Xóa</button>
            </div>
        </div>`;
    }
}

// Manager 

class ProductManager {
    products: Product[];
    filteredProducts: Product[];
    currentPage: number;
    itemsPerPage: number;
    categories: string[];

    constructor(initial: Product[]) {
        this.products = [...initial];
        this.filteredProducts = [...initial];
        this.currentPage = 1;
        this.itemsPerPage = 4;
        this.categories = [];
        this._updateCategories();
    }

    private _save(): void {
        try { localStorage.setItem('pm_products', JSON.stringify(this.products)); } catch (_) { }
    }

    private _updateCategories(): void {
        this.categories = [...new Set(this.products.map(p => p.category))];
    }

    addProduct(p: Product): void {
        this.products.unshift(p);
        this._updateCategories();
        this._save();
    }

    getById(id: string): Product | undefined {
        return this.products.find(p => p.id === id);
    }

    updateProduct(up: Product): void {
        const pi = this.products.findIndex(p => p.id === up.id);
        if (pi !== -1) this.products[pi] = up;
        const fi = this.filteredProducts.findIndex(p => p.id === up.id);
        if (fi !== -1) this.filteredProducts[fi] = up;
        this._updateCategories();
        this._save();
    }

    deleteProduct(id: string): void {
        this.products = this.products.filter(p => p.id !== id);
        this.filteredProducts = this.filteredProducts.filter(p => p.id !== id);
        this._updateCategories();
        this._save();
    }

    filter(term: string, cat: string, reset = false): void {
        const t = term.trim().toLowerCase();
        this.filteredProducts = this.products.filter(p =>
            p.name.toLowerCase().includes(t) &&
            (cat === 'all' || p.category.toLowerCase() === cat.toLowerCase())
        );
        if (reset) {
            this.currentPage = 1;
        } else {
            if (this.currentPage > this.totalPages()) this.currentPage = this.totalPages();
        }
    }

    page(): Product[] {
        const s = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredProducts.slice(s, s + this.itemsPerPage);
    }

    totalPages(): number {
        return Math.ceil(this.filteredProducts.length / this.itemsPerPage) || 1;
    }

    next(): void { if (this.currentPage < this.totalPages()) this.currentPage++; }
    prev(): void { if (this.currentPage > 1) this.currentPage--; }
}

//  Helpers 

function normalizeCategory(raw: string): string {
    const t = raw.trim();
    return t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : t;
}

function loadFromStorage(): Product[] {
    try {
        const data = localStorage.getItem('pm_products');
        if (data) {
            return (JSON.parse(data) as Array<Record<string, unknown>>).map(p =>
                new Product(
                    String(p.id), String(p.name), Number(p.price),
                    normalizeCategory(String(p.category)), String(p.image)
                )
            );
        }
    } catch (e) {
        console.warn('localStorage bị lỗi, reset.', e);
        localStorage.removeItem('pm_products');
    }
    return [];
}

//  Init 

const manager = new ProductManager(loadFromStorage());

let editingId: string | null = null;
let pendingDeleteId: string | null = null;

let _suppressCatChange = false;

//  DOM refs 

const grid = document.getElementById('product-grid') as HTMLElement;
const search = document.getElementById('search-input') as HTMLInputElement;
const catSel = document.getElementById('category-select') as HTMLSelectElement;
const bPrev = document.getElementById('btn-prev') as HTMLButtonElement;
const bNext = document.getElementById('btn-next') as HTMLButtonElement;
const pInfo = document.getElementById('page-info') as HTMLElement;
const addModal = document.getElementById('add-modal') as HTMLElement;
const confirmModal = document.getElementById('confirm-modal') as HTMLElement;
const modalTitle = document.getElementById('modal-title') as HTMLElement;
const iName = document.getElementById('p-name') as HTMLInputElement;
const iPrice = document.getElementById('p-price') as HTMLInputElement;
const iCat = document.getElementById('p-category') as HTMLInputElement;
const iImg = document.getElementById('p-image') as HTMLInputElement;
const errName = document.getElementById('err-name') as HTMLElement;
const errPrice = document.getElementById('err-price') as HTMLElement;
const errCat = document.getElementById('err-category') as HTMLElement;
const errImg = document.getElementById('err-image') as HTMLElement;

//  Render 

function render(): void {
    const list = manager.page();
    grid.innerHTML = list.length
        ? list.map(p => p.toCardHTML()).join('')
        : '<p class="empty-msg">Không có sản phẩm nào.</p>';
    const cur = manager.currentPage, tot = manager.totalPages();
    pInfo.textContent = `${cur} / ${tot}`;
    bPrev.disabled = cur <= 1;
    bNext.disabled = cur >= tot;
}

function populateCat(activeCat?: string): void {
    _suppressCatChange = true;

    const setTo = activeCat !== undefined ? activeCat : catSel.value;
    catSel.innerHTML = '<option value="all">Tất cả danh mục</option>';
    manager.categories.forEach(c => {
        const o = document.createElement('option');
        o.value = c; o.textContent = c;
        catSel.appendChild(o);
    });

    if (setTo === 'all' || manager.categories.includes(setTo)) {
        catSel.value = setTo;
    } else {
        catSel.value = 'all';
    }

    _suppressCatChange = false;
}

//  Form helpers 

function clearErrors(): void {
    [errName, errPrice, errCat, errImg].forEach(e => (e.style.display = 'none'));
    [iName, iPrice, iCat, iImg].forEach(i => i.classList.remove('error'));
}

function clearForm(): void {
    iName.value = iPrice.value = iCat.value = iImg.value = '';
    clearErrors();
}

function showError(errEl: HTMLElement, inputEl: HTMLElement): void {
    errEl.style.display = 'block';
    inputEl.classList.add('error');
}

function validate(): boolean {
    clearErrors();
    let ok = true;
    if (!iName.value.trim()) { showError(errName, iName); ok = false; }
    const price = parseFloat(iPrice.value);
    if (isNaN(price) || !isFinite(price) || price <= 0) { showError(errPrice, iPrice); ok = false; }
    if (!iCat.value.trim()) { showError(errCat, iCat); ok = false; }
    if (!iImg.value.trim()) { showError(errImg, iImg); ok = false; }
    return ok;
}

// Modal helpers 

function openAdd(): void {
    editingId = null;
    modalTitle.textContent = 'Tạo sản phẩm';
    clearForm();
    addModal.classList.add('active');
}

function openEdit(p: Product): void {
    editingId = p.id;
    modalTitle.textContent = 'Cập nhật sản phẩm';
    iName.value = p.name; iPrice.value = String(p.price);
    iCat.value = p.category; iImg.value = p.image;
    clearErrors();
    addModal.classList.add('active');
}

function closeAdd(): void {
    addModal.classList.remove('active');
    clearForm();
    editingId = null;
}

//  Save 

function handleSave(): void {
    if (!validate()) return;

    const isEdit = !!editingId;
    const category = normalizeCategory(iCat.value);

    // ID cực an toàn, tự sinh dựa trên thời gian thực mà không cần HTTPS
    const safeId = isEdit ? editingId! : (Date.now().toString(36) + Math.random().toString(36).substring(2));

    const product = new Product(
        safeId,
        iName.value.trim(),
        parseFloat(iPrice.value),
        category,
        iImg.value.trim()
    );

    if (isEdit) {
        manager.updateProduct(product);
        populateCat(catSel.value);
        manager.filter(search.value, catSel.value, true);
    } else {
        manager.addProduct(product);
        populateCat('all');
        manager.filter(search.value, catSel.value, true);
    }

    closeAdd();
    render();
}

// Event listeners 

document.getElementById('btn-add-new')!.addEventListener('click', openAdd);
document.getElementById('btn-close-modal')!.addEventListener('click', closeAdd);
document.getElementById('btn-cancel')!.addEventListener('click', closeAdd);
document.getElementById('btn-save')!.addEventListener('click', handleSave);

addModal.addEventListener('click', e => {
    if (e.target === addModal) closeAdd();
});

confirmModal.addEventListener('click', e => {
    if (e.target === confirmModal) {
        pendingDeleteId = null;
        confirmModal.classList.remove('active');
    }
});

grid.addEventListener('click', e => {
    const t = e.target as HTMLElement;
    if (t.classList.contains('btn-delete')) {
        const id = t.getAttribute('data-id');
        if (id) { pendingDeleteId = id; confirmModal.classList.add('active'); }
    }
    if (t.classList.contains('btn-edit')) {
        const p = manager.getById(t.getAttribute('data-id') ?? '');
        if (p) openEdit(p);
    }
});

document.getElementById('confirm-delete')!.addEventListener('click', () => {
    if (!pendingDeleteId) return;
    manager.deleteProduct(pendingDeleteId);

    populateCat(catSel.value);
    manager.filter(search.value, catSel.value, false);

    confirmModal.classList.remove('active');
    pendingDeleteId = null;
    render();
});

document.getElementById('confirm-cancel')!.addEventListener('click', () => {
    pendingDeleteId = null;
    confirmModal.classList.remove('active');
});

search.addEventListener('input', () => {
    manager.filter(search.value, catSel.value, true);
    render();
});

catSel.addEventListener('change', () => {
    if (_suppressCatChange) return;
    manager.filter(search.value, catSel.value, true);
    render();
});

bPrev.addEventListener('click', () => { manager.prev(); render(); });
bNext.addEventListener('click', () => { manager.next(); render(); });

// Boot 

manager.filter('', 'all', true);
populateCat('all');
render();