const express = require("express");
const { auth } = require("../middleware/auth");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const router = express.Router();

// @route   POST /api/messages
// @desc    Send a message (creates conversation if not exist)
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { recipientId, text } = req.body;
    const senderId = req.user._id;

    if (!recipientId || !text) {
      return res.status(400).json({ message: "Recipient and text are required" });
    }

    // Find conversation between these two users
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] }
    });

    // If not exists, create it
    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId],
      });
      await conversation.save();
    }

    // Create message
    const message = new Message({
      conversation: conversation._id,
      sender: senderId,
      text: text,
    });
    await message.save();

    // Update conversation's last message
    conversation.lastMessage = {
      text,
      sender: senderId,
      createdAt: message.createdAt
    };
    await conversation.save();

    res.status(201).json(message);
  } catch (error) {
    console.error("Failed to send message:", error);
    res.status(500).json({ message: "Server error during messaging" });
  }
});

// @route   GET /api/messages
// @desc    Get all conversations for current user
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
    .populate("participants", "name email profile.avatar")
    .sort({ updatedAt: -1 });

    res.json({ conversations });
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/messages/:conversationId
// @desc    Get messages for a conversation
// @access  Private
router.get("/:conversationId", auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({ messages });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
