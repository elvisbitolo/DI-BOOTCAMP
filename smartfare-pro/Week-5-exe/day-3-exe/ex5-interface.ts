interface User {
    readonly id: number;
    name: string;
    email: string;
}

interface PremiumUser extends User {
    membershipLevel?: string;
}

function printUserDetails(user: PremiumUser): void {
    console.log("ID:", user.id);
    console.log("Name:", user.name);
    console.log("Email:", user.email);
    console.log("Membership:", user.membershipLevel ?? "None");
}

const user: PremiumUser = {
    id: 1,
    name: "Elvo",
    email: "elvo@example.com",
    membershipLevel: "Gold"
};

printUserDetails(user);