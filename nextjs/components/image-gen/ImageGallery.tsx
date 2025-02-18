/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react'

import { ImageResponse } from '@/lib/imageprops';
import axios from 'axios';
import { Download, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageGalleryProps {
    userId: string | null;
    images: ImageResponse[];
    setImages: (images: ImageResponse[]) => void;
    selectedImage: string | null;
    setSelectedImage: (url: string) => void;
}

function ImageGallery({ userId, images, setImages, selectedImage, setSelectedImage }: ImageGalleryProps) {
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all"); // ✅ Default filter: Show all images

    // ✅ Fetch Images
    const fetchImages = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_IMAGE_GEN}/image/${userId}`);
            setImages(response.data.images);
        } catch (error) {
            console.error("Error fetching images:", error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Toggle Favorite Status
    const toggleFavorite = async (imageId: string) => {
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_IMAGE_GEN}/image/${imageId}/favorite`);
            toast.success("Favorite status updated!");
            fetchImages();
        } catch (error) {
            console.error("Failed to update favorite status:", error);
            toast.error("Failed to update favorite.");
        }
    };

    // ✅ Download Image
    const downloadImage = async (url: string) => {
        console.log("Download triggered for:", url); // ✅ Check if function runs

        try {
            console.log("Attempting direct download...");
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
                    `${process.env.NEXT_PUBLIC_API_IMAGE_GEN}/image/download-image?url=${encodeURIComponent(url)}`,
                    { responseType: "blob" }
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


    useEffect(() => {
        if (userId) fetchImages();
    }, [userId]);

    // ✅ Apply filter to images
    const filteredImages = images.filter((item) => {
        if (filter === "upload") return item.action === "upload";
        if (filter === "generated") return item.action !== "upload";
        if (filter === "favorite") return item.favorite === true;
        return true;
    }).sort((a, b) => (Number(b.favorite) - Number(a.favorite))); // ✅ Sort favorites first in "All"


    return (
        <>
            <div className="flex space-x-4 mb-4 items-center justify-center">
                <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-lg ${filter === "all" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>All</button>
                <button onClick={() => setFilter("upload")} className={`px-4 py-2 rounded-lg ${filter === "upload" ? "bg-green-500 text-white" : "bg-gray-300 text-black"}`}>Uploads</button>
                <button onClick={() => setFilter("generated")} className={`px-4 py-2 rounded-lg ${filter === "generated" ? "bg-purple-500 text-white" : "bg-gray-300 text-black"}`}>Generated</button>
                <button onClick={() => setFilter("favorite")} className={`px-4 py-2 rounded-lg ${filter === "favorite" ? "bg-yellow-500 text-white" : "bg-gray-300 text-black"}`}>⭐ Favorites</button>
            </div>

            {/* ✅ Display Images */}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredImages.map((item) => (
                        <div key={item.id} className="relative">
                            {/* ✅ Image Wrapper */}
                            <div
                                className={`relative w-full h-[200px] border-4 shadow-md ${selectedImage === item.url ? "border-blue-500 rounded-xl" : "border-transparent"
                                    }`}
                                onClick={() => setSelectedImage(item.url === selectedImage ? "" : item.url)} // ✅ Click to highlight only
                            >
                                {/* ✅ Directly use <img> so right-click "Save As" works */}
                                <img
                                    src={item.url} // ✅ Ensures right-click works
                                    alt="Generated"
                                    className="w-full h-full rounded-lg"
                                    loading="lazy"
                                    draggable="false" // Prevents accidental dragging
                                />
                            </div>

                            {/* ✅ Favorite Button */}
                            <button
                                onClick={() => toggleFavorite(item.id)}
                                className={`absolute top-2 right-2 p-2 rounded-full ${item.favorite ? "bg-yellow-500 text-white" : "bg-gray-300 text-black"
                                    } transition-colors`}
                            >
                                <Star className="h-5 w-5" />
                            </button>

                            {/* ✅ Download Button */}
                            <button
                                onClick={() => downloadImage(item.url)}
                                className="absolute bottom-2 right-2 p-2 bg-gray-800/80 text-white rounded-full hover:bg-gray-600 transition"
                            >
                                <Download className="h-5 w-5" />
                            </button>
                        </div>

                    ))}
                </div>
            )}
        </>

    )
}

export default ImageGallery