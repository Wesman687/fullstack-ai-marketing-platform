/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import { ImageModel } from "@/lib/imageprops";
import axios from "axios";
import { Download, Eye, Star } from "lucide-react";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { deleteImage } from "@/app/utils/imageUtils";

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
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { downloadImage, toggleFavorite } from "@/app/utils/imageUtils";
import { rectSortingStrategy, defaultAnimateLayoutChanges } from "@dnd-kit/sortable";
import ConfirmationModal from "../ConfirmationModal";
import ImageViewerModal from "./ImageViewerModal";

interface ImageGalleryProps {
    userId: string | null;
    images: ImageModel[];
    setImages: (images: ImageModel[]) => void;
    selectedImage: string | null;
    setSelectedImage: (url: string) => void;
}
interface SortableImageProps {
    item: ImageModel;
    selectedImage: string | null;
    setSelectedImage: (url: string) => void;
    images: ImageModel[]; // ✅ Add images array
    setImages: (images: ImageModel[]) => void; // ✅ Add setter function
}


const SortableImage: React.FC<SortableImageProps> = ({ item, selectedImage, setSelectedImage, images, setImages }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: item.id.toString(),
        animateLayoutChanges: defaultAnimateLayoutChanges, // ✅ Ensures smooth reordering
    });
    

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: "grab",
    };

    // ✅ Track whether it's a click or a drag
    const [isDragging, setIsDragging] = useState(false);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    const handlePointerDown = () => {
        setIsDragging(false); // Reset state before drag starts
    };

    const handlePointerMove = () => {
        setIsDragging(true); // If movement occurs, set dragging to true
    };

    const handlePointerUp = (event: React.MouseEvent) => {
        if (!isDragging) {
            event.stopPropagation(); // ✅ Prevents drag interference
            console.log("✅ Image Clicked:", item.id);
            setSelectedImage(item.url === selectedImage ? "" : item.url);
        }
    };
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        await deleteImage(item.id, images, setImages);
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative"
            onPointerDown={handlePointerDown} // ✅ Detects initial click
            onPointerMove={handlePointerMove} // ✅ Detects drag movement
            onPointerUp={handlePointerUp} // ✅ Click works correctly
        >
            {/* ✅ Image Wrapper */}
            <div
                className={`relative w-full max-h-[200px] max-w-[400px] border-4 shadow-md ${selectedImage === item.url ? "border-blue-500 rounded-xl" : "border-transparent"
                    }`}
            >
                {/* ✅ Apply Drag Listeners Only to Image */}
                <img
                    src={item.url}
                    alt="Generated"
                    className="w-full max-h-[200px] rounded-lg"
                    loading="lazy"
                    {...attributes} // ✅ Keeps dragging functional
                    {...listeners}
                />
            </div>
            {/* ✅ Eye (View Image) Button - Top Left */}
            <button
                className="absolute top-2 left-2 p-2 bg-gray-800/80 text-white rounded-full hover:bg-gray-600 transition"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsViewerOpen(true);
                }}
            >
                <Eye className="h-5 w-5" />
            </button>

            {/* ✅ Favorite Button */}
            <button
                className={`absolute top-2 right-2 p-2 rounded-full ${item.favorite ? "bg-yellow-500 text-white" : "bg-gray-300 text-black"
                    } transition-colors`}
                onClick={(e) => {
                    e.stopPropagation();
                    console.log("✅ Favorite toggled for:", item.id);
                    toggleFavorite(item.id, images, setImages);
                }}
            >
                <Star className="h-5 w-5" />
            </button>

            {/* ✅ Download Button */}
            <button
                className="absolute bottom-2 right-2 p-2 bg-gray-800/80 text-white rounded-full hover:bg-gray-600 transition"
                onClick={(e) => {
                    e.stopPropagation();
                    console.log("✅ Download triggered for:", item.url);
                    downloadImage(item.url);
                }}
            >
                <Download className="h-5 w-5" />
            </button>
            <button
                className="absolute bottom-2 left-2 p-2 bg-red-500/80 text-white rounded-full hover:bg-red-700 transition"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleteModalOpen(true); // ✅ Open delete modal
                }}
            >
                <Trash2 className="h-5 w-5" />
            </button>

            {/* ✅ Confirmation Modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                title="Delete Image?"
                message="Are you sure you want to delete this image? This action cannot be undone."
                isLoading={isDeleting}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
            />
            {/* ✅ Image Viewer Modal */}
            <ImageViewerModal
                isOpen={isViewerOpen}
                image={item}
                onClose={() => setIsViewerOpen(false)}
                images={images}
                setImages={setImages}
            />
        </div>
    );
};




