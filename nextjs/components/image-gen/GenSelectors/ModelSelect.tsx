import { ModelProps, models } from '@/lib/imageprops';
import { Menu } from 'lucide-react';
import React from 'react'

interface ModelSelectProps {
        model: ModelProps
        setModel: (model: ModelProps) => void
}

function ModelSelect({ model, setModel }: ModelSelectProps) {

  return (
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
                    className="items-center p-2 text-center rounded border text-4xl font-bold bg-transparent text-gray-900 focus:outline-none focus:border-transparent"
                >
                    {models.map((m, index) => (
                        <option key={index} value={m.model}>{m.name}</option>
                    ))}
                </select>
            </div>
  )
}

export default ModelSelect