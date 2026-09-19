import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Search,
  Send,
  Image,
  MessageCircle,
  CheckCheck,
  ArrowLeft,
} from "lucide-react";
import {
  Avatar,
  Spinner,
  Dropdown,
  DropdownItem,
} from "@components/ui/index.js";
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useGetOrCreateConversationMutation,
  useMarkAsSeenMutation,
  useDeleteMessageMutation,
} from "@features/chat/chatAPI.js";
import {
  setActiveConversation,
  addMessage,
  setMessages,
  setTyping,
  selectMessages,
  selectTypingUsers,
} from "@features/chat/chatSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "@services/socket.js";
import useAuth from "@hooks/useAuth.js";
import { timeAgo, formatTime } from "@utils/formatDate.js";
import axiosInstance from "@services/axiosInstance.js";
import toast from "react-hot-toast";
import styles from "./ChatPage.module.css";

// ============================================================
// Message Bubble
// ============================================================

const MessageBubble = ({ message, isSent, showAvatar, onDelete }) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const isSeen = message.seenBy?.length > 1;

  return (
    <div
      className={`${styles.messageBubble} ${
        isSent ? styles.sent : styles.received
      }`}
    >
      {/* Avatar for received messages */}
      {!isSent && showAvatar ? (
        <Avatar
          src={message.sender?.avatar?.url}
          alt={message.sender?.username}
          size="xs"
        />
      ) : !isSent ? (
        <div style={{ width: 24 }} />
      ) : null}

      <div className={styles.bubbleContent}>
        {/* Media */}
        {message.media?.url && (
          <div className={styles.bubbleMedia}>
            <img src={message.media.url} alt="Media" loading="lazy" />
          </div>
        )}

        {/* Text */}
        {(message.text || message.isDeleted) && (
          <div
            className={`${styles.bubble} ${
              message.isDeleted ? styles.deleted : ""
            }`}
            onDoubleClick={() => isSent && setIsMoreOpen(true)}
          >
            {message.isDeleted ? "This message was deleted" : message.text}
          </div>
        )}

        {/* Meta */}
        <div className={styles.bubbleMeta}>
          <span className={styles.bubbleTime}>
            {formatTime(message.createdAt)}
          </span>
          {isSent && isSeen && (
            <CheckCheck size={14} className={styles.seenIcon} />
          )}
        </div>
      </div>

      {/* Delete option on double click */}
      {isSent && isMoreOpen && (
        <Dropdown
          isOpen={isMoreOpen}
          onClose={() => setIsMoreOpen(false)}
          placement="topRight"
          trigger={<span />}
        >
          <DropdownItem
            danger
            onClick={() => {
              onDelete(message._id);
              setIsMoreOpen(false);
            }}
          >
            Delete Message
          </DropdownItem>
        </Dropdown>
      )}
    </div>
  );
};

// ============================================================
// Conversation Item
// ============================================================

const ConversationItem = ({
  conversation,
  currentUserId,
  isActive,
  onClick,
}) => {
  const otherUser = conversation.participants?.find(
    (p) => p._id !== currentUserId,
  );
  const lastMsg = conversation.lastMessage;
  const unreadCount = conversation.unreadCount || 0;

  return (
    <div
      className={`${styles.convItem} ${isActive ? styles.active : ""}`}
      onClick={onClick}
    >
      <Avatar
        src={otherUser?.avatar?.url}
        alt={otherUser?.username}
        size="md"
      />

      <div className={styles.convInfo}>
        <div className={styles.convTopRow}>
          <span className={styles.convName}>
            {otherUser?.fullName || otherUser?.username}
          </span>
          {lastMsg?.createdAt && (
            <span className={styles.convTime}>
              {timeAgo(lastMsg.createdAt)}
            </span>
          )}
        </div>

        <p
          className={`${styles.convLastMsg} ${
            unreadCount > 0 ? styles.unread : ""
          }`}
        >
          {lastMsg?.isDeleted
            ? "Message deleted"
            : lastMsg?.text || "Start a conversation"}
        </p>
      </div>

      {unreadCount > 0 && (
        <div className={styles.unreadBadge}>
          {unreadCount > 99 ? "99+" : unreadCount}
        </div>
      )}
    </div>
  );
};

// ============================================================
// Chat Window
// ============================================================

