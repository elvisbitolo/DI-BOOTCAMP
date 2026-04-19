class Product {
    readonly id: number;
    public name: string;
    public price: number;

    constructor(id: number, name: string, price: number) {
        this.id = id;
        this.name = name;
        this.price = price;
    }

    getProductInfo(): string {
        return `${this.name} - $${this.price}`;
    }
}

const p = new Product(1, "Laptop", 1200);
console.log(p.getProductInfo());
