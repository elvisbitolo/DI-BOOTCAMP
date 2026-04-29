function makeAllCaps(arr) {
  return new Promise((resolve, reject) => {
    const allStrings = arr.every(word => typeof word === "string");

    if (!allStrings) {
      reject("Error: Not all elements are strings");
    } else {
      const uppercased = arr.map(word => word.toUpperCase());
      resolve(uppercased);
    }
  });
}

function sortWords(arr) {
  return new Promise((resolve, reject) => {
    if (arr.length <= 4) {
      reject("Error: Array length is not bigger than 4");
    } else {
      const sorted = arr.sort();
      resolve(sorted);
    }
  });
}

makeAllCaps(["apple", "pear", "banana", "melon", "kiwi"])
  .then(arr => sortWords(arr))
  .then(result => console.log(result))
  .catch(err => console.log(err));