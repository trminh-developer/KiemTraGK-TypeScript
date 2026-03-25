import { Product, ProductManager } from './models.js';
// ================================================
// Dữ liệu mẫu ban đầu
// ================================================
const initialProducts = [
    new Product('1', 'Essence Mascara Lash Princess', 9.99, 'beatiful', './Essence.png'),
    new Product('2', 'Eyeshadow Palette with Mirror', 19.99, 'beatiful', './Eyeshaddow.png'),
    new Product('3', 'Powder Canister', 14.99, 'beatiful', './Powder.png'),
    new Product('4', 'Red Lipstick', 12.99, 'beatiful', './Red-Lip.png'),
    new Product('5', 'Red Nail Posish', 8.99, 'beatiful', './Red-Nail.png'),
    new Product('6', 'Calvin Klein CK One', 49.99, 'fragrances', './Calvin.png'),
    new Product('7', 'Chanel Coco Noir Eau De', 129.99, 'fragrances', './Coco-Chanel.png'),
    new Product('8', 'Sneakers', 89.99, 'fragrances', './Dior.png'),
    new Product('9', 'Eyeshadow Palette with Mirror', 19.99, 'beatiful', './Eyeshaddow.png'),
    new Product('10', 'Red Lipstick', 12.99, 'beatiful', './Red-Lip.png'),
    new Product('11', 'Calvin Klein CK One', 49.99, 'fragrances', './Calvin.png'),
    new Product('12', 'Sneakers', 89.99, 'fragrances', './Dior.png'),
    new Product('13', 'Essence Mascara Lash Princess', 9.99, 'beatiful', './Essence.png'),
    new Product('14', 'Powder Canister', 14.99, 'beatiful', './Powder.png'),
    new Product('15', 'Red Nail Posish', 8.99, 'beatiful', './Red-Nail.png'),
    new Product('16', 'Chanel Coco Noir Eau De', 129.99, 'fragrances', './Coco-Chanel.png'),
];
// Khởi tạo ProductManager
const manager = new ProductManager(initialProducts);
// ================================================
// Lấy các phần tử DOM — ID khớp với index.html
// ================================================
const productGrid = document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const categorySelect = document.getElementById('category-select');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const pageInfo = document.getElementById('page-info');
const addModal = document.getElementById('add-modal');
const btnAddNew = document.getElementById('btn-add-new');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancel = document.getElementById('btn-cancel');
const addProductForm = document.getElementById('add-product-form');
const inputName = document.getElementById('p-name');
const inputPrice = document.getElementById('p-price');
const inputCategory = document.getElementById('p-category');
const inputImage = document.getElementById('p-image');
const errName = document.getElementById('err-name');
const errPrice = document.getElementById('err-price');
const errCategory = document.getElementById('err-category');
const errImage = document.getElementById('err-image');
// Render sản phẩm + cập nhật pagination
function render() {
    const pageProducts = manager.getCurrentPageProducts();
    productGrid.innerHTML = pageProducts.map(p => p.toCardHTML()).join('');
    const current = manager.getCurrentPage();
    const total = manager.getTotalPages();
    pageInfo.textContent = `${current} / ${total}`;
    // Sửa lại thành <= 1 và >= total cho an toàn tuyệt đối
    btnPrev.disabled = current <= 1;
    btnNext.disabled = current >= total;
}
// ================================================
// Populate category dropdown
// ================================================
function populateCategorySelect() {
    const existing = Array.from(categorySelect.options).map(o => o.value);
    manager.getCategories().forEach(cat => {
        if (!existing.includes(cat)) {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        }
    });
}
// ================================================
// Modal helpers
// ================================================
function openModal() {
    addModal.style.display = 'flex';
    addProductForm.reset();
    clearErrors();
}
function closeModal() {
    addModal.style.display = 'none';
    addProductForm.reset();
    clearErrors();
}
// ================================================
// Validation
// ================================================
function clearErrors() {
    [errName, errPrice, errCategory, errImage].forEach(el => el.style.display = 'none');
}
function validateForm() {
    clearErrors();
    let valid = true;
    if (!inputName.value.trim()) {
        errName.style.display = 'block';
        valid = false;
    }
    const price = parseFloat(inputPrice.value);
    if (isNaN(price) || price <= 0) {
        errPrice.style.display = 'block';
        valid = false;
    }
    if (!inputCategory.value.trim()) {
        errCategory.style.display = 'block';
        valid = false;
    }
    if (!inputImage.value.trim()) {
        errImage.style.display = 'block';
        valid = false;
    }
    return valid;
}
// ================================================
// Event Listeners
// ================================================
// Mở / đóng modal
btnAddNew.addEventListener('click', openModal);
btnCloseModal.addEventListener('click', closeModal);
btnCancel.addEventListener('click', closeModal);
// Đóng modal khi click ra ngoài overlay
addModal.addEventListener('click', (e) => {
    if (e.target === addModal)
        closeModal();
});
// Submit form — thêm sản phẩm mới
addProductForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm())
        return;
    const newProduct = new Product(Date.now().toString(), inputName.value.trim(), parseFloat(inputPrice.value), inputCategory.value.trim(), inputImage.value.trim());
    manager.addProduct(newProduct);
    populateCategorySelect();
    // FIX: Gọi filter lại để tự động cập nhật danh sách hiển thị và nhảy về Trang 1
    manager.filterProducts(searchInput.value, categorySelect.value);
    closeModal();
    render();
});
// Search
searchInput.addEventListener('input', () => {
    manager.filterProducts(searchInput.value, categorySelect.value);
    render();
});
// Category filter
categorySelect.addEventListener('change', () => {
    manager.filterProducts(searchInput.value, categorySelect.value);
    render();
});
// Pagination
btnPrev.addEventListener('click', () => {
    manager.prevPage();
    render();
});
btnNext.addEventListener('click', () => {
    manager.nextPage();
    render();
});
// Khởi chạy lần đầu
populateCategorySelect();
render();
