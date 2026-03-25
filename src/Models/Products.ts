// src/models/Product.ts
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
                    <img src="${this.image}" alt="${this.name}" class="product-image" onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
                </div>
                <h3 class="product-name">${this.name}</h3>
                <span class="product-category-badge">${this.category}</span>
                <div class="product-price">${this.getFormattedPrice()}</div>
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button class="btn-secondary btn-edit" data-id="${this.id}" style="flex: 1; padding: 5px;">Sửa</button>
                    <button class="btn-primary btn-delete" data-id="${this.id}" style="flex: 1; padding: 5px; background-color: #dc3545;">Xóa</button>
                </div>
            </div>
        `;
    }
}