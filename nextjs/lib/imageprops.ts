export interface ModelProps {
    model: string;
    name: string;
    desc: string;
    action: string;
    upload: boolean;
    uploadRequired: boolean;
    async: boolean;
  }
  
  export interface AspectRatioProps {
    ratio: string;
    desc: string;
  }

  export const aspectRatios: AspectRatioProps[] = [
    { ratio: "1:1", desc: "Square - Ideal for Instagram posts and profile pictures." },
    { ratio: "9:16", desc: "Horizontal - Used for ultra-wide content like immersive videos." },
    { ratio: "9:21", desc: "Ultra-Wide - Used in cinematic movies and ultrawide monitors." },
    { ratio: "3:2", desc: "Landscape - Standard DSLR camera photo aspect ratio flipped." },
    { ratio: "2:3", desc: "Tall Portrait - Used for posters and photography prints." },
    { ratio: "5:4", desc: "Short-Wide - Used for certain photography and web display formats." },
    { ratio: "4:5", desc: "Wide Portrait - Popular for social media and portrait images." },
    { ratio: "16:9", desc: "Ultra-Wide Landscape - Best for videos, presentations, and widescreen content." },
    { ratio: "21:9", desc: "Extra-Wide - Common for cinema movies and ultrawide screens." }
];

  
 export const formats: string[] = ["png", "jpeg", "webp"];
 export const models: ModelProps[] = [
  {
      model: "core",
      name: "Generate Image (Cheap/fast)",
      desc: "3 credits Our primary service for text-to-image generation, Stable Image Core represents the best quality achievable at high speed. No prompt engineering is required! Try asking for a style, a scene, or a character, and see what you get.",
      action: "generate",
      upload: false,
      uploadRequired: false,
      async: false,
  },
  {
      model: "ultra",
      name: "Generate Image (High quality)",
      desc: "8 credits. Our most advanced text to image generation service, Stable Image Ultra creates the highest quality images with unprecedented prompt understanding. Ultra excels in typography, complex compositions, dynamic lighting, vibrant hues, and overall cohesion and structure of an art piece. Made from the most advanced models, including Stable Diffusion 3.5, Ultra offers the best of the Stable Diffusion ecosystem.",
      action: "generate",
      upload: true,
      uploadRequired: false,
      async: false,
  },
  {
      model: "sd3",
      name: "Stable Diffusion 3.0 & 3.5",
      desc: "3 - 6.5 credits, Generate using Stable Diffusion 3.5 models, Stability AI latest base model:",
      action: "generate",
      upload: true,
      uploadRequired: false,
      async: false,
  },
  {
      model: "fast",
      name: "Fast Upscaler (CHEAP)",
      desc: "4 credits. This service enhances image resolution by 4x using predictive and generative AI. This lightweight and fast service (processing in ~1 second) is ideal for enhancing the quality of compressed images, making it suitable for social media posts and other applications.",
      action: "upscale",
      upload: true,
      uploadRequired: true,
      async: false,
  },
  {
      model: "conservative",
      name: "Upscale Conservative (EXPENSIVE)",
      desc: "25 credits Takes images between 64x64 and 1 megapixel and upscales them all the way to 4K resolution. Put more generally, it can upscale images ~20-40x times while preserving all aspects. Conservative Upscale minimizes alterations to the image and should not be used to reimagine an image.",
      action: "upscale",
      upload: true,
      uploadRequired: true,
      async: false,
  },
  {
      model: "upscale3",
      name: "Creative Upscale (Coming Soon?)",
      desc: "The service can upscale highly degraded images (lower than 1 megapixel) with a creative twist to provide high resolution results.",
      action: "upscale",
      upload: true,
      uploadRequired: true,
      async: true,
  },
];

  export const versions = [
    "sd3-large",
    "sd3-large-turbo",
    "sd3-medium",
    "sd3.5-large",
    "sd3.5-large-turbo",
    "sd3.5-medium"
  ];
  
  
  // 🎨 Available styles
  export const styles: string[] = [
    "3d-model", "analog-film", "anime", "cinematic", "comic-book",
    "digital-art", "enhance", "fantasy-art", "isometric", "line-art",
    "low-poly", "modeling-compound", "neon-punk", "origami",
    "photographic", "pixel-art", "tile-texture"
  ];
  
  export interface ImageModel {
    url: string;
    id: number;
    action: string;
    favorite: boolean;
    sort_order: number
    uploadRequired: boolean; 

  }