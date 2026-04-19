type Person = {
  name: string;
  age: number;
};

type Job = {
  position: string;
  department: string;
};

type Employee = Person & Job;

function describeEmployee(emp: Employee): string {
  if (emp.position === "Manager") {
    return `${emp.name} is a Manager in ${emp.department}`;
  } else if (emp.position === "Developer") {
    return `${emp.name} is a Developer in ${emp.department}`;
  } else {
    return `${emp.name} works in ${emp.department}`;
  }
}

const emp1: Employee = {
  name: "Elvo",
  age: 20,
  position: "Developer",
  department: "IT"
};

console.log(describeEmployee(emp1));