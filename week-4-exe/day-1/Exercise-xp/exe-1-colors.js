const colors = ["Blue", "Green", "Red", "Orange", "Violet", "Indigo", "Yellow"];


// Display choices
colors.forEach((color, index) => {
  console.log(`${index + 1}# choice is ${color}.`);
});

// Check for "Violet"
const hasViolet = colors.some(color => color === "Violet");

console.log(hasViolet ? "Yeah" : "No...");