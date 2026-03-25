// src/app.ts
import { Product } from './Models/Products.js';
import { ProductManager } from './Services/ProductsManager.js';

// Khởi tạo dữ liệu
function loadProducts(): Product[] {
    const savedData = localStorage.getItem('my_products');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        return parsedData.map((p: any) => new Product(p.id, p.name, p.price, p.category, p.image));
    }
    return [];
}

const initialProducts = loadProducts();
const manager = new ProductManager(initialProducts);

// ... (Giữ nguyên toàn bộ phần DOM, Event Listeners của bạn ở dưới đây)