/* eslint-disable @next/next/no-img-element */
import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface DisplayImageProps {
    userId: string | null;
    setSelectedImage: (url: string) => void; // ✅ Callback to parent component
    selectedImage: string | null; // ✅ Selected image state from parent
}

interface ImageResponse {
    url: string;
    id: string;
    action: string;  // ✅ Added action field for filtering
}

function DisplayImage({ userId, setSelectedImage, selectedImage }: DisplayImageProps) {
    const [images, setImages] = useState<ImageResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all"); // ✅ Default filter: Show all images

    useEffect(() => {
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
        if (userId) fetchImages();
    }, [userId]);

    // ✅ Apply filter to images
    const filteredImages = images.filter((item) => {
        if (filter === "upload") return item.action === "upload";
        if (filter === "generated") return item.action !== "upload"; // ✅ All non-uploaded images
        return true; // Show all images
    });
    const handleSelectImage = (url: string) => {
        if (url === selectedImage) {
            setSelectedImage(""); // Deselect if the same image is clicked
            return;
        }
        setSelectedImage(url); // ✅ Pass selection to parent component
    };

    return (
        <div>
            {/* ✅ Filter Buttons */}
            <div className="flex space-x-4 mb-4 items-center justify-center">
                <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-lg ${filter === "all" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>
                    All
                </button>
                <button
                    onClick={() => setFilter("upload")}
                    className={`px-4 py-2 rounded-lg ${filter === "upload" ? "bg-green-500 text-white" : "bg-gray-300 text-black"}`}>
                    Uploads
                </button>
                <button
                    onClick={() => setFilter("generated")}
                    className={`px-4 py-2 rounded-lg ${filter === "generated" ? "bg-purple-500 text-white" : "bg-gray-300 text-black"}`}>
                    Generated
                </button>
            </div>

            {/* ✅ Display Images */}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredImages.map((item) => (
                        <div
                            key={item.id}
                            className={`relative w-full h-[200px] cursor-pointer border-4 shadow-md ${
                                selectedImage === item.url ? "border-blue-500 rounded-xl" : "border-transparent"
                            }`}
                            onClick={() => handleSelectImage(item.url)}
                        >
                            <img
                                src={item.url}
                                alt="Generated"
                                className="w-full h-full object-cover rounded-lg"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DisplayImage;