import React from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader } from "@/components/ui/alert-dialog";
import { AlertDialogCancel, AlertDialogTitle } from "@radix-ui/react-alert-dialog";
import Image from "next/image";

interface ImagePreviewModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-[90%] sm:max-w-lg bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg sm:text-xl md:text-2xl font-semibold">
            Generated Image
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="flex justify-center">
          <Image
            width={500}
            height={500}
            src={imageUrl}
            alt="Generated"
            className="rounded-lg shadow-lg"
          />
        </div>

        <div className="flex justify-center mt-4">
          <AlertDialogCancel
            onClick={onClose}
            className="p-2 border-main rounded text-main bg-white hover:bg-main/5"
          >
            Close
          </AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ImagePreviewModal;
