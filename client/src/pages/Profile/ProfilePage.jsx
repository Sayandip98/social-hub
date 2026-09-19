import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    Grid,
    Bookmark,
    Tag,
    Heart,
    MessageCircle,
    Camera,
    Copy,
    ExternalLink
} from "lucide-react";

import {
    Avatar,
    Button,
    Modal,
    Skeleton,
    Input
} from "@components/ui/index.js";

import {
    useGetUserProfileQuery,
    useFollowUserMutation,
    useUnfollowUserMutation,
    useGetFollowersQuery,
    useGetFollowingQuery,
    useUpdateProfileMutation
} from "@features/users/usersAPI.js";

import {
    useGetUserPostsQuery,
    useGetBookmarksQuery
} from "@features/posts/postsAPI.js";

import { updateUser } from "@features/auth/authSlice.js";
import { useDispatch } from "react-redux";
import axiosInstance from "@services/axiosInstance.js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema } from "@utils/validators.js";
import toast from "react-hot-toast";
import styles from "./ProfilePage.module.css";

// ============================================================
// Follow List Modal
// ============================================================

const FollowListModal = ({
    isOpen,
    onClose,
    title,
    userId,
    type
}) => {
    const { data: followersData } =
        useGetFollowersQuery(
            { userId, page: 1, limit: 50 },
            {
                skip:
                    !isOpen ||
                    type !== "followers"
            }
        );

    const { data: followingData } =
        useGetFollowingQuery(
            { userId, page: 1, limit: 50 },
            {
                skip:
                    !isOpen ||
                    type !== "following"
            }
        );

    const list =
        type === "followers"
            ? followersData?.data?.followers || []
            : followingData?.data?.following || [];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
        >
            <div className={styles.followList}>
                {list.length === 0 ? (
                    <p
                        style={{
                            textAlign: "center",
                            color:
                                "var(--color-text-secondary)",
                            padding:
                                "var(--space-8)"
                        }}
                    >
                        No {type} yet
                    </p>
                ) : (
                    list.map((u) => (
                        <div
                            key={u._id}
                            className={
                                styles.followItem
                            }
                        >
                            <Avatar
                                src={
                                    u.avatar?.url
                                }
                                alt={
                                    u.username
                                }
                                size="md"
                            />

                            <div
                                className={
                                    styles.followItemInfo
                                }
                            >
                                <Link
                                    to={`/profile/${u.username}`}
                                    className={
                                        styles.followItemName
                                    }
                                    onClick={
                                        onClose
                                    }
                                >
                                    {
                                        u.username
                                    }
                                </Link>

                                <p
                                    className={
                                        styles.followItemSub
                                    }
                                >
                                    {u.fullName}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Modal>
    );
};

// ============================================================
// Edit Profile Modal
// ============================================================

const EditProfileModal = ({
    isOpen,
    onClose,
    user
}) => {
    const dispatch = useDispatch();

    const [updateProfile] =
        useUpdateProfileMutation();

    const [
        isUploadingAvatar,
        setIsUploadingAvatar
    ] = useState(false);

    const avatarInputRef = useRef(null);

    const {
        register,
        handleSubmit,
        formState: {
            errors,
            isSubmitting
        }
    } = useForm({
        resolver:
            zodResolver(updateProfileSchema),

        defaultValues: {
            fullName:
                user?.fullName || "",
            bio:
                user?.bio || "",
            website:
                user?.website || "",
            gender:
                user?.gender || ""
        }
    });

    const onSubmit = async (data) => {
        try {
            const response =
                await updateProfile(
                    data
                ).unwrap();

            dispatch(
                updateUser(
                    response.data.user
                )
            );

            toast.success(
                "Profile updated"
            );

            onClose();
        } catch (error) {
            toast.error(
                error?.message ||
                    "Update failed"
            );
        }
    };

    const handleAvatarChange =
        async (e) => {
            const file =
                e.target.files?.[0];

            if (!file) {
                return;
            }

            const formData =
                new FormData();

            formData.append(
                "avatar",
                file
            );

            setIsUploadingAvatar(
                true
            );

            try {
                const response =
                    await axiosInstance.put(
                        "/users/update-avatar",
                        formData,
                        {
                            headers: {
                                "Content-Type":
                                    "multipart/form-data"
                            }
                        }
                    );

                dispatch(
                    updateUser(
                        response.data
                            .data.user
                    )
                );

                toast.success(
                    "Avatar updated"
                );
            } catch (error) {
                toast.error(
                    error?.response
                        ?.data?.message ||
                        "Avatar update failed"
                );
            } finally {
                setIsUploadingAvatar(
                    false
                );

                if (
                    avatarInputRef.current
                ) {
                    avatarInputRef.current.value =
                        "";
                }
            }
        };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Profile"
            size="md"
            footer={
                <Button
                    type="submit"
                    form="edit-profile-form"
                    isLoading={
                        isSubmitting
                    }
                >
                    Save Changes
                </Button>
            }
        >
            <form
                id="edit-profile-form"
                className={
                    styles.editForm
                }
                onSubmit={handleSubmit(
                    onSubmit
                )}
            >
                <div
                    className={
                        styles.editAvatarSection
                    }
                >
                    <Avatar
                        src={
                            user?.avatar?.url
                        }
                        alt={
                            user?.username
                        }
                        size="lg"
                    />

                    <div>
                        <p
                            style={{
                                fontWeight:
                                    "var(--font-weight-semibold)"
                            }}
                        >
                            {
                                user?.username
                            }
                        </p>

                        <button
                            type="button"
                            className={
                                styles.changePhotoBtn
                            }
                            onClick={() =>
                                avatarInputRef.current?.click()
                            }
                            disabled={
                                isUploadingAvatar
                            }
                        >
                            {isUploadingAvatar
                                ? "Uploading..."
                                : "Change profile photo"}
                        </button>

                        <input
                            ref={
                                avatarInputRef
                            }
                            type="file"
                            accept="image/*"
                            className={
                                styles.hiddenInput
                            }
                            onChange={
                                handleAvatarChange
                            }
                        />
                    </div>
                </div>

                <Input
                    label="Full Name"
                    placeholder="Your full name"
                    error={
                        errors.fullName
                            ?.message
                    }
                    {...register(
                        "fullName"
                    )}
                />

                <Input
                    label="Bio"
                    placeholder="Write something about yourself..."
                    error={
                        errors.bio?.message
                    }
                    isTextarea
                    rows={3}
                    {...register("bio")}
                />

                <Input
                    label="Website"
                    placeholder="https://yourwebsite.com"
                    error={
                        errors.website
                            ?.message
                    }
                    {...register(
                        "website"
                    )}
                />

                <div>
                    <label
                        style={{
                            fontSize:
                                "var(--font-size-sm)",
                            fontWeight:
                                "var(--font-weight-medium)",
                            color:
                                "var(--color-text-primary)",
                            display: "block",
                            marginBottom:
                                "var(--space-1)"
                        }}
                    >
                        Gender
                    </label>

                    <select
                        style={{
                            width: "100%",
                            height: "40px",
                            padding:
                                "0 var(--space-3)",
                            background:
                                "var(--color-surface)",
                            border:
                                "1px solid var(--color-border)",
                            borderRadius:
                                "var(--radius-md)",
                            fontSize:
                                "var(--font-size-base)",
                            color:
                                "var(--color-text-primary)",
                            outline: "none",
                            cursor: "pointer"
                        }}
                        {...register(
                            "gender"
                        )}
                    >
                        <option value="">
                            Prefer not to say
                        </option>

                        <option value="male">
                            Male
                        </option>

                        <option value="female">
                            Female
                        </option>

                        <option value="prefer_not_to_say">
                            Prefer not to say
                        </option>
                    </select>
                </div>
            </form>
        </Modal>
    );
};

// ============================================================
// Posts Grid
// ============================================================

const PostsGrid = ({
    userId,
    isOwn
}) => {
    const navigate =
        useNavigate();

    const {
        data,
        isLoading
    } = useGetUserPostsQuery({
        userId,
        page: 1,
        limit: 30
    });

    const posts =
        data?.data?.posts || [];

    if (isLoading) {
        return (
            <div className={styles.grid}>
                {[...Array(9)].map(
                    (_, i) => (
                        <Skeleton
                            key={i}
                            width="100%"
                            height="0"
                            style={{
                                paddingBottom:
                                    "100%"
                            }}
                        />
                    )
                )}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className={styles.grid}>
                <div
                    className={
                        styles.emptyGrid
                    }
                >
                    <Camera
                        size={48}
                        strokeWidth={1}
                        className={
                            styles.emptyGridIcon
                        }
                    />

                    <h3
                        className={
                            styles.emptyGridTitle
                        }
                    >
                        No Posts Yet
                    </h3>

                    {isOwn && (
                        <p>
                            Share your first
                            photo
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.grid}>
            {posts.map((post) => (
                <div
                    key={post._id}
                    className={
                        styles.gridItem
                    }
                    onClick={() =>
                        navigate(
                            `/post/${post._id}`
                        )
                    }
                >
                    {post.media?.[0] && (
                        <img
                            src={
                                post.media[0]
                                    .url
                            }
                            alt={
                                post.caption ||
                                "Post"
                            }
                            className={
                                styles.gridImage
                            }
                            loading="lazy"
                        />
                    )}

                    {post.media?.length >
                        1 && (
                        <div
                            className={
                                styles.multiIndicator
                            }
                        >
                            <Copy
                                size={18}
                            />
                        </div>
                    )}

                    <div
                        className={
                            styles.gridOverlay
                        }
                    >
                        <div
                            className={
                                styles.gridStat
                            }
                        >
                            <Heart
                                size={20}
                                fill="white"
                            />

                            {post.likes
                                ?.length ||
                                0}
                        </div>

                        <div
                            className={
                                styles.gridStat
                            }
                        >
                            <MessageCircle
                                size={20}
                                fill="white"
                            />

                            {post.comments
                                ?.length ||
                                0}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ============================================================
// Saved Grid
// ============================================================

const SavedGrid = () => {
    const navigate =
        useNavigate();

    const {
        data,
        isLoading
    } = useGetBookmarksQuery({
        page: 1,
        limit: 30
    });

    const posts =
        data?.data?.posts || [];

    if (isLoading) {
        return (
            <div className={styles.grid}>
                {[...Array(6)].map(
                    (_, i) => (
                        <Skeleton
                            key={i}
                            width="100%"
                            height="200px"
                        />
                    )
                )}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className={styles.grid}>
                <div
                    className={
                        styles.emptyGrid
                    }
                >
                    <Bookmark
                        size={48}
                        strokeWidth={1}
                        className={
                            styles.emptyGridIcon
                        }
                    />

                    <h3
                        className={
                            styles.emptyGridTitle
                        }
                    >
                        No Saved Posts
                    </h3>

                    <p>
                        Save posts to see
                        them here
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.grid}>
            {posts.map((post) => (
                <div
                    key={post._id}
                    className={
                        styles.gridItem
                    }
                    onClick={() =>
                        navigate(
                            `/post/${post._id}`
                        )
                    }
                >
                    {post.media?.[0] && (
                        <img
                            src={
                                post.media[0]
                                    .url
                            }
                            alt="Saved post"
                            className={
                                styles.gridImage
                            }
                            loading="lazy"
                        />
                    )}

                    <div
                        className={
                            styles.gridOverlay
                        }
                    >
                        <div
                            className={
                                styles.gridStat
                            }
                        >
                            <Heart
                                size={20}
                                fill="white"
                            />

                            {post.likes
                                ?.length ||
                                0}
                        </div>

                        <div
                            className={
                                styles.gridStat
                            }
                        >
                            <MessageCircle
                                size={20}
                                fill="white"
                            />

                            {post.comments
                                ?.length ||
                                0}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ============================================================
// Profile Page
// ============================================================

const ProfilePage = () => {
    const { username } =
        useParams();

    const navigate =
        useNavigate();

    const [
        activeTab,
        setActiveTab
    ] = useState("posts");

    const [
        showFollowers,
        setShowFollowers
    ] = useState(false);

    const [
        showFollowing,
        setShowFollowing
    ] = useState(false);

    const [
        showEditProfile,
        setShowEditProfile
    ] = useState(false);

    const {
        data,
        isLoading,
        refetch
    } = useGetUserProfileQuery(
        username
    );

    const [
        followUser
    ] = useFollowUserMutation();

    const [
        unfollowUser
    ] = useUnfollowUserMutation();

    const profileData =
        data?.data;

    const profile =
        profileData?.user;

    const isOwnProfile =
        profileData?.isOwnProfile;

    const [
        isFollowing,
        setIsFollowing
    ] = useState(
        profileData?.isFollowing ||
            false
    );

    useEffect(() => {
        if (
            profileData?.isFollowing !==
            undefined
        ) {
            setIsFollowing(
                profileData.isFollowing
            );
        }
    }, [
        profileData?.isFollowing
    ]);

    const handleFollow =
        async () => {
            const previousState =
                isFollowing;

            setIsFollowing(
                !previousState
            );

            try {
                if (previousState) {
                    await unfollowUser(
                        profile._id
                    ).unwrap();
                } else {
                    await followUser(
                        profile._id
                    ).unwrap();
                }

                refetch();
            } catch (error) {
                setIsFollowing(
                    previousState
                );

                toast.error(
                    error?.message ||
                        "Action failed"
                );
            }
        };

    const handleMessage =
        () => {
            navigate("/chat", {
                state: {
                    userId:
                        profile._id
                }
            });
        };

    if (isLoading) {
        return (
            <div
                className={
                    styles.page
                }
            >
                <div
                    className={
                        styles.profileSkeleton
                    }
                >
                    <Skeleton
                        width="160px"
                        height="28px"
                    />

                    <div
                        className={
                            styles.headerSkeleton
                        }
                    >
                        <Skeleton
                            circle
                            width="150px"
                            height="150px"
                        />

                        <div
                            className={
                                styles.infoSkeleton
                            }
                        >
                            <Skeleton
                                width="200px"
                                height="24px"
                            />

                            <Skeleton
                                width="300px"
                                height="16px"
                            />

                            <Skeleton
                                width="250px"
                                height="16px"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div
                style={{
                    textAlign:
                        "center",
                    padding:
                        "var(--space-16)"
                }}
            >
                <h2>
                    User not found
                </h2>
            </div>
        );
    }

    const tabs = [
        {
            id: "posts",
            icon: (
                <Grid size={14} />
            ),
            label: "Posts"
        },

        ...(isOwnProfile
            ? [
                  {
                      id: "saved",
                      icon: (
                          <Bookmark
                              size={14}
                          />
                      ),
                      label: "Saved"
                  }
              ]
            : []),

        {
            id: "tagged",
            icon: (
                <Tag size={14} />
            ),
            label: "Tagged"
        }
    ];

    return (
        <div
            className={
                styles.page
            }
        >
            {/* ==================================================
                Username - Top
            ================================================== */}

            <div
                className={
                    styles.topUsername
                }
            >
                <h1
                    className={
                        styles.username
                    }
                >
                    @{profile.username}
                </h1>
            </div>

            {/* ==================================================
                Profile Header
            ================================================== */}

            <div
                className={
                    styles.header
                }
            >
                {/* Top section:
                    Image + Name + Stats
                */}

                <div
                    className={
                        styles.profileMain
                    }
                >
                    {/* Profile Image */}

                    <div
                        className={
                            styles.avatarSection
                        }
                    >
                        <div
                            className={
                                styles.avatarWrapper
                            }
                            onClick={
                                isOwnProfile
                                    ? () =>
                                          setShowEditProfile(
                                              true
                                          )
                                    : undefined
                            }
                        >
                            <Avatar
                                src={
                                    profile
                                        .avatar
                                        ?.url
                                }
                                alt={
                                    profile.username
                                }
                                size="xxl"
                            />

                            {isOwnProfile && (
                                <div
                                    className={
                                        styles.avatarEditOverlay
                                    }
                                >
                                    <Camera
                                        size={
                                            24
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Content */}

                    <div
                        className={
                            styles.profileDetails
                        }
                    >
                        {/* Full Name */}

                        <h2
                            className={
                                styles.fullName
                            }
                        >
                            {profile.fullName ||
                                profile.username}
                        </h2>

                        {/* Stats */}

                        <div
                            className={
                                styles.stats
                            }
                        >
                            <div
                                className={
                                    styles.stat
                                }
                            >
                                <span
                                    className={
                                        styles.statNumber
                                    }
                                >
                                    {
                                        profileData?.postCount ||
                                        0
                                    }
                                </span>

                                <span
                                    className={
                                        styles.statLabel
                                    }
                                >
                                    Posts
                                </span>
                            </div>

                            <div
                                className={
                                    styles.stat
                                }
                                onClick={() =>
                                    setShowFollowers(
                                        true
                                    )
                                }
                            >
                                <span
                                    className={
                                        styles.statNumber
                                    }
                                >
                                    {
                                        profile
                                            .followers
                                            ?.length ||
                                        0
                                    }
                                </span>

                                <span
                                    className={
                                        styles.statLabel
                                    }
                                >
                                    Followers
                                </span>
                            </div>

                            <div
                                className={
                                    styles.stat
                                }
                                onClick={() =>
                                    setShowFollowing(
                                        true
                                    )
                                }
                            >
                                <span
                                    className={
                                        styles.statNumber
                                    }
                                >
                                    {
                                        profile
                                            .following
                                            ?.length ||
                                        0
                                    }
                                </span>

                                <span
                                    className={
                                        styles.statLabel
                                    }
                                >
                                    Following
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==================================================
                    Bio - Below Image
                ================================================== */}

                <div
                    className={
                        styles.bioSection
                    }
                >
                    {profile.bio && (
                        <p
                            className={
                                styles.bioText
                            }
                        >
                            {profile.bio}
                        </p>
                    )}

                    {profile.website && (
                        <a
                            href={
                                profile.website
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className={
                                styles.website
                            }
                        >
                            <ExternalLink
                                size={14}
                            />

                            {profile.website.replace(
                                /^https?:\/\//,
                                ""
                            )}
                        </a>
                    )}
                </div>

                {/* ==================================================
                    Action Buttons
                ================================================== */}

                <div
                    className={
                        styles.actionButtons
                    }
                >
                    {isOwnProfile ? (
                        <Button
                            variant="secondary"
                            onClick={() =>
                                setShowEditProfile(
                                    true
                                )
                            }
                        >
                            Edit Profile
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant={
                                    isFollowing
                                        ? "secondary"
                                        : "primary"
                                }
                                onClick={
                                    handleFollow
                                }
                            >
                                {isFollowing
                                    ? "Following"
                                    : "Follow"}
                            </Button>

                            <Button
                                variant="secondary"
                                onClick={
                                    handleMessage
                                }
                            >
                                Message
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* ==================================================
                Tabs
            ================================================== */}

            <div
                className={
                    styles.tabs
                }
            >
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`${
                            styles.tab
                        } ${
                            activeTab ===
                            tab.id
                                ? styles.activeTab
                                : ""
                        }`}
                        onClick={() =>
                            setActiveTab(
                                tab.id
                            )
                        }
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ==================================================
                Content
            ================================================== */}

            {activeTab ===
                "posts" && (
                <PostsGrid
                    userId={
                        profile._id
                    }
                    isOwn={
                        isOwnProfile
                    }
                />
            )}

            {activeTab ===
                "saved" &&
                isOwnProfile && (
                    <SavedGrid />
                )}

            {activeTab ===
                "tagged" && (
                <div
                    className={
                        styles.grid
                    }
                >
                    <div
                        className={
                            styles.emptyGrid
                        }
                    >
                        <Tag
                            size={48}
                            strokeWidth={1}
                            className={
                                styles.emptyGridIcon
                            }
                        />

                        <h3
                            className={
                                styles.emptyGridTitle
                            }
                        >
                            No Tagged Posts
                        </h3>
                    </div>
                </div>
            )}

            {/* ==================================================
                Followers Modal
            ================================================== */}

            <FollowListModal
                isOpen={
                    showFollowers
                }
                onClose={() =>
                    setShowFollowers(
                        false
                    )
                }
                title="Followers"
                userId={
                    profile._id
                }
                type="followers"
            />

            {/* ==================================================
                Following Modal
            ================================================== */}

            <FollowListModal
                isOpen={
                    showFollowing
                }
                onClose={() =>
                    setShowFollowing(
                        false
                    )
                }
                title="Following"
                userId={
                    profile._id
                }
                type="following"
            />

            {/* ==================================================
                Edit Profile Modal
            ================================================== */}

            {isOwnProfile && (
                <EditProfileModal
                    isOpen={
                        showEditProfile
                    }
                    onClose={() =>
                        setShowEditProfile(
                            false
                        )
                    }
                    user={
                        profile
                    }
                />
            )}
        </div>
    );
};

export default ProfilePage;
