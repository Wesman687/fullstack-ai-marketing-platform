'use client';
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import PaginationSettings, { PaginationMethods } from './PaginationSettings';
import CrawlHistory from './CrawlHistory';
import BulkUrl from './scraperInput/BulkUrl';
import ScraperFields from './scraperInput/ScraperFields';
import ScraperUrlInput from './scraperInput/ScraperUrlInput';

interface ScraperFormProps {
    mode: 'crawl' | 'scrape';
}
export interface PaginationInterface {
    [key: string]: {
        name: string;
        desc: string;
    }
}
export interface CrawlConfigInterface {
    urls: string[];
    name: string;
    customSelector: string;
    tag: string;
    fields: string[];
    sheetId: string;
    paginationMethod: keyof PaginationInterface;
    url: string;
    pages: number;
    userId: string;
}

export default function ScraperForm({ mode }: ScraperFormProps) {
    const isScraper = mode === 'scrape';
    const [crawlConfig, setCrawlConfig] = useState({
        urls: [''], // Multiple URLs for Scrape, Single for Crawl
        name: '',
        customSelector: '',
        tag: '',
        fields: [] as string[],
        sheetId: '',
        paginationMethod: 'NO_PAGINATION' as keyof PaginationInterface,
        url: '',
        pages: 5,
        userId: '',
    } as CrawlConfigInterface);
    const [typing, setTyping] = useState(false);
    const [tempUrl, setTempUrl] = useState(''); // Temporary URL while typing
    const [isProcessing, setIsProcessing] = useState(false);
    const [loading, setLoading] = useState(false);

    // ✅ Fetch User ID
    useEffect(() => {
        setLoading(true);
        const fetchUserId = async () => {
            try {
                const { data } = await axios.get('/api/user');
                setCrawlConfig((prev) => ({ ...prev, userId: data.id }));
            } catch (error) {
                console.error('❌ Error fetching user ID:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserId();
    }, []);

    // ✅ Start Crawling/Scraping
    const startProcessing = async () => {
        if (mode === "crawl") startCrawl();
        else startScrape();
        setIsProcessing(true);
    };
    const startScrape = async () => {
    }
    const startCrawl = async () => {
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API}/crawl/start`, crawlConfig);
            toast.success(`${mode === 'crawl' ? 'Crawling' : 'Scraping'} started! Data will be available soon.`);
        } catch (error) {
            console.error(`❌ ${mode} failed:`, error);
            toast.error(`${mode} request failed.`);
        } finally {
            setIsProcessing(false);
        }
    }

    // ✅ Clear Data
    const clearData = () => {
        setCrawlConfig({
            urls: [''],
            name: '',
            customSelector: '',
            tag: '',
            fields: [],
            sheetId: '',
            paginationMethod: PaginationMethods.NO_PAGINATION.name as keyof PaginationInterface,
            url: '',
            pages: 5,
            userId: crawlConfig.userId
        })
    };
    const handleInputChange = (key: keyof CrawlConfigInterface, value: any) => {
        setCrawlConfig((prev) => ({ ...prev, [key]: value }));
    };
    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTempUrl(e.target.value);
        setTyping(true);
    };

    return (
        <>
            <div className="p-4 max-w-3xl mx-auto bg-white rounded-lg shadow-md">
                <PaginationSettings crawlConfig={crawlConfig} setCrawlConfig={setCrawlConfig} />
                <h1 className="text-xl font-bold">{isScraper ? '🖥️ Browser Scraper' : '🌐 Smart Web Crawler'}</h1>
                <ScraperUrlInput setUrl={(newUrl) =>
                    handleInputChange('url', newUrl)
                } typing={typing} setTyping={setTyping} tempUrl={tempUrl} handleUrlChange={handleUrlChange} />

                {mode === "scrape" && (<BulkUrl crawlConfig={crawlConfig} handleInputChange={handleInputChange} />)}
                <input
                    type="text"
                    placeholder={`Enter ${mode} Name (Optional)`}
                    value={crawlConfig.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="border rounded p-2 w-full mt-3"
                />
                <input
                    type="text"
                    placeholder="Google Sheet ID (Premium Feature)"
                    value={crawlConfig.sheetId}
                    onChange={(e) => handleInputChange('sheetId', e.target.value)}
                    className="border rounded p-2 w-full mt-3"
                />

                {/* 🔹 Custom Selector & Pagination */}
                <input
                    type="text"
                    placeholder="Custom CSS Selector (optional)"
                    value={crawlConfig.customSelector}
                    onChange={(e) => handleInputChange('customSelector', e.target.value)}
                    className="border rounded p-2 w-full mt-3"
                />

                {/* 🎯 Selectors Input */}
                <div className="flex items-center mt-3 mb-4">
                    <input
                        type="text"
                        placeholder="Item You are Selecting ..(eg: Venue, Shoes, Book)"
                        value={crawlConfig.tag}
                        onChange={(e) => handleInputChange('tag', e.target.value)}
                        className="border rounded p-2 flex-grow"
                    />
                </div>

                <ScraperFields fields={crawlConfig.fields} setCrawlConfig={setCrawlConfig} />

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
            {!loading && <CrawlHistory crawlConfig={crawlConfig} setCrawlConfig={setCrawlConfig} handleUrlChange={handleUrlChange} />
        }
        </>
    );
}
