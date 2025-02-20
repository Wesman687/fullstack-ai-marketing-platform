import React from 'react'
interface GenPromptInputProps {
    prompt: string
    setPrompt: (prompt: string) => void
    promptError: { prompt: boolean; negativePrompt: boolean }
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>, type: "prompt" | "negativePrompt") => void
}

function GenPromptInput({ prompt, promptError, handleInputChange }: GenPromptInputProps) {
    
    return (
        <>
            <textarea
                placeholder="Enter your prompt..."
                value={prompt}
                onChange={(e) => handleInputChange(e, "prompt")}
                className="w-full p-2 mt-4 rounded border focus:outline-none focus:border-transparent"
            />
            {
                promptError.prompt && (
                    <p className="text-red-500 text-sm mt-1">Prompt exceeds 10,000 characters!</p>
                )
            }
        </>
    )
}

export default GenPromptInput