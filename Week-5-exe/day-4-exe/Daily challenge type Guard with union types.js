"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ===== FUNCTION =====
function handleData(data) {
    return data.map(item => {
        switch (item.type) {
            case 'user':
                return `User: ${item.name}, Age: ${item.age}`;
            case 'product':
                return `Product ID: ${item.id}, Price: ${item.price}`;
            case 'order':
                return `Order ID: ${item.orderId}, Amount: ${item.amount}`;
            default:
                return "Unknown data type";
        }
    });
}
// ===== TEST DATA =====
const data = [
    { type: 'user', name: 'Elvo', age: 20 },
    { type: 'product', id: 101, price: 500 },
    { type: 'order', orderId: 'ORD123', amount: 1200 }
];
// ===== RUN =====
const result = handleData(data);
console.log(result);
//# sourceMappingURL=Daily%20challenge%20type%20Guard%20with%20union%20types.js.map