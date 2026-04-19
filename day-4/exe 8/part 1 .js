function makeJuice(size) {

    function addIngredients(i1, i2, i3) {
        document.body.innerHTML += `
            <p>The client wants a ${size} juice with ${i1}, ${i2}, ${i3}</p>
        `;
    }

    addIngredients("apple", "banana", "mango");
}

makeJuice("large");