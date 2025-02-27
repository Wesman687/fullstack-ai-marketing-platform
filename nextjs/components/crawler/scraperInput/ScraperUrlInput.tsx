import { validateUrl } from '@/app/utils/validateUrl';
import test from 'node:test';
import React, { useEffect, useState } from 'react'
interface ScraperUrlInputProps {
    url: string;
    setUrl: React.Dispatch<React.SetStateAction<string>>;
}

function ScraperUrlInput({ url, setUrl }: ScraperUrlInputProps) {

    const [tempUrl, setTempUrl] = useState(''); // Temporary URL while typing
    const [urlError, setUrlError] = useState('');
    const [typing, setTyping] = useState(false);
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
    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTempUrl(e.target.value);
        setTyping(true);
    };
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