"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
// src/models/Product.ts
var Product = /** @class */ (function () {
    function Product(id, name, price, category, image) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.category = category;
        this.image = image;
    }
    Product.prototype.getFormattedPrice = function () {
        return "$".concat(this.price.toFixed(2));
    };
    Product.prototype.toCardHTML = function () {
        return "\n            <div class=\"product-card\">\n                <div class=\"product-image-container\">\n                    <img src=\"".concat(this.image, "\" alt=\"").concat(this.name, "\" class=\"product-image\" onerror=\"this.src='https://via.placeholder.com/200?text=No+Image'\">\n                </div>\n                <h3 class=\"product-name\">").concat(this.name, "</h3>\n                <span class=\"product-category-badge\">").concat(this.category, "</span>\n                <div class=\"product-price\">").concat(this.getFormattedPrice(), "</div>\n                <div style=\"margin-top: 15px; display: flex; gap: 10px;\">\n                    <button class=\"btn-secondary btn-edit\" data-id=\"").concat(this.id, "\" style=\"flex: 1; padding: 5px;\">S\u1EEDa</button>\n                    <button class=\"btn-primary btn-delete\" data-id=\"").concat(this.id, "\" style=\"flex: 1; padding: 5px; background-color: #dc3545;\">X\u00F3a</button>\n                </div>\n            </div>\n        ");
    };
    return Product;
}());
exports.Product = Product;
