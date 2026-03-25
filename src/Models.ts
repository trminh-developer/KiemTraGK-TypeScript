export class Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;

    constructor(id: string, name: string, price: number, category: string, image: string) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.category = category;
        this.image = image;
    }

    getFormattedPrice(): string {
        return `$${this.price.toFixed(2)}`;
    }

    toCardHTML(): string {
        return `
      <div class="product-card">
        <div class="product-image-container">
          <img
            src="${this.image}"
            alt="${this.name}"
            class="product-image"
            onerror="this.src='https://via.placeholder.com/200?text=No+Image'"
          />
        </div>
        <h3 class="product-name">${this.name}</h3>
        <span class="product-category-badge">${this.category}</span>
        <div class="product-price">${this.getFormattedPrice()}</div>
        <div class="card-actions">
          <button class="btn-edit" data-id="${this.id}">Sửa</button>
          <button class="btn-delete" data-id="${this.id}">Xóa</button>
        </div>
      </div>
    `;
    }
}

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
        this.updateCategories();
    }

    private saveToStorage(): void {
        localStorage.setItem('my_products', JSON.stringify(this.products));
    }

    private updateCategories(): void {
        this.categories = [...new Set(this.products.map(p => p.category))].sort();
    }

    addProduct(product: Product): void {
        this.products.unshift(product);
        this.updateCategories();
        this.saveToStorage();
    }

    getProductById(id: string): Product | undefined {
        return this.products.find(p => p.id === id);
    }

    updateProduct(updated: Product): void {
        const index = this.products.findIndex(p => p.id === updated.id);
        if (index !== -1) {
            this.products[index] = updated;
            this.updateCategories();
            this.saveToStorage();
        }
    }

    deleteProduct(id: string): void {
        this.products = this.products.filter(p => p.id !== id);
        this.updateCategories();
        this.saveToStorage();
    }

    filterProducts(searchTerm: string, category: string, resetPage: boolean = false): void {
        const term = searchTerm.toLowerCase();
        this.filteredProducts = this.products.filter(p => {
            const matchName = p.name.toLowerCase().includes(term);
            const matchCat = category === 'all' || p.category === category;
            return matchName && matchCat;
        });

        if (resetPage) {
            this.currentPage = 1;
        } else {
            const total = this.getTotalPages();
            if (this.currentPage > total) this.currentPage = total || 1;
        }
    }

    getCurrentPageProducts(): Product[] {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredProducts.slice(start, start + this.itemsPerPage);
    }

    getTotalPages(): number {
        return Math.max(1, Math.ceil(this.filteredProducts.length / this.itemsPerPage));
    }

    getCurrentPage(): number {
        return this.currentPage;
    }

    getCategories(): string[] {
        return this.categories;
    }

    nextPage(): void {
        if (this.currentPage < this.getTotalPages()) this.currentPage++;
    }

    prevPage(): void {
        if (this.currentPage > 1) this.currentPage--;
    }
}