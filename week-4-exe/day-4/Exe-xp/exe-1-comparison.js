function compareToTen(num) {
  return new Promise((resolve, reject) => {
    if (num <= 10) {
      resolve(`${num} is less than or equal to 10`);
    } else {
      reject(`${num} is greater than 10`);
    }
  });
}

compareToTen(15)
  .then(res => console.log(res))
  .catch(err => console.log(err));

compareToTen(8)
  .then(res => console.log(res))
  .catch(err => console.log(err));