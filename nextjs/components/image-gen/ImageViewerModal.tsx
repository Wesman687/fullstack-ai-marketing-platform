import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Star, Trash2, X } from "lucide-react";
import { deleteImage, downloadImage, toggleFavorite } from "@/app/utils/imageUtils";
import ConfirmationModal from "../ConfirmationModal";
import { ImageModel } from "@/lib/imageprops";
import { motion, AnimatePresence } from "framer-motion";

interface ImageViewerModalProps {
  isOpen: boolean;
  image: ImageModel | null; // ✅ Pass entire image object
  onClose: () => void;
  images: ImageModel[];
  setImages: (images: ImageModel[]) => void;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ isOpen, image, onClose, images, setImages }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [filter, setFilter] = useState<string>("all");
  const [currentImage, setCurrentImage] = useState<ImageModel | null>(null);

  const filteredImages = images
    .filter((item) => {
      if (filter === "upload") return item.action === "upload";
      if (filter === "generated") return item.action === "generate";
      if (filter === "edit") return item.action === "edit";
      if (filter === "upscale") return item.action === "upscale";
      if (filter === "favorite") return item.favorite === true;
      return true;
    })
    .sort((a, b) => {
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return Number(b.favorite) - Number(a.favorite);
    });

  useEffect(() => {
    if (image) {
      const index = filteredImages.findIndex((img) => img.id === image.id);
      setCurrentIndex(index >= 0 ? index : 0);
      setCurrentImage(filteredImages[index] || image); // ✅ Ensure a valid image is displayed
    }
  }, [image, images, filter, filteredImages])
  useEffect(() => {
    if (filteredImages.length > 0) {
      setCurrentIndex(0); // ✅ Reset index to first image
      setCurrentImage(filteredImages[0]); // ✅ Show first image in new filter
    } else {
      setCurrentImage(null); // ✅ No images? Show empty state
    }
  }, [filter, filteredImages]);

  if (!isOpen) return null;


  // ✅ Navigate to Previous Image
  const showPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
      setCurrentImage(filteredImages[currentIndex - 1]); // ✅ Update displayed image
    }
  };

  // ✅ Navigate to Next Image
  const showNext = () => {
    if (currentIndex < filteredImages.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      setCurrentImage(filteredImages[currentIndex + 1]); // ✅ Update displayed image
    }
  };


  const handleDeleteConfirm = async () => {
    if (!currentImage) return;
    setIsDeleting(true);
    await deleteImage(currentImage.id!, images, setImages);    
    setIsDeleting(false);
    showNext() // Close the viewer after deletion
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background Overlay */}
          <motion.div
            className="fixed inset-0 bg-main bg-opacity-75 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Modal Content */}
            <motion.div
              className="relative max-w-[80vw] p-6 bg-gray-300/80 rounded-lg shadow-lg flex flex-col items-center max-h-[90vh] border-white border-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-2 bg-gray-300 hover:bg-gray-500 text-white rounded-full transition"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Filtering Buttons */}
              <div className="flex space-x-2 mb-4">
                {["all", "upload", "generated", "edit", "upscale", "favorite"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-3 py-1 text-sm rounded-lg ${filter === type
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-black hover:bg-gray-400"
                      } transition`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>


              {filteredImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                  <p className="text-gray-600 text-lg">No images found for this filter.</p>
                </div>
              ) : (
                <>
                  {/* Previous Button */}
                  {currentIndex > 0 && (
                    <button
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 p-2 bg-gray-800/80 text-white rounded-full hover:bg-gray-600 transition"
                      onClick={showPrevious}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                  )}
                  <button
                    className="absolute bottom-0 p-2 bg-gray-800/80 text-white rounded-full hover:bg-gray-600 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!currentImage) return;
                      downloadImage(currentImage.url);
                    }}
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  {/* Next Button */}
                  {currentIndex < filteredImages.length - 1 && (
                    <button
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-gray-800/80 text-white rounded-full hover:bg-gray-600 transition"
                      onClick={showNext}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  )}

                  {/* Image Display */}
                  <motion.img
                    src={currentImage?.url}
                    alt="Selected"
                    className="w-full max-w-[80vw] h-full rounded-lg max-h-[80vh] object-contain"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  />

                  {/* Controls */}
                  <motion.div
                    className="mt-4 flex justify-between w-full"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    {/* Favorite Button */}
                    <button
                      className={`p-2 rounded-full ${currentImage?.favorite ? "bg-yellow-500 text-white" : "bg-gray-300 text-black"
                        } transition-colors`}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!currentImage || !currentImage.id || !images) return;
                        toggleFavorite(currentImage?.id, images, setImages)

                      }}
                    >
                      <Star className="h-6 w-6" />
                    </button>

                    {/* Delete Button */}
                    <button
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-700 transition"
                      onClick={() => setIsDeleteModalOpen(true)}
                    >
                      <Trash2 className="h-6 w-6" />
                    </button>
                  </motion.div>
                </>
              )}
            </motion.div>

            {/* Confirmation Modal for Deletion */}
            <ConfirmationModal
              isOpen={isDeleteModalOpen}
              title="Delete Image?"
              message="Are you sure you want to delete this image? This action cannot be undone."
              isLoading={isDeleting}
              onClose={() => setIsDeleteModalOpen(false)}
              onConfirm={handleDeleteConfirm}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};


export default ImageViewerModal;
