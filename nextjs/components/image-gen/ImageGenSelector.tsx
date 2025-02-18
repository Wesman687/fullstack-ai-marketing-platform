import { AspectRatioProps, aspectRatios, formats, ModelProps, models, styles } from '@/lib/imageprops'
import { Menu } from 'lucide-react'
import React, { useState } from 'react'

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

}

function ImageGenSelector({ model, setModel, aspectRatio, setAspectRatio, style, setStyle, format, setFormat, generateImage, loading, error, prompt, setPrompt, negativePrompt, setNegativePrompt, showNegative, setShowNegative, seedPercentage, setSeedPercentage }: ImageGenSelectorProps) {

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
                    className="items-center p-2 rounded border text-4xl font-bold bg-transparent text-gray-900 focus:outline-none focus:border-transparent"
                >
                    {models.map((m) => (
                        <option key={m.model} value={m.model}>{m.name}</option>
                    ))}
                </select>
            </div>

            {/* Format Selection */}
            <div className="mt-2 flex items-center gap-3 justify-evenly w-full">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-nowrap">Image Format:</h3>
                    <select
                        value={format}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormat(e.target.value)}
                        className="p-1 rounded-l border bg-slate-100 text-gray-900 focus:outline-none focus:border-transparent"
                    >
                        {formats.map((fmt) => (
                            <option key={fmt} value={fmt}>
                                {fmt.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-nowrap">Aspect Ratio:</h3>
                    <select
                        value={aspectRatio.ratio}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            const selectedRatio = aspectRatios.find((ar) => ar.ratio === e.target.value);
                            if (selectedRatio) setAspectRatio(selectedRatio);
                        }}
                        className="border bg-slate-100 rounded p-1 text-gray-900 focus:outline-none focus:border-transparent text-center"
                    >
                        {aspectRatios.map((ar) => (
                            <option key={ar.ratio} value={ar.ratio}>
                                {ar.ratio}
                            </option>
                        ))}
                    </select>

                    {/* Tooltip with Description on Hover */}
                    <div className="relative">
                        {/* Menu Icon (Trigger) */}
                        <Menu className="h-6 w-6 ml-2 text-gray-600 cursor-pointer peer" />

                        {/* Tooltip (Only appears when hovering over the Menu icon) */}
                        <div className="absolute left-0 bottom-full mb-2 w-[20vw] p-4 text-sm text-white bg-gray-600/80 rounded opacity-0 
    peer-hover:opacity-100 transition-opacity duration-200 shadow-lg pointer-events-none">
                            {aspectRatio.desc}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-nowrap">Select Style:</h3>
                    <select
                        value={style}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStyle(e.target.value)}
                        className="border bg-slate-100 rounded-l p-1 text-gray-900 focus:outline-none focus:border-transparent text-center"
                    >
                        {styles.map((s) => (
                            <option key={s} value={s}>
                                {s.replace("-", " ").toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>

            </div>


            {/* Generate Button */}
            {/* Seed Slider */}
            <div className="flex w-full items-center mt-4">
                <h3 className="text-lg font-semibold text-nowrap mr-5 text-gray-700">Randomness: {seedPercentage}%</h3>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={seedPercentage}
                    onChange={(e) => setSeedPercentage(Number(e.target.value))}
                    className="h-2 w-full bg-gray-300 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            {/* Prompt Input */}
            <textarea
                placeholder="Enter your prompt..."
                value={prompt}
                onChange={(e) => handleInputChange(e, "prompt")}
                className="w-full p-2 mt-4 rounded border focus:outline-none focus:border-transparent"
            />
            {promptError.prompt && (
                <p className="text-red-500 text-sm mt-1">Prompt exceeds 10,000 characters!</p>
            )}
            <div className="">
                <button
                    className="text-sm text-gray-700 hover:underline text-center w-full"
                    onClick={() => setShowNegative(!showNegative)}
                >
                    {showNegative ? "Hide" : "Show"} Negative Prompt - (describe what you do not wish to see)
                </button>
                {showNegative && (
                    <>
                        <textarea
                            placeholder="Enter negative prompt..."
                            value={negativePrompt}
                            onChange={(e) => handleInputChange(e, "negativePrompt")}
                            className="w-full p-2 mt-2 rounded border focus:outline-none focus:border-transparent"
                        />
                        {promptError.negativePrompt && (
                            <p className="text-red-500 text-sm mt-1">Negative prompt exceeds 10,000 characters!</p>
                        )}
                    </>
                )}

            </div>
            <div className="flex items-center justify-center">

                <button
                    onClick={generateImage}
                    disabled={loading}
                    className="text-white bg-main hover:text-main text-xl hover:bg-red-50 rounded-full w-fit mt-4 px-8 py-3"
                >
                    {loading ? "Generating..." : "Generate Image"}
                </button>

            </div>
            {/* Error Message */}
            {error && <p className="mt-4 text-red-500">{error}</p>}
        </>
    )
}

export default ImageGenSelector