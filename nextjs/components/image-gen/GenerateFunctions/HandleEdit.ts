import { ImageModel } from "@/lib/imageprops";
import axios from "axios";
import toast from "react-hot-toast";

interface EditImageProps {
  prompt: string;
  format: string;
  model: { model: string };
  maskFile: File | null;
  selectedImage: string | null;
  images: ImageModel[];
  seedPercentage: number;
  userId: string | null;
  style: string;
  negativePrompt: string;
  growMask: number;
  setImages: React.Dispatch<React.SetStateAction<ImageModel[]>>;
  setImage: (image: ImageModel) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsViewerOpen: (isOpen: boolean) => void;
  setImageGallery: (isOpen: boolean) => void;
}

export const editImageGenerator = async (props: EditImageProps) => {
  const {
    prompt,
    format,
    model,
    maskFile,
    selectedImage,
    seedPercentage,
    style,
    negativePrompt,
    growMask,      
    userId,
    setImages,
    setImage,
    setLoading,
    setError,
    setIsViewerOpen,
    setImageGallery,
  } = props;

  // ✅ Validate required fields
  if (!selectedImage) {
    setError("Please select an image to edit.");
    toast.error("Please select an image to edit.");
    return;
  }
  if (!prompt.trim()) {
    setError("Prompt cannot be empty.");
    setLoading(false);
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("format", format);
    formData.append("model", model.model);
    formData.append("style", style);
    formData.append("negative_prompt", negativePrompt);
    formData.append("user_id", userId || "default_user");
    formData.append("grow_mask", growMask.toString());
    formData.append(
      "seed",
      Math.round((1 - seedPercentage / 100) * 4294967294).toString()
    );

    // ✅ Convert selected image URL to Blob & append
    const response = await fetch(selectedImage);
    const blob = await response.blob();
    formData.append(
      "init_image",
      new File([blob], "image.png", { type: blob.type })
    );

    // ✅ Append mask file if available
    if (maskFile) {
      formData.append("mask", maskFile);
    }

    // ✅ Send request to edit endpoint
    const apiResponse = await axios.post<{ image: ImageModel }>(
      `${process.env.NEXT_PUBLIC_API_IMAGE_GEN}/image/edit`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data", Accept: "image/*" },
      }
    );

    if (apiResponse.data.image) {
      const newImage: ImageModel = apiResponse.data.image;
      setImage(newImage);
      setIsViewerOpen(true);
      setImages((prevImages) => {
        if (!prevImages) return [newImage]; // Handle undefined state
        return [...prevImages, newImage];
      });

      // ✅ Refresh Gallery
      setImageGallery(false);
      setTimeout(() => setImageGallery(true), 100);
    }
  } catch (error) {
    setError(`An error occurred while editing the image. ${error}`);
    console.error("Edit Image Error:", error);
    toast.error("Failed to edit image. Please try again.");
  } finally {
    setLoading(false);
  }
};
