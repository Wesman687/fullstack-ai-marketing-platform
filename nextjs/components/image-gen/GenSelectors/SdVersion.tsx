import { versions } from '@/lib/imageprops'
import React from 'react'
interface SdVersionProps {
    version: string
    setVersion: (version: string) => void
}

function SdVersion({ version, setVersion }: SdVersionProps) {
  return (
    <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-nowrap">Select Models:</h3>
                <select
                    value={version}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVersion(e.target.value)}
                    className="border bg-slate-100 rounded-l p-1 text-gray-900 focus:outline-none focus:border-transparent text-center"
                >
                    {versions.map((s) => (
                        <option key={s} value={s}>
                            {s.replace("-", " ").toUpperCase()}
                        </option>
                    ))}
                </select>
            </div>
  )
}

export default SdVersion