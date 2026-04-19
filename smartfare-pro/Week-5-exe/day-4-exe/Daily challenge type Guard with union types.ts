// ===== TYPES =====
type User = {
  type: 'user';
  name: string;
  age: number;
};

type Product = {
  type: 'product';
  id: number;
  price: number;
};

type Order = {
  type: 'order';
  orderId: string;
  amount: number;
};

// ===== FUNCTION =====
function handleData(data: (User | Product | Order)[]): string[] {
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
const data: (User | Product | Order)[] = [
  { type: 'user', name: 'Elvo', age: 20 },
  { type: 'product', id: 101, price: 500 },
  { type: 'order', orderId: 'ORD123', amount: 1200 }
];

// ===== RUN =====
const result = handleData(data);
console.log(result);