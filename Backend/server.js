const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ACTIONS = require("./Actions");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const { default: axios } = require("axios");
const { v4: uuidv4 } = require('uuid');
require('dotenv').config(); 

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Replace with the actual origin of your client application
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

app.use(express.json());
app.use(cors());

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) return done(null, false, { message: "Invalid username" });

      const validPass = await bcrypt.compare(password, user.password);
      if (!validPass) return done(null, false, { message: "Invalid password" });

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// Express session
app.use(
  session({
    secret: "your-secret-key",
    resave: true,
    saveUninitialized: true,
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});
const User = mongoose.model("user", UserSchema);

const createuser = async (req, res) => {
  const emailExists = await User.findOne({ email: req.body.email });

  if (emailExists) return res.status(400).send("Email already exists");

  const usernameExists = await User.findOne({ username: req.body.username });

  if (usernameExists) return res.status(400).send("Username already exists");

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  const hasheduser = new User({
    username: req.body.username.toUpperCase(),
    email: req.body.email,
    password: hashPassword,
  });

  try {
    const saveduser = await User.create(hasheduser);
    res.status(201).json(saveduser);
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const loginUser = async (req, res) => {
  const user = await User.findOne({
    username: req.body.username.toUpperCase(),
  });
  if (!user) return res.status(400).send("Invalid username");

  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Invalid password");

  const token = jwt.sign({ name: user.username }, "sfsfs");
  try {
    res.send({ token: token });
  } catch (error) {
    res.send("Incorrect login details");
  }
};

const ChatMessage = mongoose.model("ChatMessage", {
  username: String,
  message: String,
});

const userSocketMap = {};

function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
}
const userConnections = {};

function findMostSimilarInterests(currentUser, connectedUsers) {
  console.log("In the matching users function");
  console.log(currentUser);
  console.log(connectedUsers);
  
  let bestMatch = null;
  let maxCommonInterests = 0;

  connectedUsers.forEach((user) => {
    const commonInterests = currentUser.interests.filter((interest) =>
      user.interests.includes(interest)
    );

    if (commonInterests.length > maxCommonInterests) {
      bestMatch = user;
      maxCommonInterests = commonInterests.length;
    }
  });

  return bestMatch ? [currentUser, bestMatch] : null;
}

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on(ACTIONS.MATCH_USERS, ({ username, interests }) => {
    console.log(`Matching for the username ${username} interests are ${interests}`);
    const currentId = socket.id;
    userConnections[currentId] = { username, interests, socketId: currentId };
    console.log(`Begining the userConnections are ${JSON.stringify(userConnections)}`);

    // Delay the matchmaking process by 5 seconds
    setTimeout(() => {
      console.log(`First the userConnections are ${JSON.stringify(userConnections)}`);
      const connectedUsers = Object.entries(userConnections)
        .filter(([id, user]) => id !== currentId && user.interests.length > 0)
        .map(([id, user]) => user);

      if (connectedUsers.length >= 1) {
        console.log("At least one user found");
        console.log(`After the userConnections are ${JSON.stringify(userConnections)}`);
        
        console.log(`For the user ${userConnections[currentId]}`);
        

        const matchedUsers = findMostSimilarInterests(userConnections[currentId], connectedUsers);
        ///console.log(matchedUsers);
        

        if (matchedUsers) {
          console.log( `Matching users`);
          const [user1, user2] = matchedUsers;
          console.log(user1);
          console.log(user2);
          
          
          const roomId = uuidv4();
          
          // delete userConnections[user1.socketId];
          // delete userConnections[user2.socketId];
          io.to(user1.socketId).emit(ACTIONS.NAVIGATE_CHAT, { roomId });
          io.to(user2.socketId).emit(ACTIONS.NAVIGATE_CHAT, { roomId });
          delete userConnections[user1.socketId];
          delete userConnections[user2.socketId];
        } else {
          console.log("No matched users found");
        }
      } else {
        console.log("No other users found");
      }
    }, 5000); // 5-second delay

  });
  socket.on(ACTIONS.NEXT_CHAT, ({ username, interests }) => {
    console.log(`Next chat requested for user: ${username}, interests: ${interests}`);
    const currentId = socket.id;
    userConnections[currentId] = { username, interests, socketId: currentId };
  
    const connectedUsers = Object.entries(userConnections)
      .filter(([id, user]) => id !== currentId && user.interests.length > 0)
      .map(([id, user]) => user);
  
    if (connectedUsers.length >= 1) {
      console.log("At least one user found");
  
      const matchedUsers = findMostSimilarInterests(userConnections[currentId], connectedUsers);
  
      if (matchedUsers) {
        console.log(`Matching users`);
        const [user1, user2] = matchedUsers;
        const roomId = uuidv4();
  
        
        io.to(user1.socketId).emit(ACTIONS.NAVIGATE_CHAT, { roomId });
        io.to(user2.socketId).emit(ACTIONS.NAVIGATE_CHAT, { roomId });
        delete userConnections[user1.socketId];
        delete userConnections[user2.socketId];
        
      } else {
        console.log("No matched users found");
      }
    } else {
      console.log("No other users found");
    }
  });
  
  // socket.on(ACTIONS.NEXT_CHAT, ({ username, interests }) => {
  //   console.log(`Next chat requested for user: ${username}, interests: ${interests}`);
  //   // Re-use matchmaking logic here
  //   const currentId = socket.id;
  //   userConnections[currentId] = { username, interests, socketId: currentId };

  //   setTimeout(() => {
  //     const connectedUsers = Object.entries(userConnections)
  //       .filter(([id, user]) => id !== currentId && user.interests.length > 0)
  //       .map(([id, user]) => user);

  //     if (connectedUsers.length >= 1) {
  //       console.log("At least one user found");

  //       const matchedUsers = findMostSimilarInterests(userConnections[currentId], connectedUsers);

  //       if (matchedUsers) {
  //         console.log(`Matching users`);
  //         const [user1, user2] = matchedUsers;
  //         const roomId = uuidv4();
          
  //         io.to(user1.socketId).emit(ACTIONS.NAVIGATE_CHAT, { roomId });
  //         io.to(user2.socketId).emit(ACTIONS.NAVIGATE_CHAT, { roomId });
  //         delete userConnections[user1.socketId];
  //         delete userConnections[user2.socketId];
  //       } else {
  //         console.log("No matched users found");
  //       }
  //     } else {
  //       console.log("No other users found");
  //     }
  //   }, 5000); // 5-second delay
  // });

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on(ACTIONS.SEND_MESSAGE, ({ roomId, message }) => {
    const senderUsername = userSocketMap[socket.id];
    const chatMessage = new ChatMessage({ senderUsername, message });
    chatMessage.save();
    io.in(roomId).emit(ACTIONS.RECEIVE_MESSAGE, {
      username: senderUsername,
      message,
    });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
  });
});

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

