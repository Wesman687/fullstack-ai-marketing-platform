import React from 'react'
interface GrowMaskProps {
    growMask: number
    setGrowMask: (growMask: number) => void
}
function GrowMask({ growMask, setGrowMask }: GrowMaskProps) {

  return (
    <div className="flex w-full items-center mt-4">
            <h3 className="text-lg font-semibold text-nowrap mr-5 text-gray-700">Grow Mask: {growMask}</h3>
            <input
                type="range"
                min="0"
                max="20"
                value={growMask}
                onChange={(e) => setGrowMask(Number(e.target.value))}
                className="h-2 w-full bg-gray-300 rounded-lg appearance-none cursor-pointer"
            />
        </div>
  )
}

export default GrowMask