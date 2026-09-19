import { useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  X,
} from "lucide-react";
import {
  Avatar,
  Spinner,
  Dropdown,
  DropdownItem,
  DropdownDivider,
} from "@components/ui/index.js";
import { useGetPostQuery } from "@features/posts/postsAPI.js";
import {
  useLikePostMutation,
  useUnlikePostMutation,
  useBookmarkPostMutation,
  useDeletePostMutation,
} from "@features/posts/postsAPI.js";
import {
  useGetCommentsQuery,
  useAddCommentMutation,
  useLikeCommentMutation,
  useReplyToCommentMutation,
  useGetRepliesQuery,
} from "@features/posts/commentsAPI.js";
import useAuth from "@hooks/useAuth.js";
import { timeAgo, formatFullDate } from "@utils/formatDate.js";
import toast from "react-hot-toast";
import styles from "./PostDetailPage.module.css";

// ---- Comment Item ----
const CommentItem = ({ comment, postAuthorId, onReply }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [likeComment] = useLikeCommentMutation();

  const { data: repliesData } = useGetRepliesQuery(
    { commentId: comment._id },
    { skip: !showReplies },
  );

  const replies = repliesData?.data?.replies || [];

  const handleLike = async () => {
    setLiked((prev) => !prev);
    try {
      await likeComment(comment._id).unwrap();
    } catch {
      setLiked((prev) => !prev);
    }
  };

  return (
    <div className={styles.comment}>
      <Link to={`/profile/${comment.author?.username}`}>
        <Avatar
          src={comment.author?.avatar?.url}
          alt={comment.author?.username}
          size="sm"
        />
      </Link>

      <div className={styles.commentContent}>
        <p className={styles.commentText}>
          <Link
            to={`/profile/${comment.author?.username}`}
            className={styles.commentUsername}
          >
            {comment.author?.username}
          </Link>
          {comment.text}
        </p>

        <div className={styles.commentMeta}>
          <span className={styles.commentTime}>
            {timeAgo(comment.createdAt)}
          </span>
          {comment.likes?.length > 0 && (
            <span className={styles.commentLikes}>
              {comment.likes.length} likes
            </span>
          )}
          <button className={styles.replyBtn} onClick={() => onReply(comment)}>
            Reply
          </button>
        </div>

        {/* View Replies */}
        {comment.replies?.length > 0 && (
          <button
            className={styles.viewRepliesBtn}
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies
              ? "Hide replies"
              : `View ${comment.replies.length} replies`}
          </button>
        )}

        {/* Replies */}
        {showReplies && replies.length > 0 && (
          <div className={styles.replies}>
            {replies.map((reply) => (
              <div key={reply._id} className={styles.comment}>
                <Link to={`/profile/${reply.author?.username}`}>
                  <Avatar
                    src={reply.author?.avatar?.url}
                    alt={reply.author?.username}
                    size="xs"
                  />
                </Link>
                <div className={styles.commentContent}>
                  <p className={styles.commentText}>
                    <Link
                      to={`/profile/${reply.author?.username}`}
                      className={styles.commentUsername}
                    >
                      {reply.author?.username}
                    </Link>
                    {reply.text}
                  </p>
                  <div className={styles.commentMeta}>
                    <span className={styles.commentTime}>
                      {timeAgo(reply.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Like Button */}
      <button
        className={`${styles.commentLikeBtn} ${liked ? styles.liked : ""}`}
        onClick={handleLike}
      >
        <Heart size={14} fill={liked ? "currentColor" : "none"} />
      </button>
    </div>
  );
};

// ---- Post Detail Page ----
const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const commentInputRef = useRef(null);

  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { data, isLoading } = useGetPostQuery(postId);
  const { data: commentsData } = useGetCommentsQuery({
    postId,
    page: 1,
    limit: 50,
  });

  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const [bookmarkPost] = useBookmarkPostMutation();
  const [deletePost] = useDeletePostMutation();
  const [addComment] = useAddCommentMutation();
  const [replyToComment] = useReplyToCommentMutation();

  const post = data?.data?.post;
  const comments = commentsData?.data?.comments || [];
  const isOwner = user?._id === post?.author?._id;

  // Sync liked/bookmarked state from API
  useState(() => {
    if (data?.data) {
      setIsLiked(data.data.isLiked);
      setIsBookmarked(data.data.isBookmarked);
      setLikesCount(post?.likes?.length || 0);
    }
  }, [data]);

  const handleLike = async () => {
    setIsLiked((prev) => !prev);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    try {
      if (isLiked) {
        await unlikePost(postId).unwrap();
      } else {
        await likePost(postId).unwrap();
      }
    } catch {
      setIsLiked((prev) => !prev);
      setLikesCount((prev) => (isLiked ? prev + 1 : prev - 1));
    }
  };

  const handleBookmark = async () => {
    setIsBookmarked((prev) => !prev);
    try {
      await bookmarkPost(postId).unwrap();
    } catch {
      setIsBookmarked((prev) => !prev);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost(postId).unwrap();
      toast.success("Post deleted");
      navigate(-1);
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      if (replyingTo) {
        await replyToComment({
          commentId: replyingTo._id,
          text: commentText.trim(),
        }).unwrap();
        setReplyingTo(null);
      } else {
        await addComment({
          postId,
          text: commentText.trim(),
        }).unwrap();
      }
      setCommentText("");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const handleReply = (comment) => {
    setReplyingTo(comment);
    commentInputRef.current?.focus();
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "var(--space-16)",
        }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ textAlign: "center", padding: "var(--space-16)" }}>
        <h2>Post not found</h2>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Back Button */}
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        Back
      </button>

      <div className={styles.layout}>
        {/* ---- Media Side ---- */}
        <div className={styles.mediaSection}>
          {post.media?.[0]?.mediaType === "video" ? (
            <video
              src={post.media[0].url}
              className={styles.media}
              controls
              playsInline
            />
          ) : (
            <img
              src={post.media?.[0]?.url}
              alt={post.caption || "Post"}
              className={styles.media}
            />
          )}
        </div>

        {/* ---- Info Side ---- */}
        <div className={styles.infoSection}>
          {/* Header */}
          <div className={styles.postHeader}>
            <Link
              to={`/profile/${post.author?.username}`}
              className={styles.postHeaderLeft}
            >
              <Avatar
                src={post.author?.avatar?.url}
                alt={post.author?.username}
                size="md"
              />
              <div className={styles.postHeaderInfo}>
                <span className={styles.postHeaderUsername}>
                  {post.author?.username}
                </span>
                {post.location && (
                  <span className={styles.postHeaderLocation}>
                    {post.location}
                  </span>
                )}
              </div>
            </Link>

            {/* More Options */}
            <Dropdown
              isOpen={isMoreOpen}
              onClose={() => setIsMoreOpen(false)}
              placement="bottomRight"
              trigger={
                <button
                  className={styles.actionBtn}
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                >
                  <MoreHorizontal size={20} />
                </button>
              }
            >
              {isOwner ? (
                <>
                  <DropdownItem
                    danger
                    onClick={() => {
                      handleDelete();
                      setIsMoreOpen(false);
                    }}
                  >
                    Delete Post
                  </DropdownItem>
                </>
              ) : (
                <DropdownItem danger onClick={() => setIsMoreOpen(false)}>
                  Report
                </DropdownItem>
              )}
            </Dropdown>
          </div>

          {/* Comments */}
          <div className={styles.commentsSection}>
            {/* Caption */}
            {post.caption && (
              <div className={styles.captionBlock}>
                <Link to={`/profile/${post.author?.username}`}>
                  <Avatar
                    src={post.author?.avatar?.url}
                    alt={post.author?.username}
                    size="sm"
                  />
                </Link>
                <div>
                  <p className={styles.captionText}>
                    <Link
                      to={`/profile/${post.author?.username}`}
                      className={styles.captionUsername}
                    >
                      {post.author?.username}
                    </Link>
                    {post.caption}
                  </p>
                  <p className={styles.captionTime}>
                    {timeAgo(post.createdAt)}
                  </p>
                </div>
              </div>
            )}

            {/* Comments List */}
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                postAuthorId={post.author?._id}
                onReply={handleReply}
              />
            ))}

            {comments.length === 0 && (
              <p
                style={{
                  textAlign: "center",
                  color: "var(--color-text-tertiary)",
                  padding: "var(--space-8) 0",
                }}
              >
                No comments yet. Be the first!
              </p>
            )}
          </div>

          {/* Actions */}
          <div className={styles.actionsSection}>
            <div className={styles.actions}>
              <button
                className={`${styles.actionBtn} ${isLiked ? styles.liked : ""}`}
                onClick={handleLike}
              >
                <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => commentInputRef.current?.focus()}
              >
                <MessageCircle size={24} />
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => {
                  navigator.clipboard?.writeText(
                    `${window.location.origin}/post/${postId}`,
                  );
                  toast.success("Link copied!");
                }}
              >
                <Send size={24} />
              </button>
              <button
                className={`${styles.actionBtn} ${styles.bookmarkBtn} ${isBookmarked ? styles.liked : ""}`}
                onClick={handleBookmark}
              >
                <Bookmark
                  size={24}
                  fill={isBookmarked ? "currentColor" : "none"}
                />
              </button>
            </div>

            {likesCount > 0 && (
              <p className={styles.likesCount}>
                {likesCount.toLocaleString()}{" "}
                {likesCount === 1 ? "like" : "likes"}
              </p>
            )}
            <p className={styles.postTime}>{formatFullDate(post.createdAt)}</p>
          </div>

          {/* Reply indicator */}
          {replyingTo && (
            <div className={styles.replyingTo}>
              <span>
                Replying to <strong>@{replyingTo.author?.username}</strong>
              </span>
              <button
                className={styles.cancelReply}
                onClick={() => setReplyingTo(null)}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Add Comment */}
          <div className={styles.addCommentSection}>
            <Avatar
              src={user?.avatar?.url}
              alt={user?.username || ""}
              size="sm"
            />
            <input
              ref={commentInputRef}
              className={styles.commentInput}
              placeholder={
                replyingTo
                  ? `Reply to @${replyingTo.author?.username}...`
                  : "Add a comment..."
              }
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
            />
            <button
              className={styles.postBtn}
              onClick={handleAddComment}
              disabled={!commentText.trim()}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
