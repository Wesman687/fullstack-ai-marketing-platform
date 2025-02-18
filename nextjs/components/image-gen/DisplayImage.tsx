/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from '@/lib/imageprops';
import axios from 'axios';
import { Menu } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface DisplayImageProps {
    userId: string | null;
    setSelectedImage: (url: string) => void; // ✅ Callback to parent component
    selectedImage: string | null; // ✅ Selected image state from parent
    images: ImageResponse[]; // ✅ Images state from parent
    setImages: (images: ImageResponse[]) => void; // ✅ Callback to update images in parent
    strength: number
    setStrength: (strength: number) => void
}



function DisplayImage({ userId, setSelectedImage, selectedImage, setImages, images, strength, setStrength }: DisplayImageProps) {
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
            {/* 🔹 Strength Slider */}
            <div className="mb-4 flex flex-col items-center">
                <div className='flex'>

                    <label htmlFor="strength-slider" className="text-gray-700 font-semibold mb-2">
                        Strength: {strength.toFixed(1)}
                    </label>
                    <div className="relative">
                        {/* Menu Icon (Trigger) */}
                        <Menu className="h-6 w-6 ml-2 text-gray-600 cursor-pointer peer" />

                        {/* Tooltip (Only appears when hovering over the Menu icon) */}
                        <div className="absolute left-0 bottom-full mb-2 w-[20vw] p-4 text-sm text-white bg-gray-600/80 rounded opacity-0 
    peer-hover:opacity-100 transition-opacity duration-200 shadow-lg pointer-events-none z-50">
                            Sometimes referred to as denoising, this parameter controls how much influence the image parameter has on the generated image. A value of 0 would yield an image that is identical to the input. A value of 1 would be as if you passed in no image at all.
                        </div>
                    </div>
                </div>
                <input
                    id="strength-slider"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={strength}
                    onChange={(e) => setStrength(parseFloat(e.target.value))}
                    className="w-full md:w-2/3 cursor-pointer accent-blue-500"
                />
            </div>

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
                <div className="grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredImages.map((item) => (
                        <div
                            key={item.id}
                            className={`relative w-full h-[100px] cursor-pointer border-4 shadow-md ${selectedImage === item.url ? "border-blue-500 rounded-xl" : "border-transparent"
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