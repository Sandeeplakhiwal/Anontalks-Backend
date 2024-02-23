import { BackupUserMessage } from "../models/backupUserMessage.js";

// Function to remove the _id property from messages
function removeMessageObjectId(messages) {
  return messages.map(({ _id: groupId, contents, ...rest }) => ({
    ...rest,
    contents: contents.map(({ _id, ...messageRest }) => messageRest),
  }));
}

export const backupMessages = async (req, res) => {
  const { userId, messages } = req.body;

  // Remove _id field from messages
  const modifiedMessages = removeMessageObjectId(messages);

  if (modifiedMessages) {
    try {
      // Find the backup document for the user or create a new one if it doesn't exist
      let backupUserMessage = await BackupUserMessage.findOne({ userId });

      if (!backupUserMessage) {
        backupUserMessage = new BackupUserMessage({
          userId,
          messages: modifiedMessages,
        });
      } else {
        // Append new messages to the existing backup
        backupUserMessage.messages.push(...modifiedMessages);
      }

      // Save the backup document to the database
      await backupUserMessage.save();

      return res.status(200).json({
        success: true,
        message: "Messages backed up successfully",
      });
    } catch (error) {
      console.error("Error backing up messages:", error);
      return res
        .status(500)
        .json({ success: false, error: "Internal server error" });
    }
  }
};

export const getUserBackedupMessages = async (req, res) => {
  try {
    const backupMessages = await BackupUserMessage.find({
      userId: req.user._id,
    });
    if (!backupMessages) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }
    return res.status(200).json({
      success: true,
      backupMessages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
