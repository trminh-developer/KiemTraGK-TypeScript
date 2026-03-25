// ================================================
// Product Class
// ================================================
export class Product {
    constructor(id, name, price, category, image) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.category = category;
        this.image = image;
    }
    // Trả về chuỗi giá đã format, ví dụ: "$9.99"
    getFormattedPrice() {
        return `$${this.price.toFixed(2)}`;
    }
    // Trả về HTML card để render lên giao diện
    toCardHTML() {
        return `
            <div class="product-card">
                <div class="product-image-container">
                    <img
                        src="${this.image}"
                        alt="${this.name}"
                        class="product-image"
                        onerror="this.src='https://via.placeholder.com/200?text=No+Image'"
                    >
                </div>
                <h3 class="product-name">${this.name}</h3>
                <span class="product-category-badge">${this.category}</span>
                <div class="product-price">${this.getFormattedPrice()}</div>
            </div>
        `;
    }
}
// ================================================
// ProductManager Class
// ================================================
export class ProductManager {
    constructor(initialProducts) {
        this.products = [...initialProducts];
        this.filteredProducts = [...initialProducts];
        this.currentPage = 1;
        this.itemsPerPage = 4; // Cập nhật lại thành 4 để thanh Pagination có đất diễn
        this.categories = [...new Set(initialProducts.map((p) => p.category))];
    }
    // Thêm sản phẩm mới vào đầu danh sách gốc
    addProduct(product) {
        this.products.unshift(product);
        // KHÔNG unshift trực tiếp vào filteredProducts ở đây nữa để tránh phá vỡ bộ lọc hiện tại
        if (!this.categories.includes(product.category)) {
            this.categories.push(product.category);
        }
    }
    // Lọc sản phẩm theo tên và category, reset về trang 1
    filterProducts(searchTerm, category) {
        const term = searchTerm.toLowerCase();
        this.filteredProducts = this.products.filter((p) => {
            const matchName = p.name.toLowerCase().includes(term);
            const matchCat = category === 'all' || p.category === category;
            return matchName && matchCat;
        });
        this.currentPage = 1; // Reset về trang 1 mỗi khi lọc dữ liệu
    }
    // Lấy danh sách sản phẩm của trang hiện tại
    getCurrentPageProducts() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.filteredProducts.slice(start, end);
    }
    // Tính tổng số trang
    getTotalPages() {
        return Math.ceil(this.filteredProducts.length / this.itemsPerPage) || 1;
    }
    getCurrentPage() {
        return this.currentPage;
    }
    getCategories() {
        return this.categories;
    }
    nextPage() {
        if (this.currentPage < this.getTotalPages()) {
            this.currentPage++;
        }
    }
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }
}