export default function ImageGallery({ userId, images, setImages, selectedImage, setSelectedImage }: ImageGalleryProps) {
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");
    
    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_IMAGE_GEN}/image/${userId}`);
                setImages(response.data.images); // ✅ Update state with sorted images
    
            } catch (error) {
                console.error("Error fetching images:", error);
            } finally {
                setLoading(false);
            }
        };
        if (userId) {
        
            fetchImages();
        }
    }, [userId,]);

    // ✅ Drag-and-Drop Setup
    const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

    // ✅ Handle Drag and Drop Sorting
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
    
        // ✅ Find the old and new indexes
        const oldIndex = images.findIndex((img) => img.id.toString() === active.id.toString());
        const newIndex = images.findIndex((img) => img.id.toString() === over.id.toString());
    
        // ✅ Create a new array with updated order
        const newImages = arrayMove(images, oldIndex, newIndex).map((img, index) => ({
            ...img,
            sort_order: index, // ✅ Manually update sort_order
        }));
    
        setImages([...newImages]); // ✅ Ensure React re-renders UI immediately
    
        console.log("🔥 Optimistic Update (Before API):", newImages);
    
        try {
            // ✅ Send the updated order to the backend
            await axios.put(`${process.env.NEXT_PUBLIC_API_IMAGE_GEN}/image/update-order`, {
                userId,
                images: newImages.map((img) => ({ id: img.id, order: img.sort_order })),
            });
    
            console.log("✅ Order Saved on Backend!");
            toast.success("Order saved!");
            
            // ✅ Remove fetchImages() to prevent state reset
        } catch (error) {
            console.error("❌ Failed to save order:", error);
            toast.error("Failed to save order.");               
        }
    };


    // ✅ Apply filter to images
    const filteredImages = [...images] // Clone images to avoid mutating state
        .filter((item) => {
            if (filter === "upload") return item.action === "upload";
            if (filter === "generated") return item.action !== "upload";
            if (filter === 'edit') return item.action === "edit";
            if (filter === "upscale") return item.action === "upscale";
            if (filter === "favorite") return item.favorite === true;
            return true;
        })
        .sort((a, b) => {
            // ✅ Keep `sort_order` first, then sort favorites within that order
            if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
            return Number(b.favorite) - Number(a.favorite);
        });


    return (
        <>
            {/* ✅ Filter Buttons */}
            <div className="flex space-x-4 mb-4 items-center justify-center">
                <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-lg ${filter === "all" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>All</button>
                <button onClick={() => setFilter("upload")} className={`px-4 py-2 rounded-lg ${filter === "upload" ? "bg-green-500 text-white" : "bg-gray-300 text-black"}`}>Uploads</button>
                <button onClick={() => setFilter("generated")} className={`px-4 py-2 rounded-lg ${filter === "generated" ? "bg-purple-500 text-white" : "bg-gray-300 text-black"}`}>Generated</button>
                <button onClick={() => setFilter("favorite")} className={`px-4 py-2 rounded-lg ${filter === "favorite" ? "bg-yellow-500 text-white" : "bg-gray-300 text-black"}`}>⭐ Favorites</button>
                <button onClick={() => setFilter("edit")} className={`px-4 py-2 rounded-lg ${filter === "edit" ? "bg-red-500 text-white" : "bg-gray-300 text-black"}`}>Edited</button>
                <button onClick={() => setFilter("upscale")} className={`px-4 py-2 rounded-lg ${filter === "upscale" ? "bg-pink-500 text-white" : "bg-gray-300 text-black"}`}>UpScaled</button>

            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext
                        items={filteredImages.map((img) => img.id.toString())}
                        strategy={rectSortingStrategy} // ✅ Ensures real-time movement while dragging
                    >
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredImages.map((item) => (
                                <SortableImage
                                    key={item.id}
                                    item={item}
                                    selectedImage={selectedImage}
                                    setSelectedImage={setSelectedImage}
                                    images={images}
                                    setImages={setImages}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </>
    );
}
