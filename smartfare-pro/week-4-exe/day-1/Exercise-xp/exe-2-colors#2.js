const colors = ["Blue", "Green", "Red", "Orange", "Violet", "Indigo", "Yellow"];
const ordinal = ["th","st","nd","rd"];

colors.forEach((color, index) => {
  let suffix;

  if (index === 0) suffix = ordinal[1];
  else if (index === 1) suffix = ordinal[2];
  else if (index === 2) suffix = ordinal[3];
  else suffix = ordinal[0];

  console.log(`${index + 1}${suffix} choice is ${color}.`);
});