import { styles } from '@/lib/imageprops'
import React from 'react'

interface GenStylesProps {
    style: string
    setStyle: (style: string) => void
}

function GenStyles({ style, setStyle }: GenStylesProps) {
    return (
        <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-nowrap">Select Style:</h3>
            <select
                value={style}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStyle(e.target.value)}
                className="border bg-slate-100 rounded-l p-1 text-gray-900 focus:outline-none focus:border-transparent text-center"
            >
                {styles.map((s) => (
                    <option key={s} value={s}>
                        {s.replace("-", " ").toUpperCase()}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default GenStyles