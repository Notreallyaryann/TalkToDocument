import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  documentId: {
    type: String,
    required: true,
    unique: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: ["pdf", "excel", "youtube", "web"],
    required: true,
  },
  chunkCount: {
    type: Number,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["processing", "ready", "error"],
    default: "ready",
  },
});

export default mongoose.models.Document || mongoose.model("Document", DocumentSchema);
