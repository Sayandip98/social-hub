import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    media: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
      mediaType: {
        type: String,
        enum: ["image", "video"],
        default: "image",
      },
    },
    text: {
      type: String,
      default: "",
    },
    viewers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  },
);

storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

storySchema.index({ author: 1, createdAt: -1 });

const Story = mongoose.model("Story", storySchema);
export default Story;
