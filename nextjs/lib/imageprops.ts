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
      name: "Creative Upscale (Coming Soon)",
      desc: "The service can upscale highly degraded images (lower than 1 megapixel) with a creative twist to provide high resolution results.",
      action: "upscale",
      upload: true,
      uploadRequired: true,
      async: true,
  },
  {
      model: "erase",
      name: "Erase Unwanted Objects",
      desc: "3 credits. The Erase service removes unwanted objects, such as blemishes on portraits or items on desks, using image masks.",
      action: "edit",
      upload: true,
      uploadRequired: true,
      async: false,
  },
  {
      model: "inpaint",
      name: "Fill in or Replace",
      desc: "3 credits. Intelligently modify images by filling in or replacing specified areas with new content based on the content of a mask image.",
      action: "edit",
      upload: true,
      uploadRequired: true,
      async: false,
  },
  {
      model: "outpaint",
      name: "Outpaint - Fill in space",
      desc: "4 credits. The Outpaint service inserts additional content in an image to fill in the space in any direction. Compared to other automated or manual attempts to expand the content in an image, the Outpaint service should minimize artifacts and signs that the original image has been edited.",
      action: "edit",
      upload: true,
      uploadRequired: true,
      async: false,
  },
  {
      model: "search-and-replace",
      name: "Search and Replace",
      desc: "4 credits. The Search and Replace service is a specific version of inpainting that does not require a mask. Instead, users can leverage a search_prompt to identify an object in simple language to be replaced. The service will automatically segment the object and replace it with the object requested in the prompt.",
      action: "edit",
      upload: true,
      uploadRequired: true,
      async: false,
  },
  {
      model: "search-and-recolor",
      name: "Search and Recolor",
      desc: "5 credits. The Search and Recolor service provides the ability to change the color of a specific object in an image using a prompt. This service is a specific version of inpainting that does not require a mask. The Search and Recolor service will automatically segment the object and recolor it using the colors requested in the prompt.",
      action: "edit",
      upload: true,
      uploadRequired: true,
      async: false,
  },
  {
      model: "remove-background",
      name: "Remove Background",
      desc: "2 credits. The Remove Background service accurately segments the foreground from an image and implements and removes the background.",
      action: "edit",
      upload: true,
      uploadRequired: true,
      async: false,
  },
  {
      model: "replace-background-and-relight",
      name: "Replace Background & Relight (Coming Soon)",
      desc: "8 credits. The Replace Background and Relight edit service lets users swap backgrounds with AI-generated or uploaded images while adjusting lighting to match the subject. This new API provides a streamlined image editing solution and can serve e-commerce, real estate, photography, and creative projects.",
      action: "edit",
      upload: true,
      uploadRequired: true,
      async: true,
  },
  {
      model: "sketch",
      name: "Sketch to Image",
      desc: "3 credits. This service offers an ideal solution for design projects that require brainstorming and frequent iterations. It upgrades rough hand-drawn sketches to refined outputs with precise control. For non-sketch images, it allows detailed manipulation of the final appearance by leveraging the contour lines and edges within the image.",
      action: "edit",
      upload: true,
      uploadRequired: true,
      async: false,
  },
  {
      model: "structure",
      name: "Maintain Structure",
      desc: "3 credits. This service excels in generating images by maintaining the structure of an input image, making it especially valuable for advanced content creation scenarios such as recreating scenes or rendering characters from models.",
      action: "edit",
      upload: true,
      uploadRequired: true,
      async: false,
  },
  {
      model: "style",
      name: "Style of image",
      desc: "4 credits. This service extracts stylistic elements from an input image (control image) and uses it to guide the creation of an output image based on the prompt. The result is a new image in the same style as the control image.",
      action: "edit",
      upload: true,
      uploadRequired: true,
      async: false,
  },
  {
      model: "3d",
      name: "3D Imaging",
      desc: "2 credits. Stable Fast 3D generates high-quality 3D assets from a single 2D input image.",
      action: "edit",
      upload: true,
      uploadRequired: true,
      async: false,
  }
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

  export interface DirectionalModel {
    left: number,
    right: number,
    up: number,
    down: number,
  }