const ChatWindow = ({ conversationId, currentUserId }) => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Redux state — real-time messages
  const reduxMessages = useSelector(selectMessages(conversationId));
  const typingUsers = useSelector(selectTypingUsers(conversationId));

  // API — initial message load
  const { data: messagesData, isLoading } = useGetMessagesQuery(
    { conversationId, page: 1, limit: 50 },
    { skip: !conversationId },
  );

  const [markAsSeen] = useMarkAsSeenMutation();
  const [deleteMessage] = useDeleteMessageMutation();

  // ---- Sync API messages → Redux ----
  useEffect(() => {
    if (messagesData?.data?.messages) {
      dispatch(
        setMessages({
          conversationId,
          messages: messagesData.data.messages,
        }),
      );
    }
  }, [messagesData, conversationId, dispatch]);

  // ---- Join conversation socket room ----
  useEffect(() => {
    if (!conversationId) return;

    const joinRoom = () => {
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit("conversations:join", [conversationId]);
        markAsSeen(conversationId);
      }
    };

    // Try immediately
    joinRoom();

    // Also retry after short delay in case socket was connecting
    const timer = setTimeout(joinRoom, 500);

    return () => clearTimeout(timer);
  }, [conversationId]);

  // ---- Scroll to bottom on new messages ----
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [reduxMessages]);

  // ---- Send Message ----
  const handleSend = async () => {
    if (!text.trim() || isSending) return;

    const socket = getSocket();
    const tempId = `temp_${Date.now()}`;

    // Optimistic message — show immediately
    const optimisticMessage = {
      _id: tempId,
      conversation: conversationId,
      sender: { _id: currentUserId },
      text: text.trim(),
      seenBy: [currentUserId],
      createdAt: new Date().toISOString(),
      isPending: true,
    };

    dispatch(addMessage({ conversationId, message: optimisticMessage }));

    // Clear input and reset height
    setText("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    // Stop typing indicator
    if (socket) socket.emit("typing:stop", { conversationId });
    clearTimeout(typingTimeoutRef.current);

    // Send via socket (real-time) or REST (fallback)
    if (socket?.connected) {
      socket.emit("message:send", {
        conversationId,
        text: text.trim(),
        tempId,
      });
    } else {
      setIsSending(true);
      try {
        await axiosInstance.post(
          `/chat/conversations/${conversationId}/messages`,
          { text: text.trim() },
        );
      } catch {
        toast.error("Failed to send message");
      } finally {
        setIsSending(false);
      }
    }
  };

  // ---- Typing indicator with auto-resize ----
  const handleTyping = (e) => {
    setText(e.target.value);

    // Auto resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;

    // Socket typing indicator
    const socket = getSocket();
    if (!socket) return;

    socket.emit("typing:start", { conversationId });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", { conversationId });
    }, 2000);
  };

  // ---- Send on Enter (Shift+Enter for new line) ----
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ---- Send Image ----
  const handleImageSend = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("media", file);

    setIsSending(true);
    try {
      const response = await axiosInstance.post(
        `/chat/conversations/${conversationId}/messages`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      dispatch(
        addMessage({
          conversationId,
          message: response.data.data.message,
        }),
      );
    } catch {
      toast.error("Failed to send image");
    } finally {
      setIsSending(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ---- Delete Message ----
  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId).unwrap();
    } catch {
      toast.error("Failed to delete message");
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      {/* ---- Messages Area ---- */}
      <div className={styles.messagesArea}>
        {reduxMessages.map((message, index) => {
          const isSent =
            message.sender?._id === currentUserId ||
            message.sender === currentUserId;

          const prevMessage = reduxMessages[index - 1];

          // Show avatar only when sender changes
          const showAvatar =
            !isSent &&
            (!prevMessage || prevMessage.sender?._id !== message.sender?._id);

          // Show date separator when day changes
          const showDate =
            !prevMessage ||
            new Date(message.createdAt).toDateString() !==
              new Date(prevMessage.createdAt).toDateString();

          return (
            <div key={message._id}>
              {showDate && (
                <div className={styles.dateSeparator}>
                  <div className={styles.dateSeparatorLine} />
                  <span>
                    {new Date(message.createdAt).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <div className={styles.dateSeparatorLine} />
                </div>
              )}
              <MessageBubble
                message={message}
                isSent={isSent}
                showAvatar={showAvatar}
                onDelete={handleDeleteMessage}
              />
            </div>
          );
        })}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className={styles.typingIndicator}>
            <div className={styles.typingDots}>
              <div className={styles.typingDot} />
              <div className={styles.typingDot} />
              <div className={styles.typingDot} />
            </div>
            <span>typing...</span>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* ---- Input Area ---- */}
      <div className={styles.inputArea}>
        <div className={styles.inputWrapper}>
          {/* Image upload */}
          <button
            className={styles.inputAction}
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            aria-label="Send image"
          >
            <Image size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            style={{ display: "none" }}
            onChange={handleImageSend}
          />

          {/* Text input — auto-resizing textarea */}
          <textarea
            ref={inputRef}
            className={styles.messageInput}
            placeholder="Message..."
            value={text}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            rows={1}
          />
        </div>

        {/* Send Button */}
        <button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={!text.trim() || isSending}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </>
  );
};

