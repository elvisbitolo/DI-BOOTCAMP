"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Product {
    id;
    name;
    price;
    constructor(id, name, price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }
    getProductInfo() {
        return `${this.name} - $${this.price}`;
    }
}
const p = new Product(1, "Laptop", 1200);
console.log(p.getProductInfo());
//# sourceMappingURL=ex2-product.js.map