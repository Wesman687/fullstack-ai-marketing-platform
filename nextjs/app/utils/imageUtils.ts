import { ImageModel } from "@/lib/imageprops";
import axios from "axios";
import toast from "react-hot-toast";


export const toggleFavorite = async (imageId: number, images: ImageModel[], setImages: (images: ImageModel[]) => void) => {
    try {
        await axios.put(`${process.env.NEXT_PUBLIC_API_IMAGE_GEN}/image/${imageId}/favorite`);
        
        // ✅ Update state immediately so UI reflects changes
        const updatedImages = images.map((img) =>
            img.id === imageId ? { ...img, favorite: !img.favorite } : img
        );
        setImages(updatedImages);
        toast.success("Favorite updated!");
    } catch (error) {
        console.error("Failed to update favorite:", error);
        toast.error("Failed to update favorite.");
    }
};

// ✅ Download Image
export const downloadImage = async (url: string) => {

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch directly, trying server...");

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        // Create and trigger a download link
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = url.split('/').pop() || "image.png"; // ✅ Extracts file name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Image downloaded!");

        console.log("Direct download success!");
    } catch (error) {

        console.warn("Direct download failed, falling back to server:", error);

        // Fallback to server if direct download fails
        try {
            const serverResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_IMAGE_GEN}/image/download-image?url=${encodeURIComponent(url)},
                { responseType: "blob" }`
            );

            const serverBlob = new Blob([serverResponse.data], { type: serverResponse.headers["content-type"] });
            const serverBlobUrl = URL.createObjectURL(serverBlob);

            // Create a new download link
            const serverLink = document.createElement("a");
            serverLink.href = serverBlobUrl;
            serverLink.download = url.split('/').pop() || "image.png";
            document.body.appendChild(serverLink);
            serverLink.click();
            document.body.removeChild(serverLink);

            toast.success("Image downloaded via server!");
        } catch (serverError) {
            console.error("Both direct and server downloads failed:", serverError);
            toast.error("Download failed!");
        }
    }
};

export const deleteImage = async (imageId: number, images: ImageModel[], setImages: (images: ImageModel[]) => void) => {
    try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_IMAGE_GEN}/image/delete/${imageId}`);

        // ✅ Optimistically update UI by removing the image from the array
        const updatedImages = images.filter(img => img.id !== imageId);
        setImages(updatedImages);

        toast.success("Image deleted successfully!");
    } catch (error) {
        console.error("❌ Failed to delete image:", error);
        toast.error("Failed to delete image.");
    }
};
