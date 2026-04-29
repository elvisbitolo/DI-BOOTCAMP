const API = "http://localhost:3000";

// AUTH
async function register() {
  await fetch(API + "/auth/register", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  });
  alert("Registered");
}

async function login() {
  const res = await fetch(API + "/auth/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  });

  const data = await res.json();
  localStorage.setItem("token", data.token);
  location.href = "dashboard.html";
}

function logout() {
  localStorage.removeItem("token");
  location.href = "index.html";
}

// PREDICT
async function predict() {
  const res = await fetch(API + "/predict", {
    method: "POST",
    headers: {
      "Content-Type":"application/json",
      "Authorization": localStorage.getItem("token")
    },
    body: JSON.stringify({
      from: from.value,
      to: to.value
    })
  });

  const data = await res.json();

  result.innerHTML = `Price: ${data.price}`;

  document.getElementById("map").src =
    `https://maps.google.com/maps?q=${from.value}+to+${to.value}&output=embed`;
}

// HISTORY
if (document.getElementById("historyList")) {
  fetch(API + "/predict/history", {
    headers: {"Authorization": localStorage.getItem("token")}
  })
  .then(res=>res.json())
  .then(data=>{
    data.forEach(r=>{
      const li = document.createElement("li");
      li.textContent = `${r.from} → ${r.to} : ${r.price}`;
      historyList.appendChild(li);
    });
  });
}

// BOOKING SIMULATION
function bookRide() {
  const status = document.getElementById("bookingStatus");

  status.innerHTML = "Searching driver...";

  setTimeout(()=>{
    status.innerHTML = "Driver found. Arriving in 3 mins.";
  },2000);

  setTimeout(()=>{
    status.innerHTML = "Driver has arrived.";
  },5000);
}

// CHATBOT
function sendMessage() {
  const input = document.getElementById("chatInput");
  const chat = document.getElementById("chat");

  const userMsg = document.createElement("div");
  userMsg.textContent = "You: " + input.value;
  chat.appendChild(userMsg);

  const botMsg = document.createElement("div");

  if (input.value.includes("price")) {
    botMsg.textContent = "AI: Prices increase during rush hours and weekends.";
  } else if (input.value.includes("bus")) {
    botMsg.textContent = "AI: Likely matatu or ride-hailing depending on route.";
  } else {
    botMsg.textContent = "AI: Try asking about fares or routes.";
  }

  chat.appendChild(botMsg);
  input.value = "";
}