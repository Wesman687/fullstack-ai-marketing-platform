import { validateUrl } from '@/app/utils/validateUrl';
import React, { useEffect, useState } from 'react'
import { CrawlConfigInterface } from '../ScraperForm';
interface ScraperUrlInputProps {
    setUrl: React.Dispatch<React.SetStateAction<CrawlConfigInterface['url']>>;
    tempUrl: string;
    typing: boolean;
    setTyping: React.Dispatch<React.SetStateAction<boolean>>;
    handleUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function ScraperUrlInput({  setUrl, tempUrl,  typing, setTyping, handleUrlChange }: ScraperUrlInputProps) {

    const [urlError, setUrlError] = useState('');
    useEffect(() => {
        if (!typing) return;

        const timer = setTimeout(() => {
            if (validateUrl(tempUrl)) {
                setUrl(tempUrl);
                setUrlError('');
            } else {
                setUrlError('❌ Invalid URL. Please enter a valid URL.');
            }
            setTyping(false);
        }, 500); // Wait for 500ms after the user stops typing

        return () => clearTimeout(timer); // Cleanup the timeout
    }, [tempUrl, typing]);

    // ✅ Handle Input Change
    
    return (
        <>
            <h3 className="font-semibold mt-4">Primary URL</h3>
            <input
                type="text"
                placeholder="Https:// valid Url"
                value={tempUrl}
                onChange={(e) => handleUrlChange(e)}
                className="border rounded p-2 w-full mt-3"
            />
            {urlError && <p className="text-red-500 text-sm">{urlError}</p>}
        </>
    )
}

export default ScraperUrlInput