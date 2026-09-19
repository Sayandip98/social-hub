import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Camera } from "lucide-react";
import { Avatar, Spinner, PostSkeleton, Button } from "@components/ui/index.js";
import PostCard from "@features/posts/components/PostCard/PostCard.jsx";
import StoryBar from "@features/stories/components/StoryBar/StoryBar.jsx";
import { useGetFeedQuery } from "@features/posts/postsAPI.js";
import { useGetSuggestionsQuery } from "@features/users/usersAPI.js";
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "@features/users/usersAPI.js";
import useAuth from "@hooks/useAuth.js";
import useInfiniteScroll from "@hooks/useInfiniteScroll.js";
import toast from "react-hot-toast";
import styles from "./FeedPage.module.css";

// ---- Suggestion Item ----
const SuggestionItem = ({ suggestion }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  const handleFollow = async () => {
    setIsFollowing((prev) => !prev);
    try {
      if (isFollowing) {
        await unfollowUser(suggestion._id).unwrap();
      } else {
        await followUser(suggestion._id).unwrap();
      }
    } catch {
      setIsFollowing((prev) => !prev);
      toast.error("Action failed");
    }
  };

  return (
    <div className={styles.suggestionItem}>
      <Avatar
        src={suggestion.avatar?.url}
        alt={suggestion.username}
        size="md"
      />
      <div className={styles.suggestionInfo}>
        <Link
          to={`/profile/${suggestion.username}`}
          className={styles.suggestionUsername}
        >
          {suggestion.username}
        </Link>
        <p className={styles.suggestionSubtext}>
          {suggestion.fullName || "Suggested for you"}
        </p>
      </div>
      <Button
        variant={isFollowing ? "secondary" : "text"}
        size="sm"
        onClick={handleFollow}
      >
        {isFollowing ? "Following" : "Follow"}
      </Button>
    </div>
  );
};

// ---- Feed Page ----
const FeedPage = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  // Fetch current page
  const { data, isLoading, isFetching } = useGetFeedQuery({ page, limit: 10 });

  // Merge pages when data arrives
  useEffect(() => {
    if (!data?.data?.posts) return;

    const incoming = data.data.posts;

    setAllPosts((prev) => {
      if (page === 1) return incoming;

      // Deduplicate
      const existingIds = new Set(prev.map((p) => p._id));
      const unique = incoming.filter((p) => !existingIds.has(p._id));
      return [...prev, ...unique];
    });

    setHasMore(data.data.hasMore);
  }, [data]);

  // Suggestions
  const { data: suggestionsData } = useGetSuggestionsQuery(5);
  const suggestions = suggestionsData?.data?.suggestions || [];

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [isFetching, hasMore]);

  const lastPostRef = useInfiniteScroll(loadMore, hasMore);

  // ---- Loading skeleton ----
  if (isLoading && page === 1) {
    return (
      <div className={styles.layout}>
        <div className={styles.feed}>
          {[...Array(3)].map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      {/* ---- Feed Column ---- */}
      <div className={styles.feed}>
        {/* Story Bar */}
        <StoryBar />

        {/* Empty State */}
        {allPosts.length === 0 && !isLoading ? (
          <div className={styles.emptyFeed}>
            <div className={styles.emptyIcon}>
              <Camera size={64} strokeWidth={1} />
            </div>
            <h2 className={styles.emptyTitle}>Your feed is empty</h2>
            <p className={styles.emptyText}>
              Follow people to see their posts here
            </p>
          </div>
        ) : (
          <>
            {allPosts.map((post, index) => (
              <div
                key={post._id}
                ref={index === allPosts.length - 1 ? lastPostRef : null}
              >
                <PostCard post={post} />
              </div>
            ))}

            {/* Loading more spinner */}
            {isFetching && page > 1 && (
              <div className={styles.loadingMore}>
                <Spinner size="md" />
              </div>
            )}

            {/* End of feed */}
            {!hasMore && allPosts.length > 0 && (
              <p className={styles.endMessage}>You're all caught up 🎉</p>
            )}
          </>
        )}
      </div>

      {/* ---- Right Sidebar ---- */}
      <aside className={styles.rightSidebar}>
        {/* User Card */}
        <Link to={`/profile/${user?.username}`} className={styles.userCard}>
          <Avatar
            src={user?.avatar?.url}
            alt={user?.username || ""}
            size="lg"
          />
          <div className={styles.userCardInfo}>
            <p className={styles.userCardName}>
              {user?.fullName || user?.username}
            </p>
            <p className={styles.userCardUsername}>@{user?.username}</p>
          </div>
        </Link>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className={styles.suggestionsCard}>
            <div className={styles.suggestionsHeader}>
              <span className={styles.suggestionsTitle}>Suggested for you</span>
            </div>
            {suggestions.map((suggestion) => (
              <SuggestionItem key={suggestion._id} suggestion={suggestion} />
            ))}
          </div>
        )}
      </aside>
    </div>
  );
};

export default FeedPage;
