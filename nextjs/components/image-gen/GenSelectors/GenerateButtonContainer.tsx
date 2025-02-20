import { Hourglass } from 'lucide-react'
import React from 'react'
interface GenerateButtonContainerProps {
    handleGenerateImage: () => void
    loading: boolean
}
function GenerateButtonContainer({ handleGenerateImage, loading }: GenerateButtonContainerProps) {
  return (
    <div className="flex items-center justify-center">
                <button
                    onClick={handleGenerateImage}
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
  )
}

export default GenerateButtonContainer