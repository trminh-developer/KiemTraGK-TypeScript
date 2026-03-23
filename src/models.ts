// ================================================
// Product Class
// ================================================
export class Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;

    constructor(
        id: string,
        name: string,
        price: number,
        category: string,
        image: string
    ) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.category = category;
        this.image = image;
    }

    // Trả về chuỗi giá đã format, ví dụ: "$9.99"
    getFormattedPrice(): string {
        return `$${this.price.toFixed(2)}`;
    }

    // Trả về HTML card để render lên giao diện
    toCardHTML(): string {
        return `
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
        `;
    }
}

// ================================================
// ProductManager Class
// ================================================
export class ProductManager {
    private products: Product[];
    private filteredProducts: Product[];
    private currentPage: number;
    private readonly itemsPerPage: number;
    private categories: string[];

    constructor(initialProducts: Product[]) {
        this.products = [...initialProducts];
        this.filteredProducts = [...initialProducts];
        this.currentPage = 1;
        this.itemsPerPage = 4;
        // Lấy danh sách category không trùng lặp từ dữ liệu ban đầu
        this.categories = [...new Set(initialProducts.map((p) => p.category))];
    }

    // Thêm sản phẩm mới vào đầu danh sách
    addProduct(product: Product): void {
        this.products.unshift(product);
        if (!this.categories.includes(product.category)) {
            this.categories.push(product.category);
        }
    }

    // Lọc sản phẩm theo tên và category, reset về trang 1
    filterProducts(searchTerm: string, category: string): void {
        const term = searchTerm.toLowerCase();
        this.filteredProducts = this.products.filter((p) => {
            const matchName = p.name.toLowerCase().includes(term);
            const matchCat = category === 'all' || p.category === category;
            return matchName && matchCat;
        });
        this.currentPage = 1;
    }

    // Lấy danh sách sản phẩm của trang hiện tại
    getCurrentPageProducts(): Product[] {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.filteredProducts.slice(start, end);
    }

    // Tính tổng số trang
    getTotalPages(): number {
        return Math.ceil(this.filteredProducts.length / this.itemsPerPage) || 1;
    }

    getCurrentPage(): number {
        return this.currentPage;
    }

    getCategories(): string[] {
        return this.categories;
    }

    nextPage(): void {
        if (this.currentPage < this.getTotalPages()) {
            this.currentPage++;
        }
    }

    prevPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }
}