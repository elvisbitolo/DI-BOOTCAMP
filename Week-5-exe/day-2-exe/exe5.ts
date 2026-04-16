function getDetails(name: string, age: number): [string, number, string] {
    return [name, age, `Hello, ${name}! You are ${age} years old.`];
}

const details = getDetails("Alice", 25);
console.log(details);