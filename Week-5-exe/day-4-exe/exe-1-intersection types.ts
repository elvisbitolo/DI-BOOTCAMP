type Person = {
  name: string;
  age: number;
};

type Address = {
  street: string;
  city: string;
};

type PersonWithAddress = Person & Address;

const user: PersonWithAddress = {
  name: "Elvo",
  age: 20,
  street: "Nairobi Road",
  city: "Nairobi"
};
console.log(user);