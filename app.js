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
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  // console.log("A user connected");

  socket.on("user_connected", async (userId) => {
    users[userId] = socket.id;
    // console.log("users", users);
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

  socket.on("private_message", ({ sender, recipient, content, createdAt }) => {
    const receiverSocketId = users[recipient];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("private_message_receive", {
        sender,
        recipient,
        content,
        createdAt,
      });
      // console.log("done");
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

  socket.on("message", ({ room, message }) => {
    // console.log(data);
    io.to(room).emit("receive-message", message);
  });

  socket.on("disconnect", () => {
    // console.log("User Disconnected", socket.id);
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

// USING ROUTES
app.use("/api/v1", userRoutes);
app.use("/api/v1", postRoutes);

app.get("/", async (req, res) => {
  res.send("Anontalks official server");
});

export default app;
