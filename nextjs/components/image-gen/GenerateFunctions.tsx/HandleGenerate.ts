import { AspectRatioProps, ImageModel, ModelProps } from "@/lib/imageprops";
import axios from "axios";

interface GenerateImageProps {
  prompt: string;
  format: string;
  style: string;
  model: ModelProps;
  negativePrompt: string;
  seedPercentage: number;
  aspectRatio: AspectRatioProps;
  userId: string | null;
  selectedImage: string | null;
  strength: number;
  version: string;
  images: ImageModel[];
  setImages: React.Dispatch<React.SetStateAction<ImageModel[]>>;
  setImage: (image: ImageModel) => void;
  setIsViewerOpen: (isViewerOpen: boolean) => void;
  setImageGallery: (imageGallery: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedImage: (selectedImage: string | null) => void;
  setBrowserFiles: (browserFiles: File[]) => void;
  setUploadingImage: (uploadingImage: boolean) => void;

}

export const generateImage = async (
  props: GenerateImageProps,

) => {
  const {
    setImage,
    setIsViewerOpen,
    setImageGallery,
    setImages,
    setLoading,
    prompt,
    format,
    style,
    model,
    setError,
    setBrowserFiles,
    setUploadingImage,
    setSelectedImage,
    negativePrompt,
    seedPercentage,
    aspectRatio,
    userId,
    selectedImage,
    strength,
    version,
  } = props;

  setLoading(true);
  setError(null);
  if (!prompt.trim()) {
    setError("Prompt cannot be empty.");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("style", style || "digital-art");
    formData.append("output_format", format);
    formData.append("model", model.model);
    formData.append("negative_prompt", negativePrompt);
    formData.append("aspect_ratio", aspectRatio.ratio);
    formData.append("seed", Math.round((1 - seedPercentage / 100) * 4294967294).toString());
    formData.append("user_id", userId ?? "anonymous");

    if (model.model === "sd3") {
      formData.append("version", version);
    }

    if (selectedImage) {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      formData.append("init_imgage", new File([blob], "selected-image.png", { type: blob.type }));
      formData.append("strength", strength.toFixed(1));
    }
    const response = await axios.post<{ image: ImageModel }>(
      `${process.env.NEXT_PUBLIC_API_IMAGE_GEN}/image/generate`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data", Accept: "image/*" },
      }
    );

    if (response.data.image) {
    const newImage: ImageModel = response.data.image;
      setImage(newImage);
      setIsViewerOpen(true);
      setImages((prevImages) => {
        if (!Array.isArray(prevImages)) return [newImage]; // Ensure prevImages is always an array
        return [...prevImages, newImage];
      });      
      // ✅ Refresh Gallery
      setImageGallery(false);
      setTimeout(() => setImageGallery(true), 100);
    }
  } catch (err) {
    setError("Failed to generate image. Please try again.");
    console.error(err);
  } finally {
    setBrowserFiles([]);
    setSelectedImage(null);
    setLoading(false);
    setUploadingImage(false);
  }
};
