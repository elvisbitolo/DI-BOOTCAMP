function greet(): string;
function greet(name: string): string;

function greet(name?: string): string {
    if (name) {
        return `Hello, ${name}!`;
    }
    return "Hello, Guest!";
}

console.log(greet("Elvo"));
console.log(greet());