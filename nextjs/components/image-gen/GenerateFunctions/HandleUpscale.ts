import { ImageModel, ModelProps } from "@/lib/imageprops";
import axios from "axios";
import toast from "react-hot-toast";

interface UpscaleImageProps {
    prompt: string;
    format: string;
    style: string;
    model: ModelProps;
    selectedImage: string | null;
    images: ImageModel[];
    creativity: number;
    seedPercentage: number;
    negativePrompt: string;
    userId: string | null;
    setImages: React.Dispatch<React.SetStateAction<ImageModel[]>>;
    setImage: (image: ImageModel) => void;
    setIsViewerOpen: (isViewerOpen: boolean) => void;
    setImageGallery: (imageGallery: boolean) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setBrowserFiles: (browserFiles: File[]) => void;
}

export const upscaleImageGenerator = async (
    props: UpscaleImageProps,

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
        selectedImage,
        setError,
        setBrowserFiles,
        userId,
        negativePrompt,
        seedPercentage,
        creativity,
    } = props;

    if (!selectedImage) {
        setError("Please select an image to upscale.");
        toast.error("Please select an image to upscale.");
        return;
    }

    setLoading(true);
    setError(null);
    if (!prompt.trim()) {
        setError("Prompt cannot be empty.");
        setLoading(false);
        return;
    }
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("format", format);
    formData.append("model", model.model);
    formData.append("style", style);
    formData.append("negativePrompt", negativePrompt);
    formData.append("user_id", userId || "default_user");
    formData.append("seed", Math.round((1 - seedPercentage / 100) * 4294967294).toString());
    formData.append("creativity", creativity.toString());

    const response = await fetch(selectedImage);
    const blob = await response.blob();
    formData.append("init_image", new File([blob], "image.png", { type: blob.type }));
    try {
        const response = await axios.post<{ image: ImageModel }>(
            `${process.env.NEXT_PUBLIC_API_IMAGE_GEN}/image/upscale`,
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
                if (!prevImages) return [newImage]; // Handle undefined state
                return [...prevImages, newImage];
              });
            // ✅ Refresh Gallery
            setImageGallery(false);
            setTimeout(() => setImageGallery(true), 100);
        }
    } catch (error) {
        setError(`An error occurred. Please try again. ${error}`);
        console.log(error)
    } finally {
        setBrowserFiles([]);
        setLoading(false);
    }


}