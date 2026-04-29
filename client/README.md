#  SmartFare AI

SmartFare AI is a full-stack intelligent transport pricing and booking system that predicts travel costs, simulates ride booking, and provides a modern user experience with maps and AI assistance.
# Features

- User Authentication (Register/Login with JWT)
-  AI-Based Fare Prediction
-  Dynamic Google Maps Integration (Any location in Kenya)
-  Ride History Tracking
-  Booking Simulation (Driver assignment + ETA)
-  AI Chat Assistant
-  MongoDB Atlas Cloud Database
## Tech Stack

# Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas

### Other Tools
- Mongoose
- JWT (Authentication)
- bcryptjs (Password hashing)
- CORS
For one to run the project,one must have installed mongoose this way npm install express mongoose dotenv cors bcryptjs  jsonwebtoken.
Then you have to change directory in the folder using cd server.Then  install dependencies npm install express mongoose dotenv cors bcryptjs jsonwebtoken.
Start backend node server.js you should see  MONGODB connected   then server running.
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=3000
Open frontend http://localhost:3000/index.html.
