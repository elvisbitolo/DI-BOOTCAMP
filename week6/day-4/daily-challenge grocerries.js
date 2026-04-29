let client = "John";

const groceries = {
    fruits: ["pear", "apple", "banana"],
    vegetables: ["tomatoes", "cucumber", "salad"],
    totalPrice: "20$",
    other: {
        paid: true,
        meansOfPayment: ["cash", "creditCard"]
    }
};

// 1. displayGroceries
const displayGroceries = () => {
    groceries.fruits.forEach(fruit => {
        console.log(fruit);
    });
};

// 2. cloneGroceries
const cloneGroceries = () => {

    // copy primitive
    let user = client;

    // change client
    client = "Betty";

    console.log("client:", client); // Betty
    console.log("user:", user);     // John

    // copy object (reference)
    let shopping = groceries;

    // change totalPrice
    shopping.totalPrice = "35$";

    // change nested object
    shopping.other.paid = false;

    console.log("groceries:", groceries);
    console.log("shopping:", shopping);
};

// run
displayGroceries();
cloneGroceries();