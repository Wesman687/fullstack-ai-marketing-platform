'use client'
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import UploadStepHeader from "@/components/upload-step/UploadStepHeader";
import ImageGenSelector from "@/components/image-gen/ImageGenSelector";
import { AspectRatioProps, aspectRatios, DirectionalModel, ImageModel, ModelProps, models, styles } from "@/lib/imageprops";
import toast from "react-hot-toast";
import DisplayImage from "@/components/image-gen/DisplayImage";
import ImagePreviewModal from "@/components/image-gen/ImageViewerModal";
import { generateImageGenerator } from "@/components/image-gen/GenerateFunctions/HandleGenerate";
import { upscaleImageGenerator } from "@/components/image-gen/GenerateFunctions/HandleUpscale";
import MaskUploader from "@/components/image-gen/GenSelectors/MaskUploader";
import { editImageGenerator } from "@/components/image-gen/GenerateFunctions/HandleEdit";

export default function GenerateImage() {
  const [prompt, setPrompt] = useState<string>("");
  const [format, setFormat] = useState<string>("png");
  const [style, setStyle] = useState<string>(styles[0]); // Default style
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<ModelProps>(models[0]);
  const [negativePrompt, setNegativePrompt] = useState<string>("");
  const [showNegative, setShowNegative] = useState<boolean>(false);
  const [seedPercentage, setSeedPercentage] = useState<number>(0); // Store percentage (0-100)
  const [aspectRatio, setAspectRatio] = useState<AspectRatioProps>(aspectRatios[0]);
  const [userId, setUserId] = useState<string | null>(null);
  const [browserFiles, setBrowserFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false)
  const inputFileRef = useRef<HTMLInputElement | null>(null)
  const maskFileRef = useRef<HTMLInputElement | null>(null)
  const [fileFormat, setFileFormat] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageGallery, setImageGallery] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [images, setImages] = useState<ImageModel[]>([]);
  const [strength, setStrength] = useState<number>(0);
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false)
  const [image, setImage] = useState<ImageModel | null>(null)
  const [creativity, setCreativity] = useState<number>(0.5)
  const [version, setVersion] = useState<string>("");
  const [maskFile, setMaskFile] = useState<File | null>(null);
  const [growMask, setGrowMask] = useState<number>(5)
  const [directions, setDirections] = useState<DirectionalModel>({left: 0, right: 0, up: 0, down: 0})
  const [searchPrompt, setSearchPrompt] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
  
    const filesArray = Array.from(event.target.files);
  
    // ✅ Normalize .jpg to .jpeg
    const allowedFormats = ["png", "jpeg", "webp"];
  
    const validFiles = filesArray.filter((file) => {
      let format = file.name.split(".").pop()?.toLowerCase() || "";
      if (format === "jpg") format = "jpeg"; // 🔹 Convert .jpg to .jpeg
      return allowedFormats.includes(format);
    });
  
    if (validFiles.length === 0) {
      toast.error("Only PNG, JPEG, or WEBP files are allowed.");
      return;
    }
  
    if (validFiles.length > 1) {
      toast.error("Only one file can be selected.");
      return;
    }
  
    const selectedFile = validFiles[0];
  
    // ✅ Check if this is a mask upload
    if (event.target === maskFileRef.current) {
      setMaskFile(selectedFile);
      return;
    }
  
    // ✅ Otherwise, it's a normal file upload
    setBrowserFiles([selectedFile]);
    setFileFormat(selectedFile.name.split(".").pop() || "");
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      if (!browserFiles.length) {
        toast.error("No file selected");
        return;
      }
      if (model.uploadRequired && !selectedImage){
        return toast.error("Please select an image before uploading.")
      }
      const formData = new FormData();
      formData.append("file", browserFiles[0]); // ✅ Uploading only the first file
      formData.append("user_id", userId || "default_user");
      formData.append("format", fileFormat || "png");

      await axios.post(`${process.env.NEXT_PUBLIC_API_IMAGE_GEN}/image/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // ✅ Required for file uploads
        },
      });
      toggleImageGallery()
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
      setBrowserFiles([]);
      toggleImageGallery()
    }
  };
  
  useEffect(() => {
    setLoading(true)
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/api/user');
        setUserId(data.userId);
      } catch (error) {
        console.error("Error fetching user ID:", error);
      } finally {
        setLoading(false)
      }
    };
    fetchData();
  }, []);
  const toggleUploadImage = () => {
    setUploadingImage(!uploadingImage);
    setImageGallery(false); // ✅ Close Image Gallery
    setSelectedImage(null); // ✅ Reset selected image
  };

  // ✅ Toggle Image Gallery & Close Upload
  const toggleImageGallery = () => {
    setImageGallery(!imageGallery);
    setUploadingImage(false); // ✅ Close Upload Image
    setBrowserFiles([]); // ✅ Clear uploaded files
  };

  const handleGenerateImage = () => { 
    if (model.action === "generate") generateImageGenerator({ prompt, style, format, model, negativePrompt, 
      seedPercentage, aspectRatio, userId, selectedImage, strength, version, images, 
      setImages, setImage, setIsViewerOpen, setImageGallery, setLoading, setError, 
      setSelectedImage, setBrowserFiles, setUploadingImage });

    if (model.action === "upscale") upscaleImageGenerator({ prompt, format, style, selectedImage, images,
      setIsViewerOpen, setImageGallery, setLoading, setError, setBrowserFiles, 
      negativePrompt, setImages, setImage, seedPercentage, creativity, model, userId });

    if (model.action === "edit") editImageGenerator({ prompt,  format, model, maskFile, selectedImage, seedPercentage, setImages, setLoading
      , setError, setIsViewerOpen, userId, setImageGallery, images, setImage, growMask, style, negativePrompt, searchPrompt, directions, creativity });
  };
  
  return (
    <div className="flex flex-col items-center p-6 text-white justify-center">      
        <div className="w-full max-w-6xl bg-gray-200 rounded-xl p-6 text-gray-900 shadow-lg">
        <ImageGenSelector {...{ style, setStyle, model, setModel, aspectRatio, setAspectRatio, format, setFormat, loading, error, prompt, setPrompt, 
          negativePrompt, setNegativePrompt, showNegative, setShowNegative, seedPercentage, setSeedPercentage, 
          handleGenerateImage, creativity, setCreativity, version, setVersion, growMask, setGrowMask, directions, setDirections, searchPrompt,
          setSearchPrompt }} />

          {/* 🔹 Toggle Upload Image Section */}
          {model.upload ? (
            <>
              <div className="relative flex items-center justify-center my-6 cursor-pointer" onClick={toggleUploadImage}>
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dashed border-gray-400"></div>
                </div>
                <span className="bg-gray-200 px-4 text-gray-700 font-semibold z-10">
                  {uploadingImage ? "Close Upload Image" : "Show Upload Image"}
                </span>
              </div>
              {uploadingImage && (
                <>
                  <p className="text-center mb-2">Be sure to Upload Image before Generating.</p>
                  <UploadStepHeader
                    browserFiles={browserFiles}
                    handleUpload={handleUpload}
                    setBrowserFiles={setBrowserFiles}
                    uploading={uploading}
                    inputFileRef={inputFileRef}
                    accept="image/png, image/jpeg, image/webp"
                    handleFileChange={handleFileChange}
                  />
                </>
              )}
            </>
          ) : (
            <div className="bg-gray-400 p-6 text-gray-600 z-[-10] rounded-lg my-6 text-center cursor-not-allowed opacity-50 pointer-events-none">
              Uploading is not available for this model
            </div>
          )}
          {["erase", "inpaint"].includes(model.model) && <MaskUploader maskFileRef={maskFileRef} handleFileChange={handleFileChange} setMaskFile={setMaskFile}  />}

          {/* 🔹 Toggle Image Gallery Section */}
          <div className="relative flex items-center justify-center my-6 cursor-pointer" onClick={toggleImageGallery}>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dashed border-gray-400"></div>
            </div>
            <span className="bg-gray-200 px-4 text-gray-700 font-semibold z-10">
              {imageGallery ? "Close Image Gallery" : "Show Image Gallery"}
            </span>
          </div>

          {imageGallery && (
            <div className="flex justify-center">
              <DisplayImage userId={userId} model={model} setSelectedImage={setSelectedImage} selectedImage={selectedImage} images={images} setImages={setImages} strength={strength} setStrength={setStrength} />
            </div>
          )}

        </div>
        {/* ✅ Image Preview Modal */}
      <ImagePreviewModal
        isOpen={isViewerOpen}
        image={image}
        images={images}
        setImages={setImages}
        onClose={() => setIsViewerOpen(false)} // ✅ Close modal on button click
      />
    </div>
  );
}
