import { Menu } from 'lucide-react'; // ✅ Import Download Icon
import React from 'react';
import ImageGallery from './ImageGallery';
import { ImageModel, ModelProps } from '@/lib/imageprops';

interface DisplayImageProps {
    userId: string | null;
    setSelectedImage: (url: string) => void;
    selectedImage: string | null;
    images: ImageModel[];
    setImages: (images: ImageModel[]) => void;
    strength: number;
    setStrength: (strength: number) => void;
    model: ModelProps
}

function DisplayImage({ userId, setSelectedImage, selectedImage, setImages, images, strength, setStrength, model }: DisplayImageProps) {

    return (
        <div>
            {/* 🔹 Strength Slider */}
            {(model.action === "generate" && model.model !== "core" )&& <div className="mb-4 flex flex-col items-center">
                <div className='flex'>
                    <label htmlFor="strength-slider" className="text-gray-700 font-semibold mb-2">
                        Strength: {strength.toFixed(1)}
                    </label>
                    <div className="relative">
                        <Menu className="h-6 w-6 ml-2 text-gray-600 cursor-pointer peer" />
                        <div className="absolute left-0 bottom-full mb-2 w-[20vw] p-4 text-sm text-white bg-gray-600/80 rounded opacity-0 
                            peer-hover:opacity-100 transition-opacity duration-200 shadow-lg pointer-events-none z-50">
                            Sometimes referred to as denoising, this parameter controls how much influence the image parameter has on the generated image.
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
            </div>}

            {/* ✅ Filter Buttons */}
            <ImageGallery selectedImage={selectedImage} userId={userId} images={images} setImages={setImages} setSelectedImage={setSelectedImage} />
        </div>
    );
}

export default DisplayImage;
