function checkNumber(num: number): string {
    if (num > 0) {
        return "Positive";
    } else if (num < 0) {
        return "Negative";
    } else {
        return "Zero";
    }
}

console.log(checkNumber(5));
console.log(checkNumber(-3));
console.log(checkNumber(0));