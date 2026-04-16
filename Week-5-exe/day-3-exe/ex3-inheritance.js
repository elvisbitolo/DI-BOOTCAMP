"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Animal {
    name;
    constructor(name) {
        this.name = name;
    }
    makeSound() {
        return "Some sound";
    }
}
class Dog extends Animal {
    makeSound() {
        return "Bark";
    }
}
const dog = new Dog("Buddy");
console.log(dog.makeSound());
//# sourceMappingURL=ex3-inheritance.js.map