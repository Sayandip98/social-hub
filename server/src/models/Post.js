import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    caption: {
      type: String,
      maxlength: [2200, "Caption cannot exceed 2200 characters"],
      default: "",
    },
    media: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
        mediaType: {
          type: String,
          enum: ["image", "video"],
          default: "image",
        },
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    hashtags: [{ type: String }],
    location: {
      type: String,
      default: "",
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

postSchema.virtual("likesCount").get(function () {
  return this.likes.length;
});

postSchema.virtual("commentsCount").get(function () {
  return this.comments.length;
});

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });

const Post = mongoose.model("Post", postSchema);
export default Post;
