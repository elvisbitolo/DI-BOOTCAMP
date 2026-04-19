const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const people = ["Greg", "Mary", "Devon", "James"];

people.shift();
people[people.indexOf("James")] = "Jason";
people.push("Elvo");
console.log(people.indexOf("Mary"));

const copy = people.slice(0, people.indexOf("Elvo"));
console.log(copy);

console.log(people.indexOf("Foo"));

const last = people[people.length - 1];
console.log(last);

for (let i = 0; i < people.length; i++) {
    console.log(people[i]);
}

for (let i = 0; i < people.length; i++) {
    console.log(people[i]);
    if (people[i] === "Devon") break;
}

const colors = ["blue", "red", "green", "black", "white"];
const suffixes = ["st", "nd", "rd", "th", "th"];

for (let i = 0; i < colors.length; i++) {
    console.log(`My #${i + 1} choice is ${colors[i]}`);
}

for (let i = 0; i < colors.length; i++) {
    console.log(`My ${i + 1}${suffixes[i]} choice is ${colors[i]}`);
}

function askNumber() {
    rl.question("Enter a number: ", function(input) {
        let num = Number(input);

        if (num < 10) {
            askNumber();
        } else {
            continueProgram();
        }
    });
}

function continueProgram() {
    const building = {
        numberOfFloors: 4,
        numberOfAptByFloor: {
            firstFloor: 3,
            secondFloor: 4,
            thirdFloor: 9,
            fourthFloor: 2,
        },
        nameOfTenants: ["Sarah", "Dan", "David"],
        numberOfRoomsAndRent: {
            sarah: [3, 990],
            dan: [4, 1000],
            david: [1, 500],
        },
    };

    console.log(building.numberOfFloors);
    console.log(building.numberOfAptByFloor.firstFloor);
    console.log(building.numberOfAptByFloor.thirdFloor);
    console.log(building.nameOfTenants[1]);
    console.log(building.numberOfRoomsAndRent.dan[0]);

    if (
        building.numberOfRoomsAndRent.sarah[1] +
            building.numberOfRoomsAndRent.david[1] >
        building.numberOfRoomsAndRent.dan[1]
    ) {
        building.numberOfRoomsAndRent.dan[1] = 1200;
    }

    const family = {
        father: "John",
        mother: "Jane",
        son: "Mike",
        daughter: "Anna",
    };

    for (let key in family) {
        console.log(key);
    }

    for (let key in family) {
        console.log(family[key]);
    }

    const details = {
        my: "name",
        is: "Rudolf",
        the: "reindeer",
    };

    let sentence = "";
    for (let key in details) {
        sentence += key + " " + details[key] + " ";
    }
    console.log(sentence.trim());

    const names = ["Jack", "Philip", "Sarah", "Amanda", "Bernard", "Kyle"];

    const society = names
        .map((name) => name[0])
        .sort()
        .join("");

    console.log(society);

    rl.close();
}

askNumber();