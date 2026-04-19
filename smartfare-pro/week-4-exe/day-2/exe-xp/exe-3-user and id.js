const users = { user1: 18273, user2: 92833, user3: 90315 };

const entries = Object.entries(users);
console.log(entries);

const updated = Object.entries(users).map(([key, value]) => {
  return [key, value * 2];
});

console.log(updated);