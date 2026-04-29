function makeJuice(size) {
    let ingredients = [];

    function addIngredients(i1, i2, i3) {
        ingredients.push(i1, i2, i3);
    }

    function displayJuice() {
        document.body.innerHTML += `
            <p>The client wants a ${size} juice containing ${ingredients.join(", ")}</p>
        `;
    }

    addIngredients("apple", "banana", "mango");
    addIngredients("orange", "pineapple", "kiwi");

    displayJuice();
}

makeJuice("medium");