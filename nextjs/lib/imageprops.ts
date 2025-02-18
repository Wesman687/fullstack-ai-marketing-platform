export interface ModelProps {
    model: string;
    name: string;
    desc: string;
    action: string;
    upload: boolean;
  }
  
  export interface AspectRatioProps {
    ratio: string;
    desc: string;
  }
export  const aspectRatios: AspectRatioProps[] = [
    { ratio: "1:1", desc: "Square - Ideal for Instagram posts and profile pictures." },
    { ratio: "16:9", desc: "Widescreen - Common for YouTube thumbnails, presentations, and movies." },
    { ratio: "21:9", desc: "Ultra-Wide - Used in cinematic movies and ultrawide monitors." },
    { ratio: "2:3", desc: "Portrait - Used for posters and photography prints." },
    { ratio: "3:2", desc: "Classic Photo - Standard DSLR camera photo aspect ratio." },
    { ratio: "4:5", desc: "Tall Rectangle - Popular for Instagram portraits and social media." },
    { ratio: "5:4", desc: "Slightly Square - Used for specific photography formats." },
    { ratio: "9:16", desc: "Vertical - Best for TikTok, Instagram Reels, and mobile stories." },
    { ratio: "9:21", desc: "Extra Tall - Rare, but useful for some mobile screens and banners." },
  ];
  
 export const formats: string[] = ["png", "jpeg", "webp"];
 export const models: ModelProps[] = [
    {
      model: "core",
      name: "Generate Image (Cheap/fast)",
      desc: "Our primary service for text-to-image generation, Stable Image Core represents the best quality achievable at high speed. No prompt engineering is required! Try asking for a style, a scene, or a character, and see what you get.",
      action: "generate",
      upload: false
    },
    {
      model: "ultra",
      name: "Generate Image (High quality)",
      desc: "Our most advanced text to image generation service, Stable Image Ultra creates the highest quality images with unprecedented prompt understanding. Ultra excels in typography, complex compositions, dynamic lighting, vibrant hues, and overall cohesion and structure of an art piece. Made from the most advanced models, including Stable Diffusion 3.5, Ultra offers the best of the Stable Diffusion ecosystem.",
      action: "generate",
      upload: true
    },
    {
      model: "UpScale",
      name: "Upscale Image",
      desc: "Test.",
      action: "generate",
      upload: false
    },
  ];
  
  // 🎨 Available styles
  export const styles: string[] = [
    "3d-model", "analog-film", "anime", "cinematic", "comic-book",
    "digital-art", "enhance", "fantasy-art", "isometric", "line-art",
    "low-poly", "modeling-compound", "neon-punk", "origami",
    "photographic", "pixel-art", "tile-texture"
  ];
  
  export interface ImageResponse {
      url: string;
      id: number;
      action: string;
      favorite: boolean;
      sort_order: number  // ✅ Added action field for filtering
  }