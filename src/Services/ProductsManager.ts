// src/services/ProductManager.ts
import { Product } from '../Models/Products.js'; // Phải có đuôi .js

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
        this.categories = [...new Set(initialProducts.map((p) => p.category))];
    }

    private saveToStorage(): void {
        localStorage.setItem('my_products', JSON.stringify(this.products));
    }

    // ... (Copy nguyên các hàm addProduct, updateProduct, deleteProduct, filterProducts... vào đây)
}