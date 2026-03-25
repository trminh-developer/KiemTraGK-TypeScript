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
exports.ProductManager = void 0;
var ProductManager = /** @class */ (function () {
    function ProductManager(initialProducts) {
        this.products = __spreadArray([], initialProducts, true);
        this.filteredProducts = __spreadArray([], initialProducts, true);
        this.currentPage = 1;
        this.itemsPerPage = 4;
        this.categories = __spreadArray([], new Set(initialProducts.map(function (p) { return p.category; })), true);
    }
    ProductManager.prototype.saveToStorage = function () {
        localStorage.setItem('my_products', JSON.stringify(this.products));
    };
    return ProductManager;
}());
exports.ProductManager = ProductManager;
