"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function describeEmployee(emp) {
    if (emp.position === "Manager") {
        return `${emp.name} is a Manager in ${emp.department}`;
    }
    else if (emp.position === "Developer") {
        return `${emp.name} is a Developer in ${emp.department}`;
    }
    else {
        return `${emp.name} works in ${emp.department}`;
    }
}
const emp1 = {
    name: "Elvo",
    age: 20,
    position: "Developer",
    department: "IT"
};
console.log(describeEmployee(emp1));
//# sourceMappingURL=exe-6-intersection%20types%20and%20type%20guards.js.map