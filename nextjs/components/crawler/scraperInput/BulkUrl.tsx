import { validateUrl } from '@/app/utils/validateUrl';
import React, { useCallback, useState } from 'react';
import { CrawlConfigInterface } from '../ScraperForm';

interface BulkUrlProps {
    crawlConfig: CrawlConfigInterface;
    setCrawlConfig: React.Dispatch<React.SetStateAction<CrawlConfigInterface>>;
}

function BulkUrl({ crawlConfig, setCrawlConfig }: BulkUrlProps) {
    const [isBulkInputOpen, setIsBulkInputOpen] = React.useState(false);
    const [bulkInput, setBulkInput] = useState('');
    const [error, setError] = useState<string>(''); // ✅ URL Validation Error State
    const [newUrl, setNewUrl] = useState('');

    const addUrl = useCallback(() => {
        if (!validateUrl(newUrl)) {
            setError('❌ Invalid URL. Please enter a valid URL.');
            return;
        }
    
        setCrawlConfig(prev => {
            const updatedUrls = [...prev.urls, newUrl];
            console.log("Updated URLs after adding:", updatedUrls);  // ✅ Debugging log
            return { ...prev, urls: updatedUrls };
        });
    
        setNewUrl(''); // Clear input
        setError(''); // Clear error
    }, [newUrl, setCrawlConfig]);

    // ✅ Remove URL
    const removeUrl = useCallback((index: number) => {
        setCrawlConfig(prev => {
            const updatedUrls = prev.urls.filter((_, i) => i !== index);
            console.log("Updated URLs after removal:", updatedUrls); // ✅ Debugging log
            return { ...prev, urls: updatedUrls };
        });
    }, [setCrawlConfig]);
    const addBulkUrls = useCallback(() => {
        const parsedUrls = bulkInput
            .split(/[\n,]+/) // Split by newline or comma
            .map(url => url.trim())
            .filter(url => url !== '' && validateUrl(url)); // ✅ Validate URLs
    
        if (parsedUrls.length === 0) {
            setError('❌ No valid URLs found. Please check your input.');
            return;
        }
    
        setCrawlConfig(prev => {
            const updatedUrls = [...prev.urls, ...parsedUrls];
            return { ...prev, urls: updatedUrls };
        });
    
        setBulkInput('');
        setIsBulkInputOpen(false);
        setError('');
    }, [bulkInput, setCrawlConfig]);

    return (
        <>
            <h3 className="font-semibold mt-4">Additional URLs</h3>
            <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                    type="text"
                    placeholder="Enter additional URL..."
                    value={newUrl}
                    onChange={(e) =>
                        setNewUrl(e.target.value)
                    }
                    className="border rounded p-2 flex-grow"
                />
                <button
                    onClick={addUrl}
                    className="bg-green-500 text-white text-2xl px-4 py-1 rounded"
                >
                    +
                </button>
                {/* Bulk Add URLs */}
                <button
                    onClick={() => setIsBulkInputOpen(!isBulkInputOpen)}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    📋 Bulk Add URLs
                </button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}

            {isBulkInputOpen && (
                <div className="mt-2">
                    <textarea
                        placeholder="Paste URLs (comma or newline separated)"
                        value={bulkInput}
                        onChange={(e) => setBulkInput(e.target.value)}
                        className="border rounded p-2 w-full h-24"
                    />
                    <button
                        onClick={addBulkUrls}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Add URLs from List ➡️
                    </button>
                </div>
            )}
            {/* Display Additional URLs */}
            {crawlConfig.urls.length > 0 && (
                <ul className="mt-3">
                    {crawlConfig.urls.map((url, index) => (
                        <li key={index} className="flex justify-between bg-gray-100 p-2 rounded mb-1">
                            <span>{url}</span>
                            <button
                                onClick={() => removeUrl(index)}
                                className="text-red-500"
                            >
                                ❌
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}

export default BulkUrl;
