import { useState, useRef } from "react";
import { ImagePlus } from "lucide-react";
import { Modal, Button, Spinner } from "@components/ui/index.js";
import { apiSlice } from "@services/apiSlice.js";
import { useDispatch } from "react-redux";
import axiosInstance from "@services/axiosInstance.js";
import toast from "react-hot-toast";
import styles from "./CreateStoryModal.module.css";

const CreateStoryModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mediaType, setMediaType] = useState("image");
  const [text, setText] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setMediaType(selected.type.startsWith("video") ? "video" : "image");
  };

  const handleSubmit = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("media", file);
    if (text.trim()) formData.append("text", text.trim());

    setIsUploading(true);
    try {
      await axiosInstance.post("/stories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch(apiSlice.util.invalidateTags(["Story"]));
      toast.success("Story shared!");
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to share story");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setMediaType("image");
    setText("");
    setIsUploading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add to Story" size="sm">
      <div className={styles.container}>
        {!preview ? (
          <>
            {/* Upload area */}
            <div
              className={styles.uploadArea}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus
                size={40}
                strokeWidth={1}
                style={{ color: "var(--color-text-tertiary)" }}
              />
              <p className={styles.uploadText}>
                Click to select a photo or video
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className={styles.hiddenInput}
              onChange={handleFileChange}
            />
          </>
        ) : (
          <>
            {/* Preview */}
            <div className={styles.preview}>
              {mediaType === "video" ? (
                <video
                  src={preview}
                  className={styles.previewMedia}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={preview}
                  alt="Story preview"
                  className={styles.previewMedia}
                />
              )}
            </div>

            {/* Text overlay input */}
            <input
              type="text"
              className={styles.textInput}
              placeholder="Add text to your story..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={200}
            />

            {/* Actions */}
            <div className={styles.actions}>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  URL.revokeObjectURL(preview);
                  setFile(null);
                  setPreview(null);
                }}
              >
                Change
              </Button>
              <Button fullWidth isLoading={isUploading} onClick={handleSubmit}>
                Share Story
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default CreateStoryModal;
