"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function printUserDetails(user) {
    console.log("ID:", user.id);
    console.log("Name:", user.name);
    console.log("Email:", user.email);
    console.log("Membership:", user.membershipLevel ?? "None");
}
const user = {
    id: 1,
    name: "Elvo",
    email: "elvo@example.com",
    membershipLevel: "Gold"
};
printUserDetails(user);
//# sourceMappingURL=ex5-interface.js.map