import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant", "system"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ChatSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  documentId: {
    type: String,
    required: true,
  },
  messages: [MessageSchema],
}, { timestamps: true });

// Compound index for efficient lookups (always queried together)
ChatSchema.index({ userId: 1, documentId: 1 }, { unique: true });

export default mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
