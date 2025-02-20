import { DirectionalModel } from '@/lib/imageprops'
import React from 'react'

interface DirectionContainerProps {
    directions: DirectionalModel
    setDirections: (directions: DirectionalModel) => void
}

function DirectionContainer({ directions, setDirections }: DirectionContainerProps) {
    return (
        <div className='flex gap-4 w-full'>
            {Object.entries(directions).map(([key, value]) => (
                <div key={key} className='flex flex-col gap-2 w-full p-4'>
                    <h3 className='text-lg font-semibold text-gray-700 capitalize'>{key}: {value}</h3>
                    <input
                        type='range'
                        min='0'
                        max='2000'
                        step='1'
                        value={value}
                        onChange={(e) => {
                            setDirections({
                                ...directions,
                                [key]: parseInt(e.target.value) // ✅ Update the specific property
                            });
                        }}
                        className='h-2 w-full bg-gray-300 rounded-lg appearance-none cursor-pointer'
                    />
                </div>
            ))}
        </div>
    )
}

export default DirectionContainer;
