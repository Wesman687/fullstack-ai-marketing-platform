import { validateUrl } from '@/app/utils/validateUrl';
import React, { useState } from 'react';
import { CrawlConfigInterface } from '../ScraperForm';

interface BulkUrlProps {
    crawlConfig: CrawlConfigInterface;
    handleInputChange: (key: keyof CrawlConfigInterface, value: any) => void;
}

function BulkUrl({ crawlConfig, handleInputChange }: BulkUrlProps) {
    const [isBulkInputOpen, setIsBulkInputOpen] = React.useState(false);
    const [bulkInput, setBulkInput] = useState('');
    const [error, setError] = useState<string>(''); // ✅ URL Validation Error State
    const [newUrl, setNewUrl] = useState('');

    const addUrl = () => {
        if (!validateUrl(newUrl)) {
            setError('❌ Invalid URL. Please enter a valid URL.');
            return;
        }

        handleInputChange('urls', [...crawlConfig.urls, newUrl]);
        
        setNewUrl(''); // Clear input
        setError(''); // Clear error
    };

    // ✅ Remove URL
    const removeUrl = (index: number) => {
        handleInputChange("urls", crawlConfig.urls.filter((_, i) => i !== index)); 
    };

    const addBulkUrls = () => {
        const parsedUrls = bulkInput
            .split(/[\n,]+/) // Split by newline or comma
            .map((url: string) => url.trim())
            .filter((url: string) => url !== '' && validateUrl(url)); // ✅ Validate URLs

        if (parsedUrls.length === 0) {
            setError('❌ No valid URLs found. Please check your input.');
            return;
        }

        handleInputChange('urls', [...crawlConfig.urls, ...parsedUrls]);
        setBulkInput('');
        setIsBulkInputOpen(false);
        setError('');
    };

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
            {crawlConfig.urls.length > 1 && (
                <ul className="mt-3">
                    {crawlConfig.urls.slice(1).map((url, index) => (
                        <li key={index} className="flex justify-between bg-gray-100 p-2 rounded mb-1">
                            <span>{url}</span>
                            <button
                                onClick={() => removeUrl(index + 1)}
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
