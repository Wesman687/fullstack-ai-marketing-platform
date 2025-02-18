/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import { ImageResponse } from "@/lib/imageprops";
import axios from "axios";
import { Download, Star } from "lucide-react";
import toast from "react-hot-toast";
import {
    DndContext,
    closestCenter,
    useSensor,
    useSensors,
    PointerSensor,
    TouchSensor,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ImageGalleryProps {
    userId: string | null;
    images: ImageResponse[];
    setImages: (images: ImageResponse[]) => void;
    selectedImage: string | null;
    setSelectedImage: (url: string) => void;
}
interface SortableImageProps {
    item: ImageResponse; // ✅ Use the correct type for image items
    selectedImage: string | null;
    setSelectedImage: (url: string) => void;
}

// ✅ Sortable Image Component
const SortableImage: React.FC<SortableImageProps> = ({ item, selectedImage, setSelectedImage }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id.toString() });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: "grab",
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative">
            {/* ✅ Image Wrapper */}
            <div
                className={`relative w-full h-[200px] border-4 shadow-md ${
                    selectedImage === item.url ? "border-blue-500 rounded-xl" : "border-transparent"
                }`}
                onClick={() => setSelectedImage(item.url === selectedImage ? "" : item.url)}
            >
                <img src={item.url} alt="Generated" className="w-full h-full rounded-lg" loading="lazy" />
            </div>

            {/* ✅ Favorite Button */}
            <button
                className={`absolute top-2 right-2 p-2 rounded-full ${
                    item.favorite ? "bg-yellow-500 text-white" : "bg-gray-300 text-black"
                } transition-colors`}
            >
                <Star className="h-5 w-5" />
            </button>

            {/* ✅ Download Button */}
            <button className="absolute bottom-2 right-2 p-2 bg-gray-800/80 text-white rounded-full hover:bg-gray-600 transition">
                <Download className="h-5 w-5" />
            </button>
        </div>
    );
};

export default function ImageGallery({ userId, images, setImages, selectedImage, setSelectedImage }: ImageGalleryProps) {
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");

    // ✅ Fetch Images
    const fetchImages = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_IMAGE_GEN}/image/${userId}`);
            const sortedImages = response.data.images.sort((a: ImageResponse, b: ImageResponse) => a.sort_order - b.sort_order);
            setImages(sortedImages);

        } catch (error) {
            console.error("Error fetching images:", error);
        } finally {
            setLoading(false);
        }
    };
    console.log(images)
    useEffect(() => {
        if (userId) fetchImages();
    }, [userId]);

    // ✅ Drag-and-Drop Setup
    const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

    // ✅ Handle Drag and Drop Sorting
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
    
        // ✅ Reorder images locally
        const oldIndex = images.findIndex((img) => img.id.toString() === active.id.toString());
        const newIndex = images.findIndex((img) => img.id.toString() === over.id.toString());
        const newImages = arrayMove(images, oldIndex, newIndex);
    
        setImages(newImages); // ✅ Update UI immediately
        toast.success("Image order updated!");
    
        // ✅ Save new order to MySQL
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_IMAGE_GEN}/image/update-order`, {
                userId,
                images: newImages.map((img, index) => ({ id: img.id, order: index })),
            });
            toast.success("Order saved!");
        } catch (error) {
            console.error("Failed to save order:", error);
            toast.error("Failed to save order.");
        }
    };
    

    // ✅ Apply filter to images
    const filteredImages = images
        .filter((item) => {
            if (filter === "upload") return item.action === "upload";
            if (filter === "generated") return item.action !== "upload";
            if (filter === "favorite") return item.favorite === true;
            return true;
        })
        .sort((a, b) => Number(b.favorite) - Number(a.favorite));


    return (
        <>
            {/* ✅ Filter Buttons */}
            <div className="flex space-x-4 mb-4 items-center justify-center">
                <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-lg ${filter === "all" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>All</button>
                <button onClick={() => setFilter("upload")} className={`px-4 py-2 rounded-lg ${filter === "upload" ? "bg-green-500 text-white" : "bg-gray-300 text-black"}`}>Uploads</button>
                <button onClick={() => setFilter("generated")} className={`px-4 py-2 rounded-lg ${filter === "generated" ? "bg-purple-500 text-white" : "bg-gray-300 text-black"}`}>Generated</button>
                <button onClick={() => setFilter("favorite")} className={`px-4 py-2 rounded-lg ${filter === "favorite" ? "bg-yellow-500 text-white" : "bg-gray-300 text-black"}`}>⭐ Favorites</button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={filteredImages.map((img) => img.id.toString())} strategy={verticalListSortingStrategy}>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredImages.map((item) => (
                                <SortableImage
                                    key={item.id}
                                    item={item}
                                    selectedImage={selectedImage}
                                    setSelectedImage={setSelectedImage}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </>
    );
}
