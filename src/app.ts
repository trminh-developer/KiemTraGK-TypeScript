import { Product, ProductManager } from './Models.js';

/* ═══════════════════════════════════════════════
   SEED DATA  (dùng khi localStorage trống)
═══════════════════════════════════════════════ */
const SEED_PRODUCTS: Product[] = [
];

/* ═══════════════════════════════════════════════
   LOAD từ localStorage (fallback về seed)
═══════════════════════════════════════════════ */
function loadProducts(): Product[] {
    const saved = localStorage.getItem('my_products');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map((p: any) =>
                    new Product(p.id, p.name, Number(p.price), p.category, p.image)
                );
            }
        } catch (e) {
            console.error('Lỗi đọc dữ liệu:', e);
        }
    }
    return SEED_PRODUCTS;
}

/* ═══════════════════════════════════════════════
   KHỞI TẠO
═══════════════════════════════════════════════ */
const manager = new ProductManager(loadProducts());
let editingProductId: string | null = null;
let deleteTargetId: string | null = null;

/* ═══════════════════════════════════════════════
   DOM REFS
═══════════════════════════════════════════════ */
const productGrid = document.getElementById('product-grid') as HTMLElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const categorySelect = document.getElementById('category-select') as HTMLSelectElement;
const btnPrev = document.getElementById('btn-prev') as HTMLButtonElement;
const btnNext = document.getElementById('btn-next') as HTMLButtonElement;
const pageInfo = document.getElementById('page-info') as HTMLSpanElement;

const addModal = document.getElementById('add-modal') as HTMLDivElement;
const modalTitle = document.getElementById('modal-title') as HTMLHeadingElement;
const btnAddNew = document.getElementById('btn-add-new') as HTMLButtonElement;
const btnCloseModal = document.getElementById('btn-close-modal') as HTMLButtonElement;
const btnCancel = document.getElementById('btn-cancel') as HTMLButtonElement;
const btnSave = document.getElementById('btn-save') as HTMLButtonElement;

const inputName = document.getElementById('p-name') as HTMLInputElement;
const inputPrice = document.getElementById('p-price') as HTMLInputElement;
const inputCategory = document.getElementById('p-category') as HTMLInputElement;
const inputImage = document.getElementById('p-image') as HTMLInputElement;

const errName = document.getElementById('err-name') as HTMLSpanElement;
const errPrice = document.getElementById('err-price') as HTMLSpanElement;
const errCategory = document.getElementById('err-category') as HTMLSpanElement;
const errImage = document.getElementById('err-image') as HTMLSpanElement;

const confirmModal = document.getElementById('confirm-modal') as HTMLDivElement;
const confirmCancel = document.getElementById('confirm-cancel') as HTMLButtonElement;
const confirmDelete = document.getElementById('confirm-delete') as HTMLButtonElement;

/* ═══════════════════════════════════════════════
   RENDER
═══════════════════════════════════════════════ */
function render(): void {
    const pageProducts = manager.getCurrentPageProducts();

    productGrid.innerHTML = pageProducts.length === 0
        ? '<p class="empty-msg">Chưa có sản phẩm nào. Bấm "Add New" để thêm nhé!</p>'
        : pageProducts.map(p => p.toCardHTML()).join('');

    const current = manager.getCurrentPage();
    const total = manager.getTotalPages();
    pageInfo.textContent = `${current} / ${total}`;
    btnPrev.disabled = current <= 1;
    btnNext.disabled = current >= total;
}

function populateCategorySelect(): void {
    const current = categorySelect.value;
    categorySelect.innerHTML = '<option value="all">Tất cả danh mục</option>';
    manager.getCategories().forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        categorySelect.appendChild(opt);
    });
    const exists = manager.getCategories().includes(current);
    categorySelect.value = exists ? current : 'all';
}

/* ═══════════════════════════════════════════════
   FORM VALIDATION
═══════════════════════════════════════════════ */
function clearErrors(): void {
    [errName, errPrice, errCategory, errImage].forEach(el => (el.style.display = 'none'));
    [inputName, inputPrice, inputCategory, inputImage].forEach(el => el.classList.remove('error'));
}

function validateForm(): boolean {
    clearErrors();
    let valid = true;

    if (!inputName.value.trim()) {
        errName.style.display = 'block';
        inputName.classList.add('error');
        valid = false;
    }
    const price = parseFloat(inputPrice.value);
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
function openModal(product: Product | null = null): void {
    editingProductId = product ? product.id : null;
    modalTitle.textContent = product ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm';

    inputName.value = product?.name ?? '';
    inputPrice.value = product?.price.toString() ?? '';
    inputCategory.value = product?.category ?? '';
    inputImage.value = product?.image ?? '';

    clearErrors();
    addModal.classList.add('active');
    inputName.focus();
}

function closeModal(): void {
    addModal.classList.remove('active');
    editingProductId = null;
}

/* ═══════════════════════════════════════════════
   CRUD
═══════════════════════════════════════════════ */
function saveProduct(): void {
    if (!validateForm()) return;

    const isEditing = !!editingProductId;

    if (isEditing) {
        const updated = new Product(
            editingProductId!,
            inputName.value.trim(),
            parseFloat(inputPrice.value),
            inputCategory.value.trim(),
            inputImage.value.trim()
        );
        manager.updateProduct(updated);
    } else {
        const newProduct = new Product(
            Date.now().toString(),
            inputName.value.trim(),
            parseFloat(inputPrice.value),
            inputCategory.value.trim(),
            inputImage.value.trim()
        );
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
btnAddNew.addEventListener('click', () => openModal());
btnCloseModal.addEventListener('click', closeModal);
btnCancel.addEventListener('click', closeModal);
btnSave.addEventListener('click', saveProduct);

addModal.addEventListener('click', (e: Event) => {
    if (e.target === addModal) closeModal();
});

// Enter key submits form
[inputName, inputPrice, inputCategory, inputImage].forEach(el => {
    el.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') saveProduct();
    });
});

// Card actions (event delegation)
productGrid.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;
    const id = target.getAttribute('data-id');
    if (!id) return;

    if (target.classList.contains('btn-edit')) {
        const product = manager.getProductById(id);
        if (product) openModal(product);
    }

    if (target.classList.contains('btn-delete')) {
        deleteTargetId = id;
        confirmModal.classList.add('active');
    }
});

// Confirm delete
confirmCancel.addEventListener('click', () => {
    confirmModal.classList.remove('active');
    deleteTargetId = null;
});

confirmDelete.addEventListener('click', () => {
    if (deleteTargetId) {
        manager.deleteProduct(deleteTargetId);
        manager.filterProducts(searchInput.value, categorySelect.value, false);
        populateCategorySelect();
        render();
    }
    confirmModal.classList.remove('active');
    deleteTargetId = null;
});

confirmModal.addEventListener('click', (e: Event) => {
    if (e.target === confirmModal) {
        confirmModal.classList.remove('active');
        deleteTargetId = null;
    }
});

// Search & filter
searchInput.addEventListener('input', () => {
    manager.filterProducts(searchInput.value, categorySelect.value, true);
    render();
});

categorySelect.addEventListener('change', () => {
    manager.filterProducts(searchInput.value, categorySelect.value, true);
    render();
});

// Pagination
btnPrev.addEventListener('click', () => { manager.prevPage(); render(); });
btnNext.addEventListener('click', () => { manager.nextPage(); render(); });

/* INIT */
manager.filterProducts('', 'all', true);
populateCategorySelect();
render();