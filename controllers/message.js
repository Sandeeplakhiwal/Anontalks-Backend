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
        // Iterate over modified messages
        modifiedMessages.forEach((modMsg) => {
          // Find the corresponding sender in the existing backup
          const existingSenderMessage = backupUserMessage.messages.find(
            (msg) => msg.sender === modMsg.sender
          );

          // If sender's messages already exist, push the modified messages into their contents array
          if (existingSenderMessage) {
            modMsg.contents.forEach((content) => {
              existingSenderMessage.contents.push(content);
            });
          } else {
            // If sender's messages don't exist, create a new sender entry and push the modified messages
            backupUserMessage.messages.push({
              sender: modMsg.sender,
              contents: modMsg.contents,
            });
          }
        });
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
