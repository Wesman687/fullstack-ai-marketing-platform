'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import PaginationSettings from './PaginationSettings';
import CrawlHistory from './CrawlHistory';
import BulkUrl from './scraperInput/BulkUrl';
import ScraperFields from './scraperInput/ScraperFields';
import { validateUrl } from '@/app/utils/validateUrl';
import ScraperUrlInput from './scraperInput/ScraperUrlInput';

interface ScraperFormProps {
    mode: 'crawl' | 'scrape';
}

export default function ScraperForm({ mode }: ScraperFormProps) {
    const isScraper = mode === 'scrape';
    const [urls, setUrls] = useState<string[]>(['']); // Multiple URLs for Scrape, Single for Crawl
    const [selector, setSelector] = useState<string>("");
    const [name, setName] = useState('');
    const [userId, setUserId] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [customSelector, setCustomSelector] = useState('');
    const [tag, setTag] = useState('');
    const [fields, setFields] = useState<string[]>([]);
    const [sheetId, setSheetId] = useState('');
    const [paginationMethod, setPaginationMethod] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [url, setUrl] = useState('');

    // ✅ Fetch User ID
    useEffect(() => {
        setLoading(true);
        const fetchUserId = async () => {
            try {
                const { data } = await axios.get('/api/user');
                setUserId(data.userId);
            } catch (error) {
                console.error('❌ Error fetching user ID:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserId();
    }, []);

    // ✅ Add Selector

    // ✅ Start Crawling/Scraping
    const startProcessing = async () => {
        if (urls.some((url) => !url)) {
            toast.error('❌ Please enter a URL and at least one selector.');
            return;
        }
        setIsProcessing(true);
        try {
            const payload = {
                userId,
                name,
                tag,
                fields,
                urls,
                selector,
                paginationMethod,
                sheetId,
                customSelector,
            };

            await axios.post(`${process.env.NEXT_PUBLIC_API}/${mode}/start`, payload);
            toast.success(`${mode === 'crawl' ? 'Crawling' : 'Scraping'} started! Data will be available soon.`);
        } catch (error) {
            console.error(`❌ ${mode} failed:`, error);
            toast.error(`${mode} request failed.`);
        } finally {
            setIsProcessing(false);
        }
    };

    // ✅ Clear Data
    const clearData = () => {
        setUrls(['']);
        setSelector("");
        setName('');
        setCustomSelector('');
        setPaginationMethod('');
        setSheetId('');
        setFields([]);
        setTag('');
        setUrl('');
    };

    // ✅ Bulk Add URLs
    return (
        <>
            <div className="p-4 max-w-3xl mx-auto bg-white rounded-lg shadow-md">
                <PaginationSettings paginationMethod={paginationMethod} setPaginationMethod={setPaginationMethod} url={url} />
                <h1 className="text-xl font-bold">{isScraper ? '🖥️ Browser Scraper' : '🌐 Smart Web Crawler'}</h1>
                <ScraperUrlInput url={url} setUrl={setUrl} />
                {mode === "scrape" && ( <BulkUrl newUrl={newUrl} setNewUrl={setNewUrl} urls={urls} setUrls={setUrls} />)}
                <input
                    type="text"
                    placeholder={`Enter ${mode} Name (Optional)`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border rounded p-2 w-full mt-3"
                />
                <input
                    type="text"
                    placeholder="Google Sheet ID (Premium Feature)"
                    value={sheetId}
                    onChange={(e) => setSheetId(e.target.value)}
                    className="border rounded p-2 w-full mt-3"
                />

                {/* 🔹 Custom Selector & Pagination */}
                <input
                    type="text"
                    placeholder="Custom CSS Selector (optional)"
                    value={customSelector}
                    onChange={(e) => setCustomSelector(e.target.value)}
                    className="border rounded p-2 w-full mt-3"
                />

                {/* 🎯 Selectors Input */}
                <div className="flex items-center mt-3 mb-4">
                    <input
                        type="text"
                        placeholder="CSS Selector (e.g., .title)"
                        value={selector}
                        onChange={(e) => setSelector(e.target.value)}
                        className="border rounded p-2 flex-grow"
                    />
                </div>

                <ScraperFields fields={fields} setFields={setFields} />
                {/* 🚀 Start & Clear Buttons (Side by Side) */}
                {/* 🚀 Start & Clear Buttons (Side by Side) */}
                <div className="flex justify-center gap-6 mt-4">
                    <button
                        onClick={startProcessing}
                        className="bg-blue-600 text-white px-3 py-2 rounded transition duration-300 hover:bg-blue-700 hover:scale-105 active:scale-95"
                        disabled={isProcessing}
                    >
                        {isProcessing ? `${isScraper ? 'Scraping...' : 'Crawling...'} 🔄` : `Start ${isScraper ? 'Scraping' : 'Crawling'} 🚀`}
                    </button>

                    <button
                        onClick={clearData}
                        className="bg-red-500 text-white px-16 py-2 rounded transition duration-300 hover:bg-red-600 hover:scale-105 active:scale-95"
                    >
                        🗑 Clear
                    </button>
                </div>

            </div>
            {!loading && <CrawlHistory setUrl={setUrl} setName={setName} setTag={setTag} setFields={setFields} />}
        </>
    );
}
