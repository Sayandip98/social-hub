import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { X, ImagePlus, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Avatar, Modal, Button, Spinner } from "@components/ui/index.js";
import useAuth from "@hooks/useAuth.js";
import axiosInstance from "@services/axiosInstance.js";
import { apiSlice } from "@services/apiSlice.js";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import styles from "./CreatePostModal.module.css";

const MAX_FILES = 10;
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

const CreatePostModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [step, setStep] = useState("upload"); // upload | preview | uploading
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [progress, setProgress] = useState(0);

  // ---- Dropzone ----
  const onDrop = useCallback((accepted) => {
    if (accepted.length === 0) return;

    const limited = accepted.slice(0, MAX_FILES);
    setFiles(limited);

    // Create object URLs for preview
    const urls = limited.map((f) => ({
      url: URL.createObjectURL(f),
      mediaType: f.type.startsWith("video") ? "video" : "image",
      name: f.name,
    }));
    setPreviews(urls);
    setActiveIdx(0);
    setStep("preview");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"],
      "video/*": [".mp4", ".mov", ".avi"],
    },
    maxFiles: MAX_FILES,
    maxSize: MAX_SIZE,
    onDropRejected: (rejected) => {
      const error = rejected[0]?.errors[0];
      if (error?.code === "file-too-large") {
        toast.error("File too large. Max 50MB");
      } else if (error?.code === "too-many-files") {
        toast.error(`Max ${MAX_FILES} files allowed`);
      } else {
        toast.error("Invalid file type");
      }
    },
  });

  // ---- Remove a file ----
  const handleRemoveFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    // Revoke old URL
    URL.revokeObjectURL(previews[index].url);

    setFiles(newFiles);
    setPreviews(newPreviews);

    if (newFiles.length === 0) {
      setStep("upload");
    } else {
      setActiveIdx(Math.min(activeIdx, newFiles.length - 1));
    }
  };

  // ---- Submit Post ----
  const handleSubmit = async () => {
    if (files.length === 0) return;

    setStep("uploading");
    setProgress(10);

    const formData = new FormData();
    files.forEach((f) => formData.append("media", f));

    if (caption.trim()) formData.append("caption", caption.trim());
    if (location.trim()) formData.append("location", location.trim());

    try {
      setProgress(30);

      await axiosInstance.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 70) / e.total);
          setProgress(30 + pct);
        },
      });

      setProgress(100);

      // Invalidate feed cache so new post appears
      dispatch(apiSlice.util.invalidateTags(["Post"]));

      toast.success("Post shared!");
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to share post");
      setStep("preview");
    }
  };

  // ---- Close & Reset ----
  const handleClose = () => {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setStep("upload");
    setFiles([]);
    setPreviews([]);
    setActiveIdx(0);
    setCaption("");
    setLocation("");
    setProgress(0);
    onClose();
  };

  // ---- Modal header actions ----
  const getModalTitle = () => {
    if (step === "upload") return "Create New Post";
    if (step === "uploading") return "Sharing...";
    return "Create New Post";
  };

  const getModalFooter = () => {
    if (step !== "preview") return null;
    return (
      <Button onClick={handleSubmit} isLoading={false}>
        Share
      </Button>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={getModalTitle()}
      size="xl"
      noPadding
      footer={getModalFooter()}
      closeOnOverlay={step !== "uploading"}
    >
      {/* ---- Step 1: Upload ---- */}
      {step === "upload" && (
        <div className={styles.stepUpload}>
          <div
            {...getRootProps()}
            className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ""}`}
          >
            <input {...getInputProps()} />
            <ImagePlus
              size={56}
              strokeWidth={1}
              className={styles.dropzoneIcon}
            />
            <p className={styles.dropzoneText}>
              {isDragActive ? "Drop files here" : "Drag photos and videos here"}
            </p>
            <p className={styles.dropzoneSubtext}>
              JPG, PNG, MP4, MOV up to 50MB · Max 10 files
            </p>
            <Button
              variant="primary"
              size="md"
              className={styles.uploadBtn}
              onClick={(e) => e.stopPropagation()}
            >
              Select from computer
            </Button>
          </div>
        </div>
      )}

      {/* ---- Step 2: Preview + Details ---- */}
      {step === "preview" && previews.length > 0 && (
        <div className={styles.stepPreview}>
          {/* Media Preview */}
          <div className={styles.previewMedia}>
            {previews[activeIdx]?.mediaType === "video" ? (
              <video
                src={previews[activeIdx].url}
                className={styles.previewImage}
                controls
                playsInline
              />
            ) : (
              <img
                src={previews[activeIdx]?.url}
                alt="Preview"
                className={styles.previewImage}
              />
            )}

            {/* Carousel dots */}
            {previews.length > 1 && (
              <>
                <div className={styles.mediaDots}>
                  {previews.map((_, i) => (
                    <div
                      key={i}
                      className={`${styles.mediaDot} ${i === activeIdx ? styles.active : ""}`}
                      onClick={() => setActiveIdx(i)}
                    />
                  ))}
                </div>

                {/* Nav arrows */}
                {activeIdx > 0 && (
                  <button
                    style={{
                      position: "absolute",
                      left: "var(--space-3)",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(255,255,255,0.9)",
                      border: "none",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                    onClick={() => setActiveIdx((p) => p - 1)}
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}
                {activeIdx < previews.length - 1 && (
                  <button
                    style={{
                      position: "absolute",
                      right: "var(--space-3)",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(255,255,255,0.9)",
                      border: "none",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                    onClick={() => setActiveIdx((p) => p + 1)}
                  >
                    <ChevronRight size={18} />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Form Side */}
          <div className={styles.formSide}>
            {/* Author row */}
            <div className={styles.authorRow}>
              <Avatar src={user?.avatar?.url} alt={user?.username} size="sm" />
              <span className={styles.authorName}>{user?.username}</span>
            </div>

            {/* Caption */}
            <textarea
              className={styles.captionInput}
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={2200}
              autoFocus
            />
            <p className={styles.charCount}>{caption.length}/2,200</p>

            <div className={styles.divider} />

            {/* Location */}
            <div className={styles.formField}>
              <span className={styles.fieldLabel}>Location</span>
              <input
                type="text"
                className={styles.fieldInput}
                placeholder="Add location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={100}
              />
              <MapPin
                size={18}
                style={{ color: "var(--color-text-tertiary)" }}
              />
            </div>

            <div className={styles.divider} />

            {/* Media thumbnails strip */}
            {previews.length > 1 && (
              <div className={styles.mediaStrip}>
                {previews.map((preview, i) => (
                  <div
                    key={i}
                    className={`${styles.mediaThumbnail} ${i === activeIdx ? styles.selected : ""}`}
                    onClick={() => setActiveIdx(i)}
                  >
                    <img src={preview.url} alt={`Media ${i + 1}`} />
                    <button
                      className={styles.removeThumbnail}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(i);
                      }}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---- Step 3: Uploading ---- */}
      {step === "uploading" && (
        <div className={styles.uploadProgress}>
          <Spinner size="lg" />
          <p className={styles.progressTitle}>Sharing your post...</p>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            {progress}%
          </p>
        </div>
      )}
    </Modal>
  );
};

export default CreatePostModal;
