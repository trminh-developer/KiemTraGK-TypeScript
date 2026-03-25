"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductManager = exports.Product = void 0;
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
        return "\n      <div class=\"product-card\">\n        <div class=\"product-image-container\">\n          <img\n            src=\"".concat(this.image, "\"\n            alt=\"").concat(this.name, "\"\n            class=\"product-image\"\n            onerror=\"this.src='https://via.placeholder.com/200?text=No+Image'\"\n          />\n        </div>\n        <h3 class=\"product-name\">").concat(this.name, "</h3>\n        <span class=\"product-category-badge\">").concat(this.category, "</span>\n        <div class=\"product-price\">").concat(this.getFormattedPrice(), "</div>\n        <div class=\"card-actions\">\n          <button class=\"btn-edit\" data-id=\"").concat(this.id, "\">S\u1EEDa</button>\n          <button class=\"btn-delete\" data-id=\"").concat(this.id, "\">X\u00F3a</button>\n        </div>\n      </div>\n    ");
    };
    return Product;
}());
exports.Product = Product;
var ProductManager = /** @class */ (function () {
    function ProductManager(initialProducts) {
        this.products = __spreadArray([], initialProducts, true);
        this.filteredProducts = __spreadArray([], initialProducts, true);
        this.currentPage = 1;
        this.itemsPerPage = 4;
        this.updateCategories();
    }
    ProductManager.prototype.saveToStorage = function () {
        localStorage.setItem('my_products', JSON.stringify(this.products));
    };
    ProductManager.prototype.updateCategories = function () {
        this.categories = __spreadArray([], new Set(this.products.map(function (p) { return p.category; })), true).sort();
    };
    ProductManager.prototype.addProduct = function (product) {
        this.products.unshift(product);
        this.updateCategories();
        this.saveToStorage();
    };
    ProductManager.prototype.getProductById = function (id) {
        return this.products.find(function (p) { return p.id === id; });
    };
    ProductManager.prototype.updateProduct = function (updated) {
        var index = this.products.findIndex(function (p) { return p.id === updated.id; });
        if (index !== -1) {
            this.products[index] = updated;
            this.updateCategories();
            this.saveToStorage();
        }
    };
    ProductManager.prototype.deleteProduct = function (id) {
        this.products = this.products.filter(function (p) { return p.id !== id; });
        this.updateCategories();
        this.saveToStorage();
    };
    ProductManager.prototype.filterProducts = function (searchTerm, category, resetPage) {
        if (resetPage === void 0) { resetPage = false; }
        var term = searchTerm.toLowerCase();
        this.filteredProducts = this.products.filter(function (p) {
            var matchName = p.name.toLowerCase().includes(term);
            var matchCat = category === 'all' || p.category === category;
            return matchName && matchCat;
        });
        if (resetPage) {
            this.currentPage = 1;
        }
        else {
            var total = this.getTotalPages();
            if (this.currentPage > total)
                this.currentPage = total || 1;
        }
    };
    ProductManager.prototype.getCurrentPageProducts = function () {
        var start = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredProducts.slice(start, start + this.itemsPerPage);
    };
    ProductManager.prototype.getTotalPages = function () {
        return Math.max(1, Math.ceil(this.filteredProducts.length / this.itemsPerPage));
    };
    ProductManager.prototype.getCurrentPage = function () {
        return this.currentPage;
    };
    ProductManager.prototype.getCategories = function () {
        return this.categories;
    };
    ProductManager.prototype.nextPage = function () {
        if (this.currentPage < this.getTotalPages())
            this.currentPage++;
    };
    ProductManager.prototype.prevPage = function () {
        if (this.currentPage > 1)
            this.currentPage--;
    };
    return ProductManager;
}());
exports.ProductManager = ProductManager;
