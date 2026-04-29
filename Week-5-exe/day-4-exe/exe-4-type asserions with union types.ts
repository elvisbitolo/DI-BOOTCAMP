function getFirstElement(arr: (number | string)[]): string {
  return arr[0] as string;
}

console.log(getFirstElement(["hello", 2, 3]));
console.log(getFirstElement([1, 2, 3]));