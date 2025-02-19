import { AspectRatioProps, aspectRatios } from '@/lib/imageprops'
import { Menu } from 'lucide-react'
import React from 'react'

interface AspectRatioPageProps {
    aspectRatio:  AspectRatioProps
    setAspectRatio: (aspectRatio: AspectRatioProps) => void
}

function AspectRatio({ aspectRatio, setAspectRatio }: AspectRatioPageProps) {
  return (
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
  )
}

export default AspectRatio