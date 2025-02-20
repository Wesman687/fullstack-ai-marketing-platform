import { Switch } from '@headlessui/react'
import React from 'react'
interface EnableSuggestionsProps {
    setEnableSuggestions: (enableSuggestions: boolean) => void
    enableSuggestions: boolean
}
function EnableSuggestions({ setEnableSuggestions, enableSuggestions }: EnableSuggestionsProps) {
    return (
        <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-700">AI Suggestions</span>
            <Switch
                checked={enableSuggestions}
                onChange={setEnableSuggestions}
                className={`${enableSuggestions ? "bg-green-500" : "bg-gray-400"
                    } relative inline-flex h-6 w-11 items-center rounded-full transition`}
            >
                <span className="sr-only">Enable AI Suggestions</span>
                <span
                    className={`${enableSuggestions ? "translate-x-6" : "translate-x-1"
                        } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                />
            </Switch>
        </div>
    )
}

export default EnableSuggestions