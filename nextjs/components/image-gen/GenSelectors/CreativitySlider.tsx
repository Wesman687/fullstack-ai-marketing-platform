import { Menu } from 'lucide-react'
import React from 'react'
interface CreativitySliderProps {
    creativity: number
    setCreativity: (creativity: number) => void
}
function CreativitySlider({ creativity, setCreativity }: CreativitySliderProps) {

    return (
        <div className="flex w-full items-center mt-4">
            
            <div className="relative">
                        {/* Menu Icon (Trigger) */}
                        <Menu className="h-6 w-6 ml-2 text-gray-600 cursor-pointer peer mr-4" />

                        {/* Tooltip (Only appears when hovering over the Menu icon) */}
                        <div className="absolute left-0 bottom-full mb-2 w-[20vw] p-4 text-sm text-white bg-gray-600/80 rounded opacity-0 
    peer-hover:opacity-100 transition-opacity duration-200 shadow-lg pointer-events-none">
                            Controls the likelihood of creating additional details not heavily conditioned by the init image. 
                        </div>
                    </div>
            <h3 className="text-lg font-semibold text-nowrap mr-5 text-gray-700">Creativity: {creativity}</h3>
            <input
                type="range"
                min="0.2"
                max="0.5"
                step="0.01"
                value={creativity}
                onChange={(e) => setCreativity(parseFloat(e.target.value))}
                className="h-2 w-full bg-gray-300 rounded-lg appearance-none cursor-pointer"
            />
        </div>
    )
}

export default CreativitySlider