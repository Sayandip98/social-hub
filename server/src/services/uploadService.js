import cloudinary from "../config/cloudinary.js";
import ApiError from "../utils/ApiError.js";

// ---- Upload ----
const uploadToCloudinary = (fileBuffer, mimetype, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const base64File = `data:${mimetype};base64,${fileBuffer.toString("base64")}`;
    const resourceType = mimetype.startsWith("video") ? "video" : "image";

    cloudinary.uploader.upload(
      base64File,
      {
        folder,
        resource_type: resourceType,
        // Add these two lines
        use_filename: true,
        unique_filename: true,
        ...options,
      },
      (error, result) => {
        if (error) {
          // Log full error for debugging
          console.error("Cloudinary full error:", error);
          reject(
            new ApiError(500, `Cloudinary upload failed: ${error.message}`),
          );
        } else {
          resolve({
            public_id: result.public_id,
            url: result.secure_url,
          });
        }
      },
    );
  });
};

// ---- Delete ----

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    if (!publicId) return null;

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    return result;
  } catch (error) {
    console.error(`Cloudinary deletion failed for ${publicId}:`, error.message);
    return null;
  }
};

// ---- Specific Upload ----

// ---- Avatar ----
const uploadAvatar = async (file) => {
  if (!file) throw new ApiError(400, "No file provided");

  return await uploadToCloudinary(
    file.buffer,
    file.mimetype,
    "socialhub/avatars",
    {
      transformation: [
        {
          width: 500,
          height: 500,
          crop: "fill",
          gravity: "face",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    },
  );
};

// ---- Cover Image ----
const uploadCoverImage = async (file) => {
  if (!file) throw new ApiError(400, "No file provided");

  return await uploadToCloudinary(
    file.buffer,
    file.mimetype,
    "socialhub/covers",
    {
      transformation: [
        {
          width: 1500,
          height: 500,
          crop: "fill",
          gravity: "auto",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    },
  );
};

// Post Media — images and videos
const uploadPostMedia = async (file) => {
  if (!file) throw new ApiError(400, "No file provided");

  const isVideo = file.mimetype.startsWith("video");

  return await uploadToCloudinary(
    file.buffer,
    file.mimetype,
    "socialhub/posts",
    {
      transformation: isVideo
        ? [{ quality: "auto" }]
        : [{ quality: "auto", fetch_format: "auto" }],
    },
  );
};

// Multiple Post Media
const uploadMultiplePostMedia = async (files) => {
  if (!files || files.length === 0) {
    throw new ApiError(400, "No files provided");
  }

  const uploadPromises = files.map((file) => uploadPostMedia(file));
  const results = await Promise.all(uploadPromises);

  return results;
};

// Story Media — images and videos
const uploadStoryMedia = async (file) => {
  if (!file) throw new ApiError(400, "No file provided");

  return await uploadToCloudinary(
    file.buffer,
    file.mimetype,
    "socialhub/stories",
    {
      transformation: [
        {
          width: 1080,
          height: 1920,
          crop: "fill",
          gravity: "auto",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    },
  );
};

// Message Media — images and videos in chat
const uploadMessageMedia = async (file) => {
  if (!file) throw new ApiError(400, "No file provided");

  return await uploadToCloudinary(
    file.buffer,
    file.mimetype,
    "socialhub/messages",
    {
      transformation: [
        {
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    },
  );
};

export {
  uploadAvatar,
  uploadCoverImage,
  uploadPostMedia,
  uploadMultiplePostMedia,
  uploadStoryMedia,
  uploadMessageMedia,
  deleteFromCloudinary,
};
