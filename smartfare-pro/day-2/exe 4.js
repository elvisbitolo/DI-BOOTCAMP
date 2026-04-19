function hotelCost() {
    // Instead of prompt, we simulate a user typing "5"
    let nights = "5"; 
    return parseInt(nights) * 140;
}

function planeRideCost() {
    let destination = "Paris"; // Simulating user input
    if (destination === "London") return 183;
    if (destination === "Paris") return 220;
    return 300;
}

function rentalCarCost() {
    let days = "12"; // Simulating user input
    let cost = parseInt(days) * 40;
    if (parseInt(days) > 10) cost *= 0.95;
    return cost;
}

function totalVacationCost() {
    const hotel = hotelCost();
    const plane = planeRideCost();
    const car = rentalCarCost();

    console.log(`Hotel: $${hotel}, Plane: $${plane}, Car: $${car}`);
    console.log(`Total: $${hotel + plane + car}`);
}

totalVacationCost();