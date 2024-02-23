import express from "express";
import { config } from "dotenv";
import Cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import http from "http";
import { Message } from "./models/message.js";

const app = express();

console.log("okay");

config({
  path: "./config/.env",
});

// Create HTTP server
export const server = http.createServer(app);

// Pass server instance to Socekt.io

const users = {};

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND || "https://instagramsocialmedia.vercel.app",
    // origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Defined an array to store online status of users with timing information
const onlineUsers = [];

// Defined an array to store pending messages to be sent when recipients come online
const pendingMessageSeen = [];

io.on("connection", (socket) => {
  // console.log("A user connected");

  socket.on("user_connected", async (userId) => {
    users[userId] = socket.id;
    // Add the user to the onlineUsers array with timing information
    let userEntry = onlineUsers.find((entry) => entry.userId === userId);
    if (!userEntry) {
      // If user is not already in the onlineUsers array, create a new entry
      userEntry = {
        userId,
        socketId: socket.id,
        timing: {
          from: new Date().toISOString(),
          to: "", // User is still online, so 'to' is empty string for now
        },
      };
      onlineUsers.push(userEntry);
    } else {
      userEntry.socketId = socket.id;
      userEntry.timing.from = new Date().toISOString();
      userEntry.timing.to = "";
    }

    // Emit event to notify all clients except the current user
    socket.broadcast.emit("user_online", userEntry);

    // Send information about online users to the newly connected user
    socket.emit("online_users", onlineUsers);

    // If there are queued messages for this user, deliver them
    let messages = [];
    messages = await Message.find({ recipient: userId });

    if (messages.length) {
      messages.forEach((msg) => {
        socket.emit("private_message_receive", msg);
      });
      // Remove delivered messages from the database
      await Message.deleteMany({ recipient: userId })
        .then(() => {
          console.log("Queued messages delivered and removed");
        })
        .catch((err) => {
          console.error("Error deleting messages:", err);
        });
    }
  });

  socket.on(
    "pending_message_seen_for_conversation",
    ({ senderId, recipientId }) => {
      // Handling pending message_seen events for this conversation
      const pendingMessageForUser = pendingMessageSeen.filter(
        (msg) => msg.recipient === recipientId && msg.sender === senderId
      );
      const senderSocketId = users[senderId];
      if (pendingMessageForUser.length) {
        io.to(senderSocketId).emit("message_has_seen", {
          sender: pendingMessageForUser.sender,
          recipient: pendingMessageForUser.recipient,
        });
        // Remove the message from the pendingMessageSeen array
        pendingMessageSeen.splice(
          pendingMessageSeen.indexOf(pendingMessageForUser),
          1
        );
      }
    }
  );

  socket.on("private_message", ({ sender, recipient, content, createdAt }) => {
    const receiverSocketId = users[recipient];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("private_message_receive", {
        sender,
        recipient,
        content,
        createdAt,
      });
    } else {
      // If user is not online store the message in the database
      const newMessage = new Message({ sender, recipient, content });
      newMessage
        .save()
        .then(() => {
          console.log("Message saved to database");
        })
        .catch((err) =>
          console.error("Error saving message to database:", err)
        );
    }
  });

  socket.on("message_seen", ({ sender, recipient }) => {
    const senderSocketId = users[sender];
    if (senderSocketId) {
      io.to(senderSocketId).emit("message_has_seen", { sender, recipient });
    } else {
      // If recipient is offline, store the information and emit the event when recipient comes online
      pendingMessageSeen.push({ sender, recipient });
    }
  });

  socket.on("message", ({ room, message }) => {
    io.to(room).emit("receive-message", message);
  });

  socket.on("disconnect", () => {
    for (const userEntry of onlineUsers) {
      if (userEntry.socketId === socket.id) {
        userEntry.timing.to = new Date().toISOString();
        // Emit event to notify all clients about user going offline
        io.emit("user_offline", userEntry);
        break;
      }
    }
    for (const userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }
    }
  });
});

// USING MIDDLEWARES
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(
  Cors({
    origin: "https://instagramsocialmedia.vercel.app",
    // origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// IMPORTING ROUTES
import userRoutes from "./routes/user.js";
import postRoutes from "./routes/post.js";
import messageRoutes from "./routes/message.js";

// USING ROUTES
app.use("/api/v1", userRoutes);
app.use("/api/v1", postRoutes);
app.use("/api/v1", messageRoutes);

app.get("/", async (req, res) => {
  res.send("Anontalks official server");
});

export default app;
