import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownDivider,
} from "@components/ui/index.js";
import {
  useLikePostMutation,
  useUnlikePostMutation,
  useBookmarkPostMutation,
  useDeletePostMutation,
} from "@features/posts/postsAPI.js";
import { useAddCommentMutation } from "@features/posts/commentsAPI.js";
import useAuth from "@hooks/useAuth.js";
import { timeAgo } from "@utils/formatDate.js";
import toast from "react-hot-toast";
import styles from "./PostCard.module.css";

// ---- Caption with hashtags ----
const Caption = ({ username, text, maxLength = 125 }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  if (!text) return null;

  const displayText =
    expanded || text.length <= maxLength
      ? text
      : text.slice(0, maxLength) + "...";

  // Render hashtags as clickable
  const renderText = (str) => {
    return str.split(/(#\w+)/g).map((part, i) => {
      if (part.startsWith("#")) {
        return (
          <span
            key={i}
            className={styles.hashtag}
            onClick={() => navigate(`/search?q=${part.slice(1)}`)}
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <p className={styles.caption}>
      <Link to={`/profile/${username}`} className={styles.captionUsername}>
        {username}
      </Link>
      <span className={styles.captionText}>{renderText(displayText)}</span>
      {!expanded && text.length > maxLength && (
        <button className={styles.showMore} onClick={() => setExpanded(true)}>
          more
        </button>
      )}
    </p>
  );
};

// ---- Main PostCard ----
const PostCard = ({ post }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentMedia, setCurrentMedia] = useState(0);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const commentInputRef = useRef(null);

  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const [bookmarkPost] = useBookmarkPostMutation();
  const [deletePost] = useDeletePostMutation();
  const [addComment] = useAddCommentMutation();

  const isOwner = user?._id === post.author?._id;

  // ---- Like Handler ----
  const handleLike = async () => {
    // Optimistic update
    setIsLiked((prev) => !prev);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 300);

    try {
      if (isLiked) {
        await unlikePost(post._id).unwrap();
      } else {
        await likePost(post._id).unwrap();
      }
    } catch {
      // Revert optimistic update on error
      setIsLiked((prev) => !prev);
      setLikesCount((prev) => (isLiked ? prev + 1 : prev - 1));
    }
  };

  // ---- Double tap to like ----
  const lastTap = useRef(0);
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!isLiked) handleLike();
    }
    lastTap.current = now;
  };

  // ---- Bookmark Handler ----
  const handleBookmark = async () => {
    setIsBookmarked((prev) => !prev);
    try {
      await bookmarkPost(post._id).unwrap();
    } catch {
      setIsBookmarked((prev) => !prev);
    }
  };

  // ---- Delete Handler ----
  const handleDelete = async () => {
    try {
      await deletePost(post._id).unwrap();
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    }
  };

  // ---- Comment Handler ----
  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      await addComment({
        postId: post._id,
        text: commentText.trim(),
      }).unwrap();
      setCommentText("");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const handleCommentKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <article className={styles.card}>
      {/* ---- Header ---- */}
      <div className={styles.header}>
        <Link
          to={`/profile/${post.author?.username}`}
          className={styles.headerLeft}
        >
          <Avatar
            src={post.author?.avatar?.url}
            alt={post.author?.username}
            size="md"
          />
          <div className={styles.userInfo}>
            <span className={styles.username}>{post.author?.username}</span>
            {post.location && (
              <span className={styles.location}>{post.location}</span>
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
              className={styles.moreBtn}
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              aria-label="Post options"
            >
              <MoreHorizontal size={20} />
            </button>
          }
        >
          {isOwner ? (
            <>
              <DropdownItem
                onClick={() => {
                  navigate(`/post/${post._id}`);
                  setIsMoreOpen(false);
                }}
              >
                Edit Post
              </DropdownItem>
              <DropdownDivider />
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
            <>
              <DropdownItem
                onClick={() => {
                  navigate(`/post/${post._id}`);
                  setIsMoreOpen(false);
                }}
              >
                Go to Post
              </DropdownItem>
              <DropdownItem danger onClick={() => setIsMoreOpen(false)}>
                Report
              </DropdownItem>
            </>
          )}
        </Dropdown>
      </div>

      {/* ---- Media ---- */}
      {post.media?.length > 0 && (
        <div className={styles.mediaContainer} onClick={handleDoubleTap}>
          {post.media[currentMedia].mediaType === "video" ? (
            <video
              src={post.media[currentMedia].url}
              className={styles.media}
              controls
              playsInline
            />
          ) : (
            <img
              src={post.media[currentMedia].url}
              alt={post.caption || "Post image"}
              className={styles.media}
              loading="lazy"
            />
          )}

          {/* Carousel Navigation */}
          {post.media.length > 1 && (
            <>
              {currentMedia > 0 && (
                <button
                  className={`${styles.carouselNav} ${styles.carouselPrev}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentMedia((p) => p - 1);
                  }}
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              {currentMedia < post.media.length - 1 && (
                <button
                  className={`${styles.carouselNav} ${styles.carouselNext}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentMedia((p) => p + 1);
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              )}

              {/* Dots */}
              <div className={styles.dots}>
                {post.media.map((_, i) => (
                  <div
                    key={i}
                    className={`${styles.dot} ${
                      i === currentMedia ? styles.active : ""
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ---- Actions ---- */}
      <div className={styles.actions}>
        {/* Like */}
        <button
          className={`${styles.actionBtn} ${isLiked ? styles.liked : ""} ${likeAnimating ? styles.likeAnimation : ""}`}
          onClick={handleLike}
          aria-label={isLiked ? "Unlike post" : "Like post"}
        >
          <Heart size={26} fill={isLiked ? "currentColor" : "none"} />
        </button>

        {/* Comment */}
        <button
          className={styles.actionBtn}
          onClick={() => commentInputRef.current?.focus()}
          aria-label="Comment on post"
        >
          <MessageCircle size={26} />
        </button>

        {/* Share */}
        <button
          className={styles.actionBtn}
          onClick={() => {
            navigator.clipboard?.writeText(
              `${window.location.origin}/post/${post._id}`,
            );
            toast.success("Link copied!");
          }}
          aria-label="Share post"
        >
          <Send size={26} />
        </button>

        {/* Bookmark */}
        <button
          className={`${styles.actionBtn} ${styles.bookmarkBtn} ${isBookmarked ? styles.bookmarked : ""}`}
          onClick={handleBookmark}
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark post"}
        >
          <Bookmark size={26} fill={isBookmarked ? "currentColor" : "none"} />
        </button>
      </div>

      {/* ---- Info ---- */}
      <div className={styles.info}>
        {/* Likes Count */}
        {likesCount > 0 && (
          <p
            className={styles.likesCount}
            onClick={() => navigate(`/post/${post._id}`)}
          >
            {likesCount.toLocaleString()} {likesCount === 1 ? "like" : "likes"}
          </p>
        )}

        {/* Caption */}
        <Caption username={post.author?.username} text={post.caption} />

        {/* Comments Preview */}
        {post.comments?.length > 0 && (
          <div className={styles.commentsPreview}>
            {post.comments.length > 2 && (
              <button
                className={styles.viewAllComments}
                onClick={() => navigate(`/post/${post._id}`)}
              >
                View all {post.comments.length} comments
              </button>
            )}
            {post.comments.slice(0, 2).map((comment) => (
              <p key={comment._id} className={styles.commentLine}>
                <Link
                  to={`/profile/${comment.author?.username}`}
                  className={styles.commentUsername}
                >
                  {comment.author?.username}
                </Link>
                {comment.text}
              </p>
            ))}
          </div>
        )}

        {/* Time */}
        <p className={styles.timeAgo}>{timeAgo(post.createdAt)}</p>
      </div>

      {/* ---- Add Comment ---- */}
      <div className={styles.addComment}>
        <Avatar src={user?.avatar?.url} alt={user?.username || ""} size="sm" />
        <input
          ref={commentInputRef}
          className={styles.commentInput}
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={handleCommentKeyDown}
          maxLength={1000}
        />
        <button
          className={styles.postCommentBtn}
          onClick={handleAddComment}
          disabled={!commentText.trim()}
        >
          Post
        </button>
      </div>
    </article>
  );
};

export default PostCard;
