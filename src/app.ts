import { /* The `Product` class is a model representing a product with properties like id, name, price,
category, and image. It also has a method `toCardHTML()` that generates HTML markup for
displaying the product card in the UI. The `Product` class is used to create instances of
products with specific details and is utilized within the application for managing and
displaying product information. */
    Product, ProductManager
} from './models.ts';

// ================================================
// Dữ liệu ban đầu — dùng new Product() (OOP)
// ================================================
const initialProducts: Product[] = [
    new Product('1', 'Essence Mascara Lash Princess', 9.99, 'beauty', ''),
    new Product('2', 'Eyeshadow Palette with Mirror', 19.99, 'beauty', ''),
    new Product('3', 'Powder Canister', 14.99, 'beauty', ''),
    new Product('4', 'Red Lipstick', 12.99, 'beauty', ''),
    new Product('5', 'Red Nail Polish', 8.99, 'beauty', ''),
    new Product('6', 'Calvin Klein CK One', 49.99, 'fragrances', ''),
    new Product('7', 'Chanel Coco Noir Eau De', 129.99, 'fragrances', ''),
    new Product('8', "Dior J'adore", 89.99, 'fragrances', ''),
];

// Khởi tạo ProductManager
const manager = new ProductManager(initialProducts);

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

// Form Inputs
const pName = document.getElementById('p-name') as HTMLInputElement;
const pPrice = document.getElementById('p-price') as HTMLInputElement;
const pCategory = document.getElementById('p-category') as HTMLInputElement;
const pImage = document.getElementById('p-image') as HTMLInputElement;

// Render lưới sản phẩm
function renderPage(): void {
    grid.innerHTML = '';

    const currentProducts = manager.getCurrentPageProducts();
    const totalPages = manager.getTotalPages();
    const currentPage = manager.getCurrentPage();

    currentProducts.forEach((product) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = product.toCardHTML(); // Gọi method của Product class
        grid.appendChild(card);
    });

    // Cập nhật pagination
    pageInfo.textContent = `${currentPage} / ${totalPages}`;
    btnPrev.disabled = currentPage === 1;
    btnNext.disabled = currentPage >= totalPages;
}

// Điền danh sách category vào <select>
function populateCategories(): void {
    manager.getCategories().forEach((cat) => {
        appendCategoryOption(cat);
    });
}

function appendCategoryOption(cat: string): void {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
}

// Lọc sản phẩm
function filterProducts(): void {
    manager.filterProducts(searchInput.value, categorySelect.value);
    renderPage();
}

// Validate form
function clearErrors(): void {
    document.querySelectorAll('.form-group').forEach((group) =>
        group.classList.remove('has-error')
    );
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

// Đóng modal
function closeModal(): void {
    addModal.style.display = 'none';
}

// Gắn Event Listeners
function setupEventListeners(): void {
    // Filter
    searchInput.addEventListener('input', filterProducts);
    categorySelect.addEventListener('change', filterProducts);

    // Phân trang
    btnPrev.addEventListener('click', () => {
        manager.prevPage();
        renderPage();
    });

    btnNext.addEventListener('click', () => {
        manager.nextPage();
        renderPage();
    });

    // Mở modal
    btnAddNew.addEventListener('click', () => {
        addProductForm.reset();
        clearErrors();
        addModal.style.display = 'flex';
    });

    // Đóng modal
    btnCloseModal.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);

    // Click bên ngoài modal để đóng
    addModal.addEventListener('click', (e) => {
        if (e.target === addModal) closeModal();
    });

    // Submit form — tạo Product mới bằng constructor
    addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (validateForm()) {
            const categoriesBefore = manager.getCategories().length;

            // Tạo sản phẩm mới dùng Product class constructor
            const newProduct = new Product(
                Date.now().toString(),
                pName.value.trim(),
                parseFloat(pPrice.value),
                pCategory.value.trim(),
                pImage.value.trim()
            );

            manager.addProduct(newProduct); // Gọi method của ProductManager

            // Nếu có category mới thì thêm vào <select>
            if (manager.getCategories().length > categoriesBefore) {
                appendCategoryOption(newProduct.category);
            }

            filterProducts(); // Re-render với dữ liệu mới
            closeModal();
        }
    });
}

// Khởi chạy ứng dụng
function init(): void {
    populateCategories();
    renderPage();
    setupEventListeners();
}

init();