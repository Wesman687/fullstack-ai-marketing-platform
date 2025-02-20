import { AspectRatioProps, formats, ModelProps } from '@/lib/imageprops'
import React, { useState } from 'react'
import ImageFormat from './GenSelectors/ImageFormat'
import AspectRatio from './GenSelectors/AspectRatio'
import GenStyles from './GenSelectors/GenStyles'
import SeedSelector from './GenSelectors/SeedSelector'
import GenPromptInput from './GenSelectors/GenPromptInput'
import GenNegativePrompts from './GenSelectors/GenNegativePrompts'
import CreativitySlider from './GenSelectors/CreativitySlider'
import SdVersion from './GenSelectors/SdVersion'
import axios from 'axios'
import PromptSuggestions from './GenSelectors/PromptSuggestions'
import ModelSelect from './GenSelectors/ModelSelect'
import GenerateButtonContainer from './GenSelectors/GenerateButtonContainer'
import EnableSuggestions from './GenSelectors/EnableSuggestions'
import GrowMask from './GenSelectors/GrowMask'

interface ImageGenSelectorProps {
    model: ModelProps
    setModel: (model: ModelProps) => void
    aspectRatio: AspectRatioProps
    setAspectRatio: (aspectRatio: AspectRatioProps) => void
    style: string
    setStyle: (style: string) => void
    format: string
    setFormat: (format: string) => void
    handleGenerateImage: () => void
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
    version: string
    setVersion: (version: string) => void
    growMask: number
    setGrowMask: (growMask: number) => void

}

function ImageGenSelector({ model, setModel, aspectRatio, setAspectRatio, style, setStyle, format,
    setFormat, handleGenerateImage, loading, error, prompt, setPrompt, negativePrompt, setNegativePrompt,
    showNegative, setShowNegative, seedPercentage, setSeedPercentage, creativity, setCreativity, version, setVersion,
growMask, setGrowMask }: ImageGenSelectorProps) {
    const [promptError, setPromptError] = useState<{ prompt: boolean; negativePrompt: boolean }>({
        prompt: false,
        negativePrompt: false,
    });
    const MAX_CHARACTERS = 10000;
    const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [enableSuggestions, setEnableSuggestions] = useState(true);
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [negSuggestion, setNegSuggestion] = useState<string | null>(null);
    const [showNegSuggestion, setShowNegSuggestion] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>, type: "prompt" | "negativePrompt") => {
        const value = e.target.value;
        setPromptError(prev => ({
            ...prev,
            [type]: value.length > MAX_CHARACTERS,
        }));

        if (type === "prompt") setPrompt(value);
        else setNegativePrompt(value);

        // ✅ Reset AI suggestion state
        setShowSuggestion(false);
        setSuggestion(null);

        // ✅ Clear existing timeout to avoid multiple API calls
        if (typingTimer) clearTimeout(typingTimer);

        // ✅ Set new timeout for fetching AI suggestion
        const newTimer = setTimeout(() => {
            if (value.length > 5) getAISuggestion(value, type);
        }, 2000); // Wait for 2 seconds of inactivity

        setTypingTimer(newTimer);
    };

    // ✅ Function to fetch AI-generated prompt suggestions
    const getAISuggestion = async (currentPrompt: string, type: "prompt" | "negativePrompt") => {
        if (enableSuggestions) {
            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_API_IMAGE_GEN}/image/generate-prompt-hint`, { prompt: currentPrompt, type });
                if (response.data.improved_prompt) {
                    if (type === "prompt") {
                        setSuggestion(response.data.improved_prompt);
                        setShowSuggestion(true);
                    } else {
                        setNegSuggestion(response.data.improved_prompt);
                        setShowNegSuggestion(true);
                    }
                }
            } catch (error) {
                console.error("Error fetching AI suggestion:", error);
            }
        }
    };
    return (
        <>        
            {/* ✅ Toggle AI Suggestions */}
            <EnableSuggestions enableSuggestions={enableSuggestions} setEnableSuggestions={setEnableSuggestions} />            
            <ModelSelect model={model} setModel={setModel} />

            <div className="mt-2 flex items-center gap-3 justify-evenly w-full">
                {/* Format Selection */}
                {["core", "ultra", "fast", "creative", "sd3", "conservative", "erase", "inpaint"].includes(model.model) && "upscale1" && <ImageFormat format={format} setFormat={setFormat} formats={formats} />}
                {/* Aspect Ratio Selection */}
                {["core", "ultra"].includes(model.model) && <AspectRatio aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} />}
                {/* Style Selection */}
                {["core", "ultra", "creative", "sd3", "inpaint"].includes(model.model) && <GenStyles style={style} setStyle={setStyle} />}
                {/* SD3 Versions*/}
                {["sd3"].includes(model.model) && <SdVersion version={version} setVersion={setVersion} />}
            </div>
            <div className='flex gap-4'>
                {/*Creativity Slider*/}
                {["conservative", "creative"].includes(model.model) && <CreativitySlider creativity={creativity} setCreativity={setCreativity} />}
                {/* Seed Slider */}
                {["core", "ultra", "conservative", "creative", "sd3", "erase", "inpaint"].includes(model.model) && <SeedSelector seedPercentage={seedPercentage} setSeedPercentage={setSeedPercentage} />}
                {/* Grow Mask */}
                {["erase", "inpaint"].includes(model.model) && <GrowMask growMask={growMask} setGrowMask={setGrowMask} />}
            </div>

            {/* Prompt Input */}
            <GenPromptInput prompt={prompt} setPrompt={setPrompt} promptError={promptError} handleInputChange={handleInputChange} />
            {/* Negative Prompt Input */}
            {["core", "ultra", "conservative", "creative", "sd3", "inpaint"].includes(model.model) && <GenNegativePrompts showNegative={showNegative} setShowNegative={setShowNegative} negativePrompt={negativePrompt} promptError={promptError} handleInputChange={handleInputChange} />}
            

            {/* AI Prompt Suggestions */}
            <PromptSuggestions  suggestion={suggestion} showSuggestion={showSuggestion} setShowSuggestion={setShowSuggestion} 
            enableSuggestions={enableSuggestions} setPrompt={setPrompt} setEnableSuggestions={setEnableSuggestions} 
            />
            {/* AI Negative Prompt Suggestions */}
            <PromptSuggestions  
                suggestion={negSuggestion} 
                showSuggestion={showNegSuggestion} 
                setShowSuggestion={setShowNegSuggestion} 
                enableSuggestions={enableSuggestions} 
                setPrompt={setNegativePrompt} // ✅ Set negative prompt instead
                setEnableSuggestions={setEnableSuggestions} 
            />
            <GenerateButtonContainer handleGenerateImage={handleGenerateImage} loading={loading} />

            {/* Error Message */}
            {error && <p className="mt-4 text-red-500">{error}</p>}
        </>
    )
}

export default ImageGenSelector