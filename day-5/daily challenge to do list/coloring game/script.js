const colorsContainer = document.querySelector(".colors");
const grid = document.querySelector(".grid");

let selectedColor = "black";
let isDrawing = false;

// Color palette
const colors = [
  "red", "blue", "green", "yellow",
  "orange", "purple", "black", "white"
];

//  color picker
colors.forEach(color => {
  const div = document.createElement("div");
  div.classList.add("color");
  div.style.background = color;

  div.addEventListener("click", () => {
    selectedColor = color;
  });

  colorsContainer.appendChild(div);
});


//  grid
for (let i = 0; i < 400; i++) {
  const cell = document.createElement("div");
  cell.classList.add("cell");

  // Start drawing
  cell.addEventListener("mousedown", () => {
    isDrawing = true;
    cell.style.background = selectedColor;
  });

  // Draw while dragging
  cell.addEventListener("mouseover", () => {
    if (isDrawing) {
      cell.style.background = selectedColor;
    }
  });

  grid.appendChild(cell);
}


// Stop drawing anywhere on page
document.addEventListener("mouseup", () => {
  isDrawing = false;
});