import React from 'react'
interface ImageFormatProps {
    format: string
    setFormat: (format: string) => void
    formats: string[]
}
function ImageFormat({ format, setFormat, formats }: ImageFormatProps) {

    return (

        <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-nowrap">Image Format:</h3>
            <select
                value={format}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormat(e.target.value)}
                className="p-1 rounded-l border bg-slate-100 text-gray-900 focus:outline-none focus:border-transparent"
            >
                {formats.map((fmt) => (
                    <option key={fmt} value={fmt}>
                        {fmt.toUpperCase()}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default ImageFormat