import React from 'react'
interface GenNegativePromptsProps {
    negativePrompt: string
    showNegative: boolean
    setShowNegative: (showNegative: boolean) => void
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>, type: "prompt" | "negativePrompt") => void
    promptError: { prompt: boolean; negativePrompt: boolean }
}
function GenNegativePrompts({ negativePrompt, showNegative, setShowNegative, handleInputChange, promptError }: GenNegativePromptsProps) {

  return (
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
  )
}

export default GenNegativePrompts