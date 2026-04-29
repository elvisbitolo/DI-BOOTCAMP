function validateUnionType(value: any, allowedTypes: string[]): boolean {
    const valueType = typeof value;

    for (let type of allowedTypes) {
        if (valueType === type) {
            return true;
        }
    }

    return false;
}

// ✅ Test cases
console.log(validateUnionType(10, ["string", "number"])); // true
console.log(validateUnionType("hello", ["string", "number"])); // true
console.log(validateUnionType(true, ["string", "number"])); // false
console.log(validateUnionType([], ["object"])); // true
console.log(validateUnionType(null, ["object"])); //true