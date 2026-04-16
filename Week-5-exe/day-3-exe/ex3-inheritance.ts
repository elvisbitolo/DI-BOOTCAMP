class Animal {
    public name: string;

    constructor(name: string) {
        this.name = name;
    }

    makeSound(): string {
        return "Some sound";
    }
}

class Dog extends Animal {
    makeSound(): string {
        return "Bark";
    }
}

const dog = new Dog("Buddy");
console.log(dog.makeSound());