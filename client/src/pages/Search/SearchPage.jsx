import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Search, X, Heart, MessageCircle, Users, Image } from "lucide-react";
import { Avatar, Button, Spinner } from "@components/ui/index.js";
import { useSearchUsersQuery } from "@features/users/usersAPI.js";
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "@features/users/usersAPI.js";
import { useGetFeedQuery } from "@features/posts/postsAPI.js";
import useDebounce from "@hooks/useDebounce.js";
import toast from "react-hot-toast";
import styles from "./SearchPage.module.css";

// ---- User Item ----
const UserItem = ({ user }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  const handleFollow = async (e) => {
    e.preventDefault();
    setIsFollowing((prev) => !prev);
    try {
      if (isFollowing) {
        await unfollowUser(user._id).unwrap();
      } else {
        await followUser(user._id).unwrap();
      }
    } catch {
      setIsFollowing((prev) => !prev);
      toast.error("Action failed");
    }
  };

  return (
    <Link to={`/profile/${user.username}`} className={styles.userItem}>
      <Avatar src={user.avatar?.url} alt={user.username} size="md" />
      <div className={styles.userItemInfo}>
        <p className={styles.userItemName}>{user.fullName || user.username}</p>
        <p className={styles.userItemUsername}>@{user.username}</p>
        {user.followers?.length > 0 && (
          <p className={styles.userItemFollowers}>
            {user.followers.length} followers
          </p>
        )}
      </div>
      <Button
        variant={isFollowing ? "secondary" : "primary"}
        size="sm"
        onClick={handleFollow}
      >
        {isFollowing ? "Following" : "Follow"}
      </Button>
    </Link>
  );
};

// ---- Search Page ----
const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeTab, setActiveTab] = useState("users");
  const debouncedQuery = useDebounce(query, 400);

  const { data: usersData, isLoading: usersLoading } = useSearchUsersQuery(
    { q: debouncedQuery, page: 1, limit: 20 },
    { skip: !debouncedQuery || activeTab !== "users" },
  );

  const { data: postsData, isLoading: postsLoading } = useGetFeedQuery(
    { page: 1, limit: 30 },
    { skip: activeTab !== "posts" },
  );

  const users = usersData?.data?.users || [];
  const posts = postsData?.data?.posts || [];

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val) {
      setSearchParams({ q: val });
    } else {
      setSearchParams({});
    }
  };

  const handleClear = () => {
    setQuery("");
    setSearchParams({});
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.searchHeader}>
        <h1 className={styles.searchTitle}>Search</h1>

        {/* Search Bar */}
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>
            <Search size={18} />
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search users..."
            value={query}
            onChange={handleQueryChange}
            autoFocus
          />
          {query && (
            <button className={styles.clearBtn} onClick={handleClear}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "users" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <Users size={16} style={{ marginRight: "6px" }} />
          Users
        </button>
        <button
          className={`${styles.tab} ${activeTab === "posts" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          <Image size={16} style={{ marginRight: "6px" }} />
          Posts
        </button>
      </div>

      {/* ---- Users Tab ---- */}
      {activeTab === "users" && (
        <>
          {usersLoading ? (
            <div className={styles.loadingState}>
              <Spinner size="md" />
            </div>
          ) : !debouncedQuery ? (
            <div className={styles.emptyState}>
              <Search size={48} strokeWidth={1} className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>Search for people</h3>
              <p>Find people to follow</p>
            </div>
          ) : users.length === 0 ? (
            <div className={styles.emptyState}>
              <Users size={48} strokeWidth={1} className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>No results</h3>
              <p>No users found for "{debouncedQuery}"</p>
            </div>
          ) : (
            <div className={styles.results}>
              {users.map((user) => (
                <UserItem key={user._id} user={user} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ---- Posts Tab ---- */}
      {activeTab === "posts" && (
        <>
          {postsLoading ? (
            <div className={styles.loadingState}>
              <Spinner size="md" />
            </div>
          ) : posts.length === 0 ? (
            <div className={styles.emptyState}>
              <Image size={48} strokeWidth={1} className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>No posts yet</h3>
              <p>Follow people to see posts here</p>
            </div>
          ) : (
            <div className={styles.postsGrid}>
              {posts.map((post) => (
                <div
                  key={post._id}
                  className={styles.postGridItem}
                  onClick={() => navigate(`/post/${post._id}`)}
                >
                  {post.media?.[0] && (
                    <img
                      src={post.media[0].url}
                      alt="Post"
                      className={styles.postGridImage}
                      loading="lazy"
                    />
                  )}
                  <div className={styles.postGridOverlay}>
                    <div className={styles.postGridStat}>
                      <Heart size={18} fill="white" />
                      {post.likes?.length || 0}
                    </div>
                    <div className={styles.postGridStat}>
                      <MessageCircle size={18} fill="white" />
                      {post.comments?.length || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;
