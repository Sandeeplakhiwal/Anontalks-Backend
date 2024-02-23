import mongoose from "mongoose";

// Defined a schema for individual messages
const MessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: String, required: true },
});

// Defined a schema for messages grouped by sender
const MessagesSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  contents: [MessageSchema],
});

// Defined a schema for backup user messages
const BackupUserMessageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  messages: [MessagesSchema],
});

// Create and export the model
export const BackupUserMessage = mongoose.model(
  "BackupUserMessage",
  BackupUserMessageSchema
);
