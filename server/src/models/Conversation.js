import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    isGroup: { type: Boolean, default: false },
    groupName: { type: String, default: "" },
    groupAvatar: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

// Prevent duplicate conversations between same two users
conversationSchema.index(
  { participants: 1, isGroup: 1 },
  { unique: false }, // not unique by itself but helps query speed
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
