import React from 'react'

interface SeedSelectorProps {
    seedPercentage: number
    setSeedPercentage: (seedPercentage: number) => void
}

function SeedSelector({ seedPercentage, setSeedPercentage }: SeedSelectorProps) {
    return (
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
    )
}

export default SeedSelector