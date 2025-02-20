import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface PromptSuggestionsProps {
    setPrompt: (prompt: string) => void;
    suggestion: string | null;
    setShowSuggestion: (showSuggestion: boolean) => void;
    showSuggestion: boolean;
    enableSuggestions: boolean;
    setEnableSuggestions: (enableSuggestions: boolean) => void;
}

const PromptSuggestions = ({  setPrompt, suggestion,  setShowSuggestion, showSuggestion, enableSuggestions }: PromptSuggestionsProps ) => {// ✅ Toggle suggestions
    const suggestionRef = useRef<HTMLDivElement>(null);

    

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
                console.log("Click detected outside suggestion box. Closing it.");
                setShowSuggestion(false);
            } else {
                console.log("Click detected inside suggestion box. Keeping it open.");
            }
        }

        if (showSuggestion) {
            console.log("Adding event listener for click detection.");
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            console.log("Removing event listener for click detection.");
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showSuggestion]);
    return (
        <div className="relative w-full">
            {/* ✅ Prompt Input */}

            {/* ✅ AI Suggestion Box */}
            {showSuggestion && suggestion && enableSuggestions && (
                <motion.div
                    ref={suggestionRef}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-1/2 transform -translate-x-1/2 mt-2 p-4 w-[90%] sm:w-2/3 md:w-1/2 bg-white border border-gray-300 shadow-lg rounded-lg backdrop-blur-md z-50"
                >
                    <p className="text-gray-800 font-semibold text-center">AI Suggestion:</p>
                    <p className="text-gray-600 text-sm mt-2 text-center">{suggestion}</p>

                    <div className="flex justify-center space-x-4 mt-4">
                        {/* ✅ Accept Suggestion */}
                        <button
                            onClick={() => {
                                setPrompt(suggestion);
                                setShowSuggestion(false);
                            }}
                            className="px-5 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-700 transition-all"
                        >
                            Accept
                        </button>

                        {/* ✅ Decline Suggestion */}
                        <button
                            onClick={() => setShowSuggestion(false)}
                            className="px-5 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-700 transition-all"
                        >
                            Decline
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default PromptSuggestions;