// ============================================================
// Chat Page
// ============================================================

const ChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeConvId, setActiveConvId] = useState(null);
  const [activeConv, setActiveConv] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [mobileView, setMobileView] = useState("list");

  // ---- Ref guard — prevent double calls ----
  const hasInitialized = useRef(false);

  const { data: convsData, isLoading } = useGetConversationsQuery();
  const [getOrCreate] = useGetOrCreateConversationMutation();

  const conversations = convsData?.data?.conversations || [];

  // Filter conversations by search query
  const filteredConvs = conversations.filter((conv) => {
    const other = conv.participants?.find((p) => p._id !== user?._id);
    const name = (other?.fullName || other?.username || "").toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  // ---- Handle navigation state ----
  // Opened from Profile page → Message button
  useEffect(() => {
    const targetUserId = location.state?.userId;

    if (targetUserId && !hasInitialized.current) {
      hasInitialized.current = true;
      handleStartConversation(targetUserId);
      navigate("/chat", { replace: true, state: {} });
    }
  }, [location.state]);

  // ---- Start or open conversation ----
  const handleStartConversation = async (targetUserId) => {
    // Prevent duplicate API calls
    if (isStarting) return;
    setIsStarting(true);

    try {
      const response = await getOrCreate(targetUserId).unwrap();
      const conv = response.data.conversation;
      handleSelectConversation(conv);
    } catch {
      toast.error("Failed to open conversation");
    } finally {
      setIsStarting(false);
      hasInitialized.current = false;
    }
  };

  const handleSelectConversation = (conv) => {
    setActiveConvId(conv._id);
    setActiveConv(conv);
    dispatch(setActiveConversation(conv._id));
    setMobileView("chat");
  };

  const getOtherUser = (conv) => {
    return conv?.participants?.find((p) => p._id !== user?._id);
  };

  return (
    <div className={styles.page}>
      {/* ============================================================
            Left Panel — Conversation List
        ============================================================ */}
      <div
        className={`${styles.leftPanel} ${
          mobileView === "list" ? styles.mobileVisible : ""
        }`}
      >
        <div className={styles.leftHeader}>
          <h2 className={styles.leftTitle}>Messages</h2>

          {/* Search */}
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>
              <Search size={16} />
            </span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className={styles.convList}>
          {isLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "var(--space-8)",
              }}
            >
              <Spinner size="md" />
            </div>
          ) : filteredConvs.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "var(--space-8)",
                color: "var(--color-text-secondary)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              {searchQuery ? "No conversations found" : "No messages yet"}
            </div>
          ) : (
            filteredConvs.map((conv) => (
              <ConversationItem
                key={conv._id}
                conversation={conv}
                currentUserId={user?._id}
                isActive={activeConvId === conv._id}
                onClick={() => handleSelectConversation(conv)}
              />
            ))
          )}
        </div>
      </div>

      {/* ============================================================
            Right Panel — Chat Window
        ============================================================ */}
      <div
        className={`${styles.rightPanel} ${
          mobileView === "chat" ? styles.mobileVisible : ""
        }`}
      >
        {!activeConvId ? (
          <div className={styles.emptyChat}>
            <MessageCircle
              size={64}
              strokeWidth={1}
              className={styles.emptyChatIcon}
            />
            <h3 className={styles.emptyChatTitle}>Your Messages</h3>
            <p style={{ color: "var(--color-text-secondary)" }}>
              Select a conversation to start messaging
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className={styles.chatHeader}>
              {/* Mobile back button */}
              <button
                className={styles.mobileBackBtn}
                onClick={() => setMobileView("list")}
                aria-label="Back to messages"
              >
                <ArrowLeft size={22} />
              </button>

              <Link
                to={`/profile/${getOtherUser(activeConv)?.username}`}
                className={styles.chatHeaderLeft}
              >
                <Avatar
                  src={getOtherUser(activeConv)?.avatar?.url}
                  alt={getOtherUser(activeConv)?.username}
                  size="md"
                />
                <div className={styles.chatHeaderInfo}>
                  <span className={styles.chatHeaderName}>
                    {getOtherUser(activeConv)?.fullName ||
                      getOtherUser(activeConv)?.username}
                  </span>
                  <span className={styles.chatHeaderStatus}>Active now</span>
                </div>
              </Link>
            </div>

            {/* Chat Window */}
            <ChatWindow
              conversationId={activeConvId}
              currentUserId={user?._id}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
