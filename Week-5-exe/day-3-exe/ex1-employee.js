"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Employee {
    name;
    salary;
    position;
    department;
    constructor(name, salary, position, department) {
        this.name = name;
        this.salary = salary;
        this.position = position;
        this.department = department;
    }
    getEmployeeInfo() {
        return `${this.name} - ${this.position}`;
    }
}
// test it
const emp = new Employee("Elvo", 50000, "Developer", "IT");
console.log(emp.getEmployeeInfo());
//# sourceMappingURL=ex1-employee.js.map