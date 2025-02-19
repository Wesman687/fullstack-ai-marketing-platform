import { AspectRatioProps, formats, ModelProps, models } from '@/lib/imageprops'
import { Hourglass, Menu } from 'lucide-react'
import React, { useState } from 'react'
import ImageFormat from './GenSelectors/ImageFormat'
import AspectRatio from './GenSelectors/AspectRatio'
import GenStyles from './GenSelectors/GenStyles'
import SeedSelector from './GenSelectors/SeedSelector'
import GenPromptInput from './GenSelectors/GenPromptInput'
import GenNegativePrompts from './GenSelectors/GenNegativePrompts'
import CreativitySlider from './GenSelectors/CreativitySlider'

interface ImageGenSelectorProps {
    model: ModelProps
    setModel: (model: ModelProps) => void
    aspectRatio: AspectRatioProps
    setAspectRatio: (aspectRatio: AspectRatioProps) => void
    style: string
    setStyle: (style: string) => void
    format: string
    setFormat: (format: string) => void
    generateImage: () => void
    loading: boolean
    error: string | null
    prompt: string
    setPrompt: (prompt: string) => void
    negativePrompt: string
    setNegativePrompt: (negativePrompt: string) => void
    showNegative: boolean
    setShowNegative: (showNegative: boolean) => void
    seedPercentage: number
    setSeedPercentage: (seedPercentage: number) => void
    creativity: number
    setCreativity: (creativity: number) => void

}

function ImageGenSelector({ model, setModel, aspectRatio, setAspectRatio, style, setStyle, format, 
    setFormat, generateImage, loading, error, prompt, setPrompt, negativePrompt, setNegativePrompt, 
    showNegative, setShowNegative, seedPercentage, setSeedPercentage, creativity, setCreativity }: ImageGenSelectorProps) {

    const [promptError, setPromptError] = useState<{ prompt: boolean; negativePrompt: boolean }>({
        prompt: false,
        negativePrompt: false,
    });
    const MAX_CHARACTERS = 10000;

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>, type: "prompt" | "negativePrompt") => {
        const value = e.target.value;
        setPromptError((prev) => ({
            ...prev,
            [type]: value.length > MAX_CHARACTERS, // ✅ Update error state dynamically
        }));

        if (type === "prompt") setPrompt(value);
        else setNegativePrompt(value);
    };
    return (
        <>
            <div className="w-full flex items-center justify-center mb-4">
                {/* Model Selection */}
                <div className="relative">
                    <Menu className="h-8 w-8 mr-4 text-gray-600 cursor-pointer peer" />

                    {/* Tooltip (Hidden by Default, Shown on Hover) */}
                    <div className="absolute left-0 top-10 mb-2 z-20 w-[30vw] p-6 text-l text-white bg-gray-600/80 rounded opacity-0 
            group-hover:opacity-100 transition-opacity duration-200 shadow-lg pointer-events-none peer-hover:opacity-100 ">
                        {models.find((m) => m.model === model.model)?.desc ?? "No description available"}
                    </div>
                </div>
                <select
                    value={model.model}  // ✅ Use the model ID, not the name
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const selectedModel = models.find((m) => m.model === e.target.value);
                        if (selectedModel) setModel(selectedModel); // ✅ Store entire object
                    }}
                    className="items-center p-2 text-center rounded border text-4xl font-bold bg-transparent text-gray-900 focus:outline-none focus:border-transparent"
                >
                    {models.map((m, index) => (
                        <option key={index} value={m.model}>{m.name}</option>
                    ))}
                </select>
            </div>


            
            <div className="mt-2 flex items-center gap-3 justify-evenly w-full">
                {/* Format Selection */}
                {["core", "ultra", "upscale1", "upscale3"].includes(model.model) && "upscale1" && <ImageFormat format={format} setFormat={setFormat} formats={formats} />}                
                {/* Aspect Ratio Selection */}
                {["core", "ultra"].includes(model.model) && <AspectRatio aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} />}
                {/* Style Selection */}
                {["core", "ultra", "upscale3"].includes(model.model) && <GenStyles style={style} setStyle={setStyle} />  }    
                {/*Creativity Slider*/}
            </div>
            <div className='flex gap-4'>
            {["upscale2", "upscale3"].includes(model.model) && <CreativitySlider creativity={creativity} setCreativity={setCreativity} />}
            {/* Seed Slider */}
            {["core", "ultra", "upscale2", "upscale3"].includes(model.model) && <SeedSelector seedPercentage={seedPercentage} setSeedPercentage={setSeedPercentage} />}
                    </div>

            {/* Prompt Input */}
            <GenPromptInput prompt={prompt} setPrompt={setPrompt} promptError={promptError} handleInputChange={handleInputChange} />
            {["core", "ultra", "upscale2", "upscale3"].includes(model.model) && <GenNegativePrompts showNegative={showNegative} setShowNegative={setShowNegative} negativePrompt={negativePrompt} promptError={promptError} handleInputChange={handleInputChange} />}
            <div className="flex items-center justify-center">

                <button
                    onClick={generateImage}
                    disabled={loading}
                    className="text-white bg-main hover:text-main text-xl hover:bg-red-50 rounded-full w-fit mt-4 px-8 py-3 flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <Hourglass className="animate-pulse h-5 w-5 text-yellow-500" /> {/* ✅ Hourglass effect */}
                            <span>Generating...</span>
                        </>
                    ) : (
                        "Generate Image"
                    )}
                </button>

            </div>
            {/* Error Message */}
            {error && <p className="mt-4 text-red-500">{error}</p>}
        </>
    )
}

export default ImageGenSelector