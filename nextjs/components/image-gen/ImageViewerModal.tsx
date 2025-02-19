import React, { useState } from "react";
import { Star, Trash2, X } from "lucide-react";
import { deleteImage, toggleFavorite } from "@/app/utils/imageUtils";
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
  if (!isOpen || !image) return null;


  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    await deleteImage(image.id!, images, setImages);
    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    onClose(); // Close the viewer after deletion
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background Overlay */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Modal Content */}
            <motion.div
              className="relative max-w-4xl p-6 bg-white rounded-lg shadow-lg flex flex-col items-center"
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

              {/* Image Display */}
              <motion.img
                src={image.url}
                alt="Selected"
                className="w-full max-w-3xl h-auto rounded-lg"
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
                  className={`p-2 rounded-full ${
                    image.favorite ? "bg-yellow-500 text-white" : "bg-gray-300 text-black"
                  } transition-colors`}
                  onClick={() => toggleFavorite(image.id!, images, setImages)}
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
