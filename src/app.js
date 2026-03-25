"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
var Product_js_1 = require("./Models/Product.js");
var ProductManager_js_1 = require("./Services/ProductManager.js");
// Khởi tạo dữ liệu
function loadProducts() {
    var savedData = localStorage.getItem('my_products');
    if (savedData) {
        var parsedData = JSON.parse(savedData);
        return parsedData.map(function (p) { return new Product_js_1.Product(p.id, p.name, p.price, p.category, p.image); });
    }
    return [];
}
var initialProducts = loadProducts();
var manager = new ProductManager_js_1.ProductManager(initialProducts);
// ... (Giữ nguyên toàn bộ phần DOM, Event Listeners của bạn ở dưới đây)
