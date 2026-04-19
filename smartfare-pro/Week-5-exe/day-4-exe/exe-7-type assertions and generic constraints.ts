function formatInput<T extends { toString(): string }>(input: T): string {
  return (input as T).toString();
}

console.log(formatInput(123));
console.log(formatInput(true));
console.log(formatInput("Hello"));