import { useState } from "react";
import { Plus } from "lucide-react";
import { Avatar, Skeleton } from "@components/ui/index.js";
import { useGetStoryFeedQuery } from "@features/stories/storiesAPI.js";
import useAuth from "@hooks/useAuth.js";
import StoryViewer from "../StoryViewer/StoryViewer.jsx";
import CreateStoryModal from "../CreateStoryModal/CreateStoryModal.jsx";
import styles from "./StoryBar.module.css";

const StoryBar = () => {
  const { user } = useAuth();
  const { data, isLoading } = useGetStoryFeedQuery();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);

  const feed = data?.data?.feed || [];

  // Find current user's story group
  const myGroup = feed.find((g) => g.user._id === user?._id);

  const handleYourStoryClick = () => {
    if (myGroup && myGroup.stories.length > 0) {
      // Has stories — view them
      setSelectedGroup(myGroup);
    } else {
      // No stories — open create modal
      setIsCreateStoryOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.skeleton}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.skeletonItem}>
              <Skeleton circle width="56px" height="56px" />
              <Skeleton width="48px" height="10px" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.scrollContainer}>
          {/* Your Story */}
          <div
            className={`${styles.storyItem} ${styles.yourStory}`}
            onClick={handleYourStoryClick}
          >
            <div className={styles.avatarWrapper}>
              <Avatar
                src={user?.avatar?.url}
                alt={user?.username}
                size="lg"
                hasStory={myGroup?.stories?.length > 0}
              />
              <div className={styles.addStory}>
                <Plus size={12} strokeWidth={3} />
              </div>
            </div>
            <span className={styles.username}>Your story</span>
          </div>

          {/* Other Users Stories */}
          {feed
            .filter((group) => group.user._id !== user?._id)
            .map((group) => (
              <div
                key={group.user._id}
                className={styles.storyItem}
                onClick={() => setSelectedGroup(group)}
              >
                <Avatar
                  src={group.user.avatar?.url}
                  alt={group.user.username}
                  size="lg"
                  hasStory={group.stories.length > 0}
                  storyViewed={!group.hasUnviewed}
                />
                <span className={styles.username}>{group.user.username}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Story Viewer */}
      {selectedGroup && (
        <StoryViewer
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
        />
      )}

      {/* Create Story Modal */}
      <CreateStoryModal
        isOpen={isCreateStoryOpen}
        onClose={() => setIsCreateStoryOpen(false)}
      />
    </>
  );
};

export default StoryBar;