const router = express.Router();
router.route("/signup").post(createuser);
router.route("/login").post(loginUser);

app.use("/api", router);
// // server.js
// const express = require("express");
// const http = require("http");
// const mongoose = require("mongoose");
// const { Server } = require("socket.io");
// const cors = require("cors");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const passport = require("passport");
// const LocalStrategy = require("passport-local").Strategy;
// const session = require("express-session");
// const { v4: uuidv4 } = require("uuid");
// const ACTIONS = require("./actions");
// require("dotenv").config();

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//     allowedHeaders: ["my-custom-header"],
//     credentials: true,
//   },
// });

// // Middleware
// app.use(express.json());
// app.use(cors());

// // MongoDB Connection
// mongoose
//   .connect(process.env.MONGO_URL)
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("Error connecting to MongoDB:", err));

// // User Schema
// const UserSchema = new mongoose.Schema({
//   username: String,
//   email: String,
//   password: String,
// });
// const User = mongoose.model("user", UserSchema);

// // Passport Setup
// passport.use(
//   new LocalStrategy(async (username, password, done) => {
//     try {
//       const user = await User.findOne({ username });
//       if (!user) return done(null, false, { message: "Invalid username" });

//       const validPass = await bcrypt.compare(password, user.password);
//       if (!validPass) return done(null, false, { message: "Invalid password" });

//       return done(null, user);
//     } catch (error) {
//       return done(error);
//     }
//   })
// );

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//   User.findById(id, (err, user) => {
//     done(err, user);
//   });
// });

// // Express Session
// app.use(
//   session({
//     secret: "your-secret-key",
//     resave: true,
//     saveUninitialized: true,
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());

// // Create User Endpoint
// app.post("/createuser", async (req, res) => {
//   try {
//     const { username, email, password } = req.body;

//     if (await User.findOne({ email })) return res.status(400).send("Email already exists");
//     if (await User.findOne({ username })) return res.status(400).send("Username already exists");

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({ username, email, password: hashedPassword });

//     const savedUser = await newUser.save();
//     res.status(201).json(savedUser);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Login User Endpoint
// app.post("/login", async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const user = await User.findOne({ username });
//     if (!user) return res.status(400).send("Invalid username");

//     const validPass = await bcrypt.compare(password, user.password);
//     if (!validPass) return res.status(400).send("Invalid password");

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
//     res.json({ token });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Matchmaking Logic
// const userConnections = {};

// function findMostSimilarInterests(currentUser, connectedUsers) {
//   let bestMatch = null;
//   let maxCommonInterests = 0;

//   connectedUsers.forEach((user) => {
//     const commonInterests = currentUser.interests.filter((interest) =>
//       user.interests.includes(interest)
//     );

//     if (commonInterests.length > maxCommonInterests) {
//       bestMatch = user;
//       maxCommonInterests = commonInterests.length;
//     }
//   });

//   return bestMatch ? [currentUser, bestMatch] : null;
// }

// io.on("connection", (socket) => {
//   console.log("socket connected", socket.id);

//   socket.on(ACTIONS.MATCH_USERS, ({ username, interests }) => {
//     userConnections[socket.id] = { username, interests, socketId: socket.id };

//     setTimeout(() => {
//       const connectedUsers = Object.values(userConnections).filter(
//         (user) => user.socketId !== socket.id
//       );

//       if (connectedUsers.length) {
//         const matchedUsers = findMostSimilarInterests(userConnections[socket.id], connectedUsers);

//         if (matchedUsers) {
//           const [user1, user2] = matchedUsers;
//           const roomId = uuidv4();

//           io.to(user1.socketId).emit(ACTIONS.NAVIGATE_CHAT, { roomId });
//           io.to(user2.socketId).emit(ACTIONS.NAVIGATE_CHAT, { roomId });

//           delete userConnections[user1.socketId];
//           delete userConnections[user2.socketId];
//         }
//       }
//     }, 5000);
//   });

//   socket.on("disconnect", () => {
//     delete userConnections[socket.id];
//   });
// });

// server.listen(process.env.PORT || 5000, () => {
//   console.log(`Server running on port ${process.env.PORT || 5000}`);
// });
