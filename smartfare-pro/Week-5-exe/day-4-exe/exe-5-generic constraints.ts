function logLength<T extends { length: number }>(item: T): void {
  console.log(item.length);
}

logLength("Hello");
logLength([1, 2, 3]);