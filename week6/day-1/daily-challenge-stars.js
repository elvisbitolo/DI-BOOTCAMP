// One loop
let line = "";

for (let i = 0; i < 6; i++) {
    line += "* ";
    console.log(line);
}

// Nested loops
for (let i = 1; i <= 6; i++) {
    let row = "";
    for (let j = 0; j < i; j++) {
        row += "* ";
    }
    console.log(row);
}